% Analyzing Data 150,000x Faster with Rust

This note documents one of my recent adventures in performance optimization with Rust. 
By following along, hopefully you'll learn something about how to write fast Rust.

Here's the context: imagine you have data from an online exam where a set of users answered a set of questions. The raw data looks like this:

```js
[
  {
    "user": "5ea2c2e3-4dc8-4a5a-93ec-18d3d9197374",
    "question": "7d42b17d-77ff-4e0a-9a4d-354ddd7bbc57",
    "score": 1
  },
  {
    "user": "b7746016-fdbf-4f8a-9f84-05fde7b9c07a",
    "question": "7d42b17d-77ff-4e0a-9a4d-354ddd7bbc57",
    "score": 0
  },  
  /* ... more data ... */
]
```

Note that each user only answered a subset of all possible questions.

Here's the problem: given a size $k$, which set of $k$ questions has the highest correlation with overall question performance? We'll call this the **k-CorrSet problem**. A simple brute-force algorithm for solving the k-CorrSet problem looks like this (pseudocode):

```text
func k_corrset($data, $k):
  for all $k-sized subsets $qs of questions in $data:
    $us = all users that answered every question in $qs
    $u_qs_scores = the total score on $qs of each user in $us
    $u_grand_scores = the grand score on $data of each user in $us
    $r = correlation($us_qs_score, $u_grand_scores)
  return $qs with maximum $r    
```

We are going to implement several variations on this algorithm to see how fast we can make it.


## Python Baseline

When I do data analysis, I usually start with Python and then transition to Rust when I need better speed or memory consumption.
So as a baseline, let's look at a straightforward [Pandas] program for solving k-CorrSet:

```python
from itertools import combinations
import pandas as pd
from pandas import IndexSlice as islice

def k_corrset(data, K):
    all_qs = data.question.unique()
    q_to_score = data.set_index(['question', 'user'])
    grand_totals = data.groupby('user').score.sum().rename('grand_total')

    corrs = []
    for qs in combinations(all_qs, K):
        qs_data = q_to_score.loc[islice[qs,:],:].swaplevel()
        answered_all = qs_data.groupby(level=[0]).size() == K
        answered_all = answered_all[answered_all].index
        qs_total = qs_data.loc[islice[answered_all,:]] \
            .groupby(level=[0]).sum().rename(columns={'score': 'qs'})
        r = qs_total.join(grand_totals).corr().qs.grand_total
        corrs.append({'qs': qs, 'r': r})
    corrs = pd.DataFrame(corrs)

    return corrs.sort_values('r', ascending=False).iloc[0].qs

data = pd.read_json('scores.json')
print(k_corrset(data, K=5))
```

This uses a bit of [MultiIndex] magic, but it's otherwise straightforward. 
So let's start benchmarking. First, we need data. To make the benchmark realistic, I generated
synthetic data that roughly matches the properties of my actual data. Some numbers:

* 60,000 users
* 200 questions
* 20% sparsity factor (i.e., 12,000 users answered each question)
* Each score is equally likely 1 or 0

Our goal will be to compute k-CorrSet on this dataset for k = 5 in a reasonable amount of time on my 2021 M1 Macbook Pro. 
Note that there are $\binom{200}{5}$ = 2,535,650,040 combinations of questions, so we need the inner loop of the brute-force algorithm to be quite fast.

Using Python's [`time.time()`] function, I computed the speed of the inner loop for 1,000 iterations running with CPython 3.9.17. 
The average execution time was **36 milliseconds**. 
Not too bad, but at this rate, the computation would complete in **2.9 years**. Let's make that faster!


## Rust Reimplementation

We can start optimizing by reimplementing the Python code into a roughly equivalent Rust program, expecting some speedups from Rust's standard optimizations.
First, we translate the data types (derives omitted):

```rust
pub struct User(pub String);

pub struct Question(pub String);

pub struct Row {
  pub user: User,
  pub question: Question,
  pub score: u32,
}
```

We make `User` and `String` into newtypes both for clarity and so we can implement traits on them.

Then, the naive k-CorrSet algorithm is implemented as follows. I won't explain every part of the code,
but if you want to see e.g. the definition of helper functions, you can check out the Github repo: 
<https://github.com/willcrichton/corrset-benchmark>

```rust
fn k_corrset(data: &[Row], k: usize) -> Vec<&Question> {
  // utils::group_by(impl Iterator<Item = (K1, K2, V)>) 
  //   -> HashMap<K1, HashMap<K2, V>>;
  let q_to_score: HashMap<&Question, HashMap<&User, u32>> = 
    utils::group_by(data.iter().map(|r| (&r.question, &r.user, r.score)));
  let u_to_score: HashMap<&User, HashMap<&Question, u32>> = 
    utils::group_by(data.iter().map(|r| (&r.user, &r.question, r.score)));
  let grand_totals: HashMap<&User, u32> = 
    u_to_score.iter().map(|(user, scores)| {
      let total = scores.values().sum::<u32>();
      (*user, total)
    })
    .collect();

  let all_qs = q_to_score.keys().copied();
  all_qs.combinations(k)
    .filter_map(|qs: Vec<&Question>| {
      let (qs_scores, grand_scores): (Vec<_>, Vec<_>) = 
        grand_totals.iter()
        .filter_map(|(u, grand_total)| {
          let total = qs.iter()
            .map(|q| q_to_score[*q].get(u).copied())
            .sum::<Option<u32>>()?;
          Some((total as f64, *grand_total as f64))
        })
        .unzip();
      // utils::correlation(&[f64], &[f64]) -> f64;
      let r = utils::correlation(&qs_scores, &grand_scores);
      (!r.is_nan()).then_some((qs, r))
    })
    .max_by_key(|(_, r)| FloatOrd(*r))
    .unwrap().0
}
```

The key elements to understand:

* Like with Python, we convert the flat data into hierarchical data with a hashmap and the `utils::group_by` helper. 
  (Note that everywhere we refer to `HashMap` is actually an alias for [`fxhash::FxHashMap`], and NOT [`std::collections::HashMap`]. 
  The `fxhash` type uses a more efficient hash algorithm.) 
* Then we iterate over all combinations of questions using the [`Itertools::combinations`] method.
* In the inner loop, we iterate over all users via `grand_totals.iter()`. 
* The expression `q_to_score[*q].get(u).copied()` has type `Option<u32>`, which is `Some(n)` if the user has a score for `q`,
  and `None` otherwise.
* The iterator method `.sum::<Option<u32>>()` returns `Some(total)` if the user answered every question, and `None` otherwise.
* We call to a helper method `utils::correlation` that implements a standard calculation for [Pearson's $r$](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient).
* We use [`FloatOrd`] to sort the inputs by their correlation.

So how's the performance? I used the [criterion] crate to benchmark the performance of the inner loop (the `filter_map`) with default settings 
on the same data as before. The new inner loop runs in **4.9 milliseconds**, which is about 7 times faster than the Python baseline! 
But our full computation is still 143 days, which is too long. Now let's start really optimizing.


## Indexed Data

Rather than guess how to optimize the code, let's run a profiler to see where the bottleneck is. On my Mac, I usually use [Instruments.app], but
recently I tried [samply] and wow! it's much nicer to use. It seems to work better with Rust both in terms of symbol demangling and in terms of tracking 
the call stack even with inlined functions. Here's a screenshot of the relevant part of the samply trace for the current Rust algorithm:

![](img/profile-naive.png)

We're spending 75% of our time in `HashMap::get`! This is the offending line of code:

```rust
q_to_score[*q].get(u).copied()
```

The problem is that we're hashing and comparing 36-byte strings, which is expensive.
We need a smaller type that can stand-in for the question/user strings.
The solution is that we will collect all the questions and users into a `Vec`, and represent
each question/user by their index that `Vec`. We could just use `usize` indices with the `Vec` type, but a better practice is to use newtypes to represent each kind of index. In fact, this problem comes up so often in my work that I've already made a crate for it, [indexical]. We define those index types like this:

```rust
pub struct QuestionRef<'a>(pub &'a Question);
pub struct UserRef<'a>(pub &'a User);

define_index_type! {
  pub struct QuestionIdx for QuestionRef<'a> = u16;
}

define_index_type! {
  pub struct UserIdx for UserRef<'a> = u32;
}
```

The `QuestionRef` and `UserRef` types are newtypes that enable us to implement traits on `&Question` and `&User`. The `define_index_type` macro creates new index types `QuestionIdx` and `UserIdx` which are associated with `QuestionRef` and `UserRef`. Those indices are represented as `u16` and a `u32`, respectively. 

Finally we update `k_corrset` to generate an [`IndexedDomain`] for questions and users, 
and then use the `QuestionIdx` and `UserIdx` types throughout the rest of the code:

```rust
fn k_corrset(data: &[Row], k: usize) -> Vec<&Question> {
  // first, we create the `IndexedDomain` questions and users
  let (questions_set, users_set): (HashSet<_>, HashSet<_>) = data.iter()
    .map(|row| (QuestionRef(&row.question), UserRef(&row.user)))
    .unzip();
  let questions = IndexedDomain::from_iter(questions_set);
  let users = IndexedDomain::from_iter(users_set);

  // then we create the same data structures as before, 
  // except using `IndexedDomain::index` to lookup indices
  let q_to_score: HashMap<QuestionIdx, HashMap<UserIdx, u32>> = 
    utils::group_by(data.iter().map(|r| (
      questions.index(&(QuestionRef(&r.question))),
      users.index(&(UserRef(&r.user))),
      r.score,
    )));
  let u_to_score: HashMap<UserIdx, HashMap<QuestionIdx, u32>> = 
    utils::group_by(data.iter().map(|r| (
      users.index(&(UserRef(&r.user))),
      questions.index(&(QuestionRef(&r.question))),
      r.score,
    )));  
  let grand_totals = // same code

  let all_qs = questions.indices();
  all_qs.combinations(k)
    .filter_map(|qs: Vec<QuestionIdx>| {
      // same code
    })
    .max_by_key(|(_, r)| FloatOrd(*r))
    .unwrap()
    .0
    // we have to post-process the indices back to values
    .into_iter()
    .map(|idx| questions.value(idx).0)
    .collect()
}
```

Again, check out the [GitHub](https://github.com/willcrichton/corrset-benchmark/blob/main/src/inner/indexed.rs) for the complete implementation, and check out the [indexical docs][indexical] for details on its API.

Once again we run our benchmark on the inner loop of the computation. The new inner loop runs in **1.0 milliseconds**, which is 5 times faster than our last iteration, and 36 times faster than our Python baseline. We're down to 29 days for the total computation &mdash; let's keep going!


## Indexed Vectors

Let's profile again:

![](img/profile-indexed.png)

Blast, still spending most our time in `HashMap::get`. Well, what if we got rid of hash maps altogether? A `HashMap<&User, u32>` is conceptually the same thing as a `Vec<u32>` where each `&User` has a unique index. Rather than using a plain `Vec`, we can use the [index_vec] crate (conveniently designed to work with [indexical]) which provides an `IndexVec<I, T>` type of a 
vector of `T` indexed by `I`. Then our indexing should be hash-free!

The main change is that we convert all our auxiliary data structures to indexed vectors:

```rust
fn k_corrset(data: &[Row], k: usize) -> Vec<&Question> {
  // build the `users` and `questions` domains same as before

  let empty_vec: IndexVec<UserIdx, Option<u32>> =
    IndexVec::from_iter(users.indices().map(|_| None));
  let mut q_to_score: IndexVec<QuestionIdx, IndexVec<UserIdx, Option<u32>>> = 
     IndexVec::from_iter(questions.indices().map(|_| empty_vec.clone()));
  for r in data {
    let (q_idx, u_idx) = (
      questions.index(&QuestionRef(&r.question)), 
      users.index(&UserRef(&r.user))
    );
    q_to_score[q_idx][u_idx] = Some(r.score);
  }

  let grand_totals: IndexVec<UserIdx, u32> = users.indices()
    .map(|user| q_to_score.iter().filter_map(|v| v[user]).sum::<u32>())
    .collect::<IndexVec<_, _>>();

  let all_qs = questions.indices();
  all_qs.combinations(k)
    // almost the same code, see below
}
```

The only change to the inner loop is that our code which used to say this:

```rust
q_to_score[*q].get(u).copied()
```

Is now this:

```rust
q_to_score[*q][u]
```

Running the benchmark again, the new inner loop runs in **185 microseconds**, which is 5 times faster than our last iteration, and 194 times faster than our Python baseline. We're down to 5.4 days for the total computation.


## Bounds Checks

Another small performance hit comes every time we use the brackets `[]` to index into an `IndexVec`.
The vector will run a bounds-check for safety, but our code is guaranteed to never exceed vector
bounds as written. I couldn't actually find the bounds check in the samply profile, but it does make a noticeable difference in the benchmark, so it's worth implementing.

Before our inner loop looked like this:

```rust
let total = qs.iter()
  .map(|q| self.q_to_score[*q][u])
  .sum::<Option<u32>>()?;
let grand_total = self.grand_totals[u];
```

Removing bounds checks with [`slice::get_unchecked`], our new inner loop looks like this:

```rust
let total = qs.iter()
  .map(|q| unsafe {
    let u_scores = self.q_to_score.raw.get_unchecked(q.index());
    *u_scores.raw.get_unchecked(u.index())
  })
  .sum::<Option<u32>>()?;
let grand_total = unsafe { *self.grand_totals.raw.get_unchecked(u.index()) };
```

Because we are now indexing into the raw `Vec` beneath the `IndexVec`, we have to explicitly cast from our index types into their underlying `usize`.

Running the benchmark again, the new inner loop runs in **162 microseconds**, which is 1.14 times faster than our last iteration, and 222 times faster than our Python baseline. We're down to 4.8 days for the total computation.

## Bit-sets

We're sitting at 222 times faster, which means we still have three orders of magnitude left to go. 
To get there, we need to rethink the computational structure of the inner loop. Right now, our loop effectively looks like:

```text
for each subset of questions $qs:
  for each user $u:
    for each question $q in $qs:
      if $u answered $q: add $u's score on $q to a running total
      else: skip to the next user
    $r = correlation($u's scores on $qs, $u's grand total)
```

An important aspect of our data is that it forms a *sparse* matrix. For a given question, only 20% of users have answered that question. For a set of 5 questions, a much smaller fraction have answered all 5 questions. So if we can efficiently determine first which users have answered all 5 questions, then our subsequent loop will run for fewer iterations (and be free of branches). Something like this:

```text
for each subset of questions $qs:
  $qs_u = all users who have answered every question in $qs
  for each user $u in $qs_u:
    for each question $q in $qs:
      add $u's score on $q to a running total
    $r = correlation($u's scores on $qs, $u's grand total)
```

So how do we represent the set of users who have answered a given question? We could use a [`HashSet`], but we saw earlier that hashing is computationally expensive. Because our data is indexed, we can use a more efficient data structure: the [bit-set], which uses the individual bits of memory to represent whether an object is present or absent in a set. Conveniently, [indexical] provides an abstraction to bridging bit-sets with our newtype indices: the [`IndexSet`].

Previously, our `q_to_score` data structure mapped from questions to a user-indexed vector of optional scores (that is, `IndexVec<UserIdx, Option<u32>>`). Now we will add an additonal field for each
question: the set of users who answered that question. The first half of the updated code:

```rust
let empty_vec: IndexVec<UserIdx, u32> = 
  IndexVec::from_iter(users.indices().map(|_| 0));
let empty_set: IndexSet<UserRef<'_>> = IndexSet::new(&users);
let mut q_to_score: IndexVec<QuestionIdx, (IndexVec<UserIdx, u32>, IndexSet<UserRef<'_>>)> =
  IndexVec::from_iter(questions.indices()
    .map(|_| (empty_vec.clone(), empty_set.clone())));
for r in data {
  let (q_idx, u_idx) = (
    questions.index(&QuestionRef(&r.question)),
    users.index(&UserRef(&r.user)),
  );
  let (scores, set) = &mut q_to_score[q_idx];
  scores[u_idx] = r.score;
  set.insert(u_idx);
}
```

Then we update our inner loop to match the pseudocode:

```rust
let all_qs = questions.indices();
all_qs.combinations(k)
  .filter_map(|qs: Vec<QuestionIdx>| {
    // Compute the intersection of the user-sets for each question
    let mut users = q_to_score[qs[0]].1.clone();
    for q in &qs[1..] {
      users.intersect(&q_to_score[*q].1);
    }

    let (qs_scores, grand_scores): (Vec<_>, Vec<_>) = users.indices()
      // only .map, not .filter_map as before
      .map(|u| {
        let total = qs.iter()          
          .map(|q| unsafe {
            let (u_scores, _) = q_to_score.raw.get_unchecked(q.index());
            *u_scores.raw.get_unchecked(u.index())
          })
          // only u32, not Option<u32> as before
          .sum::<u32>();
        let grand_total = unsafe { *grand_totals.raw.get_unchecked(u.index()) };
        (total as f64, grand_total as f64)
      })
      .unzip();
    let r = utils::correlation(&qs_scores, &grand_scores);
    (!r.is_nan()).then_some((qs, r))
  })
  // rest of the code is the same
```

Running the benchmark again, the new inner loop runs in **47 microseconds**, which is 3.9 times faster than our last iteration, and 765 times faster than our Python baseline. We're down to 1.4 days for the total computation.


## SIMD

Our new computational structure is definitely helping, but it's still not fast enough. Let's check back in with samply:

![](img/profile-bitset.png)

Now we're spending all our time in the bit-set intersection! That means we need to dig in to how the bit-set is implemented. The default bit-set library used by indexical is [bitvec]. As of 2023, the implementation of intersection within bitvec's bit-set is roughly:

```rust
fn intersect(dst: &mut BitSet, src: &BitSet) {
  for (n1, n2): (&mut u64, &u64) in dst.iter_mut().zip(&src) {
    *n1 &= *n2;
  }
}
```

So bitvec is and-ing a `u64` at a time. But it turns out most processors have instructions specifically for doing bit-manipulation on multiple `u64`s at a time, called [SIMD] (single instruction, multiple data). Thankfully, Rust provides an experimental SIMD API [`std::simd`] that we can use. Roughly speaking, the SIMD version of bit-set intersection looks like this:

```rust
fn intersect(dst: &mut SimdBitSet, src: &SimdBitSet) {
  for (n1, n2): (&mut u64x4, &u64x4) in dst.iter_mut().zip(&src) {
    *n1 &= *n2;
  }
}
```

The only difference is that we've replaced our primitive types with SIMD types like [`u64x4`], and
under the hood, Rust emits a single SIMD instruction to perform the `&=` operation.

Where can we find a SIMD-accelerated bitset? [bitvec] doesn't support SIMD. 
There are a few on [crates.io], and I tried out one called [bitsvec]. 
It works well for fast intersection,
but I found that its iterator which finds the indices of the 1-bits is actually quite slow.
So I copied large portions of the bitsvec implementation and wrote a more efficient iterator, which
you can check out in the [indexical source][indexical-simd] if you're curious.

Thanks to indexical's abstractions, swapping in the SIMD bitset only required changing a type alias and no other modifications to the `k_corrset` function. I experimented with different lane sizes and found `u64x16` is the most efficient on my machine for this dataset.

Once more we run the benchmark, and the new inner loop runs in **1.38 microseconds**, which is 34 times faster than our last iteration, and 26,086 times faster than our Python baseline. We're down to 58 minutes for the total computation.


## Allocation

At this point, we're pretty close to peak performance. (You may not like it, but...) Let's go back to the profile, this time looking at the inverted view:

![](img/profile-simd.png)

The biggest bottleneck is our bit-set iterator! I wasn't joking! But we see several concerning functions: `memmove`, `realloc`, `allocate` &mdash; that's right, we're allocating memory in the inner loop of this function. Specifically, there's the user bit-set that we initially clone, and there's the two vectors for `total` and `grand_total` that we allocate with `unzip`.

To avoid allocation, we create these data structures up front with the maximum possible size needed, and then repeatedly write into them:

```rust
// Allocate our data up front
let mut totals = vec![0.; users.len()]
let mut grand_totals = vec![0.; users.len()];
let mut user_set = IndexSet::new(&users);

let all_qs = questions.indices();
all_qs.combinations(k)
  .filter_map(|qs| {
    // Use `clone_from` rather than `clone` to copy without allocation
    user_set.clone_from(&q_to_score[qs[0]].1);
    for q in &qs[1..] {
      user_set.intersect(&q_to_score[*q].1);
    }

    let mut n = 0;
    for (i, u) in user_set.indices().enumerate() {
      let total = qs.iter()
        .map(|q| unsafe {
          let (u_scores, _) = q_to_score.raw.get_unchecked(q.index());
          *u_scores.raw.get_unchecked(u.index())
        })
        .sum::<u32>();
      let grand_total = unsafe { *grand_totals.raw.get_unchecked(u.index()) };

      // Update totals/grand_totals in-place rather than pushing into a vector
      unsafe {
        *totals.get_unchecked_mut(i) = total as f64;
        *grand_totals.get_unchecked_mut(i) = grand_total as f64;
      }

      n += 1;
    }

    // Only pass in the first `n` elements!
    let r = utils::correlation(&totals[..n], &grand_totals[..n]);
    (!r.is_nan()).then_some((qs, r))
  })
```

We run the benchmark again, and the new inner loop runs in **1.10 microseconds**, which is 1.25 times faster than our last iteration, and 32,727 times faster than our Python baseline. We're down to 46 minutes for the total computation.

(As an aside, it's impressive that the heap allocator was fast enough to have such a small impact on our runtime!)


## Parallelism

At this point, we seem to have totally exhausted our avenues for optimization. I actually can't think of any other ways to make the inner loop substantively faster &mdash; let me know if you have any ideas. But we've left out one final, obvious trick: parallelism! This problem is embarassingly parallel, so we can trivially parallelize the inner loop over multiple cores. [Rayon] makes this a breeze:

```rust
let all_qs = questions.indices();
all_qs.combinations(k)
  .par_bridge()
  .map_init(
    || (vec![0.; users.len()], vec![0.; users.len()], IndexSet::new(&users)),
    |(totals, grand_totals, user_set), qs| {
      // same code as before
    })
    // same code as before
```

The `par_bridge` method takes a serial iterator and converts it into a parallel iterator. The `map_init` function is a parallel map with thread-specific state, so we preserve our allocation-free status.

We need a different benchmark to evaluate the outer loop. I used Criterion to run the outer loop over 5,000,000 question combinations in a single run with a given strategy. This is enough executions to reveal differences in each outer loop without waiting weeks for the benchmark to complete.

Running this benchmark with the serial strategy over the fastest inner loop takes **8.2 seconds**. My Macbook Pro has 10 cores, so with Rayon we should expect to see close to a 10x speedup. After benchmarking the parallel strategy, we get... **4.6 seconds** to complete 5,000,000 combinations. That's only a 1.8x speedup! Shameful!


## Batching

Let's go back to the profile to investigate our lack of scaling:

![](img/profile-parallel.png)

Our threads are spending most of their time locking and unlocking a mutex! There's some kind of synchronization bottleneck. Indeed, if we read the [`par_bridge` documentation] carefully, we'll find a key sentence:

> Iterator items are pulled by `next()` one at a time, synchronized from each thread that is ready for work, so this may become a bottleneck if the serial iterator can’t keep up with the parallel demand. 

It seems that the hand-off between the `Itertools::combinations` iterator and the Rayon parallel bridge is too slow. Given that we have a huge number of combinations, a simple way to avoid this bottleneck is to increase the granularity of task assignment. That is, we can batch together many question combinations and pass them off to a thread all at once.

For this task, I defined a quick-and-dirty batching iterator that uses an [`ArrayVec`] to avoid allocation.

```rust
pub struct Batched<const N: usize, I: Iterator> {
  iter: I,
}

impl<const N: usize, I: Iterator> Iterator for Batched<N, I> {
  type Item = ArrayVec<I::Item, N>;

  #[inline]
  fn next(&mut self) -> Option<Self::Item> {
    let batch = ArrayVec::from_iter((&mut self.iter).take(N));
    (!batch.is_empty()).then_some(batch)
  }
}
```

Then we modify our outer loop by batching the combinations iterator, and modify the inner loop to iterate/flatten each batch:

```rust
let all_qs = questions.indices();
all_qs.combinations(k)
  .batched::<1024>()
  .par_bridge()
  .map_init(
    || (vec![0.; users.len()], vec![0.; users.len()], IndexSet::new(&users)),
    |(totals, grand_totals, user_set), qs_batch| {
      qs_batch
        .into_iter()
        .filter_map(|qs| {
          // same code as before
        })
        .collect_vec()
    })
    .flatten()
    // same code as before
```

Running the outer-loop benchmark again, the chunking iterator now completes 5,000,000 combinations in **1.15 seconds**. This is a 7.13x seedup over the serial approach, which is much better for our 10-core machine.


## Conclusion

So how far did we come? The original Python program was going to take 2.9 years to complete at k=5. Our final Rust program only takes **10 minutes** on the same  dataset. That is roughly a **150,000x speedup**. A summary of the key optimizations:

* Use Rust's compiler optimizations.
* Use indices over strings instead of the strings themselves.
* Use (indexed) vectors instead of hashmaps.
* Use bit-sets for efficient membership tests.
* Use SIMD for efficient bit-sets.
* Use multi-threading to split the work over many cores.
* Use batching to avoid a bottleneck at work distribution.

Can we do better? Let's take one last look at the profile:

![](img/profile-batched.png)

We're spending 38% of our time in the bit-set iterator, and 36% of our time in the bit-set intersection. Another 12% in copying the initial bit-set for a given set of questions. And a long tail of other operations like computing the correlation.

I tried my best to make the SIMD bit-set implementation fast, so I don't know of a way to improve these numbers. We might find another +10% speedup from careful tweaking of the various constants (lane size, batch size, etc.), but I don't think there's another order of magnitude left on the table. If you know of a way, I invite you to try it out:<br> <https://github.com/willcrichton/corrset-benchmark>

Also if you know of an analytic solution to this problem, i.e., a smarter way to get an optimal answer without brute force, do let me know as well! Otherwise, I hope you learned a bit about performance engineering in Rust.


[Pandas]: https://pandas.pydata.org/
[MultiIndex]: https://pandas.pydata.org/docs/user_guide/advanced.html
[`time.time()`]: https://docs.python.org/3/library/time.html#time.time
[`fxhash::FxHashMap`]: https://docs.rs/fxhash/latest/fxhash/type.FxHashMap.html
[`std::collections::HashMap`]: https://doc.rust-lang.org/stable/std/collections/struct.HashMap.html
[`Itertools::combinations`]: https://docs.rs/itertools/latest/itertools/trait.Itertools.html#method.combinations
[`FloatOrd`]: https://docs.rs/float-ord/latest/float_ord/struct.FloatOrd.html
[criterion]: https://bheisler.github.io/criterion.rs/book/index.html
[samply]: https://github.com/mstange/samply/
[Instruments.app]: https://en.wikipedia.org/wiki/Instruments_(software)
[indexical]: https://docs.rs/indexical/
[index_vec]: https://docs.rs/index_vec/
[rustc_index]: https://doc.rust-lang.org/nightly/nightly-rustc/rustc_index/index.html
[`IndexedDomain`]: https://docs.rs/indexical/latest/indexical/struct.IndexedDomain.html
[`slice::get_unchecked`]: https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked
[`HashSet`]: https://doc.rust-lang.org/std/collections/struct.HashSet.html
[bit-set]: https://en.wikipedia.org/wiki/Bit_array
[`IndexSet`]: https://docs.rs/indexical/latest/indexical/struct.IndexSet.html
[bitvec]: https://docs.rs/bitvec/
[SIMD]: https://en.wikipedia.org/wiki/Single_instruction,_multiple_data
[`std::simd`]: https://doc.rust-lang.org/std/simd/index.html
[`u64x4`]: https://doc.rust-lang.org/std/simd/type.u64x4.html
[crates.io]: https://crates.io
[bitsvec]: https://github.com/psiace/bitsvec
[indexical-simd]: https://github.com/willcrichton/indexical/blob/main/src/impls/simd.rs
[Rayon]: https://github.com/rayon-rs/rayon
[`par_bridge` documentation]: https://docs.rs/rayon/latest/rayon/iter/trait.ParallelBridge.html
[`ArrayVec`]: https://docs.rs/arrayvec/latest/arrayvec/struct.ArrayVec.html