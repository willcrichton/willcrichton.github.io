---
layout: post
title: Naming Conventions That Need to Die
abstract: >-
    Names are an important tool of thought. They provide a loose, lightweight way to manage and structure knowledge. However, bad names inhibit learning and impede progress. We should root out and destroy the processes that lead to bad names.
---

## 1. Inventors.

This one is first, because it is the most widespread disease afflicting the naming process in science and math.

* **[Inequalities](https://en.wikipedia.org/wiki/Category:Inequalities)**: Cauchy-Schwartz inequality, Grothendieck inequality, Lubell–Yamamoto–Meshalkin inequality, etc.
* **[Constants](https://en.wikipedia.org/wiki/Category:Fundamental_constants)**: Planck constant, Avogadro constant, Boltzmann constant, etc.
* **[Theorems](https://en.wikipedia.org/wiki/List_of_theorems)**: just scroll through the linked page. Seriously.
* **[Distributions](https://en.wikipedia.org/wiki/List_of_probability_distributions)**: Bernoulli distribution, Poisson distribution, Gaussian distribution, etc.
* Misc: Jacobian matrices, Lagrange multipliers, Markov chains (and Markov chain Monte Carlo), etc.

Look, I'm all for recognizing the people who make contributions to math and science. But **don't let them (or others) name their discoveries after the discoverer.** That comes at the expense of every person thereafter who needs to use the created/discovered concept. We already have Nobel Prizes, Turing Awards, etc. to commemorate these achivements.

A good name should communicate the essence of an underlying idea, usually through a few carefully-picked nouns and adjectives. For example, breadth-first search and depth-first search are wonderfully informative. If we called them "[Zuse's](https://en.wikipedia.org/wiki/Konrad_Zuse) method" and the "[Tremaux](https://en.wikipedia.org/wiki/Tr%C3%A9maux_tree) approch", that communicates literally nothing about the methods unless I'm already a science historian who knows the respective fields of each inventor.

Recently, I've been re-learning a lot of probability basics, and I'm constantly reminded how many missed opportunities we have to communicate intuitions through names. A positive example is the Gaussian distribution---names like "normal distribution" convey its natural utility (in describing many natural phenomena) and "bell curve" convey its shape. By contrast, "Dirichlet distribution" is uninformative, but with no alternatives. How about "sum-to-1 distribution?" Or for the beta distribution, how about "unit-bounded distribution?" Or Bernoulli distribution as "coin-flip distribution?"

More broadly, knowledge should be constructed compositionally. If we only have to remember a few core pieces, and then can understand concepts by combining them in different ways, that's a pretty efficient process for our brains. By contrast, human-name-based labels are effectively a random, unique identifier that we just have to remember, adding to a long list of completely unrelated identifiers. That knowledge is unstructurable, as the names "Maxwell", "Bernoulli", "Jacobian" have no common basis, no shared terms, no reasonable decomposition.

So please, don't name stuff after yourself.

## 2. Numbers.

Few names make my blood boil as much as "Type 1 error" and "Type 2 error." Rarely in the history of human progress have such awful names been adopted so widely than in hypothesis testing. Imagine, if you will, a programmer submitting this code for review:

```rust
enum MemoryError {
  Type1,
  Type2
}

fn malloc_safe(n: usize) -> Result<*mut usize, MemoryError> {
  if system_out_of_memory() {
    Err(MemoryError::Type1)
  } else if n == 0 {
    Err(MemoryError::Type2)
  } else {
    Ok(malloc(n))
  }
}
```

This person would get laughed out of the building. Why would you call these `Type1` and `Type2` when they clearly could be `OutOfMemory` and `ZeroSizeAlloc`? Yet somehow, when [eminent statisticians do this](https://en.wikipedia.org/wiki/Type_I_and_type_II_errors#Etymology), that becomes precedent for a century. Imagine how many statistics students have tried to memorize what "type 1" and "type 2" mean, spending wasted time mapping useless terms to their actual meaning.

**Just use false positive and false negative.** This is a perfect example of how a compositional basis for terminology (i.e. (false \| true) (positive \| negative)) lower the barrier to reconstructing the term's meaning. Even still, I usually have to pause and think when someone says "false negative" to both understand what kind of error, and how to contextualize it in their use case. But if they said "type 1 error", I would be completely lost.

Dishonorable mention here to [graph quadrants](https://en.wikipedia.org/wiki/Quadrant_(plane_geometry)). Is "top right" that hard? Hilarious mention to [separation axioms](https://en.wikipedia.org/wiki/Separation_axiom) (thanks [@twitchard](https://twitter.com/twitchard/status/1063911697667231746)) whose indexing includes $$T_{2\frac{1}{2}}$$.

## 3. Random words.

Can you imagine putting so little thought into naming something that your name is indistinguishable from the output of a random name generator? Would you do that to your company? Your child?

Yet, we do it to software all the time. I invite you to browse the list of [Apache Projects](https://projects.apache.org/projects.html). Pig, Flink, Spark, Hive, Arrow, Kafka. If humans cannot pass a [Pokemon-equivalent Turing test](https://pixelastic.github.io/pokemonorbigdata/), your system is poorly named.

Here, I think the big danger is exclusion. If you're having a conversation with someone about big data technologies for your company, and your CTO wants to listen in, phrases like "yeah we just have to hook up our Airflow into GCP Dataflow with a Kafka broker so our logs can get Flumed" will exclude them from the conversation. By contrast, if you use phrases like "message queue", "cache", "data processor," someone can get the gist of the conversation without knowing the specific technologies.

To my understanding, this also happens in government (and in particular the military) a lot with acronyms. An acronym is effectively the same as a random word, so you have to be in-the-know to hold a conversation with others in the department.

## 4. Historical accidents.

Accidents happen. We pick a bad name in the heat of the moment, and then are forced to live with that mistake for reasons of backwards compatibility. However, we should clearly identify such mistakes, and discourage their usage where possible in the future. Regardless of what you think about the [redis debate](https://github.com/antirez/redis/issues/5335), new systems today probably shouldn't use the term "master-slave" when plenty of other options exist.

Yet, one phenomenon I have never understood is the propensity of Lisp users to continue using [car and cdr](https://en.wikipedia.org/wiki/CAR_and_CDR). Head and tail. Left and right. There are many sensible, well-known ways to access elements of a pair or a list. The only reason Lisp originally adopted "car" and "cdr" is due to the design of 1950s (!) hardware:

> The 704 and its successors have a 36-bit word length and a 15-bit address space. These computers had two instruction formats, one of which, the Type A, had a short, 3-bit, operation code prefix and two 15-bit fields separated by a 3-bit tag. The first 15-bit field was the operand address and the second held a decrement or count. The tag specified one of three index registers. Indexing was a subtractive process on the 704, hence the value to be loaded into an index register was called a "decrement". The 704 hardware had special instructions for accessing the address and decrement fields in a word. As a result it was efficient to use those two fields to store within a single word the two pointers needed for a list. Thus, "CAR" is "Contents of the Address part of the Register". The term "register" in this context refers to "memory location".

Today? Racket's [Beginning Student](https://docs.racket-lang.org/htdp-langs/beginner.html) language still uses `car` and `cdr`... for beginning students. (Including the many wonderful derivations: [`caaar`](https://docs.racket-lang.org/htdp-langs/beginner.html#%28def._htdp-beginner._%28%28lib._lang%2Fhtdp-beginner..rkt%29._caaar%29%29), [`cadddr`](https://docs.racket-lang.org/htdp-langs/beginner.html#%28def._htdp-beginner._%28%28lib._lang%2Fhtdp-beginner..rkt%29._cadddr%29%29), [`cdddr`](https://docs.racket-lang.org/htdp-langs/beginner.html#%28def._htdp-beginner._%28%28lib._lang%2Fhtdp-beginner..rkt%29._cdddr%29%29), and so forth.) This is recommended usage of the language. If I had to guess, I think usage of these words persists because it forms an in-group of Lisp programmers "in the know" who use this archaic terminology. That's why they can still make jokes like [my other car is a cdr](http://cs.gettysburg.edu/~tneller/cs341/carcdr/IMG_4849.JPG).

(Update: [person who teaches Racket says they don't emphasize car/cdr](https://twitter.com/samth/status/1063953595652104192), so this may be less applicable to Racket then.)

This is, of course, bad. It's a barrier to entry for novices, it harms readability for people porting over knowledge from other languages, and it generally encourages a culture of bad names. Let's learn from our mistakes and make names more accessible, memorable, and understandable to everyone.

Be an active reader! Shoot me an email at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu) or leave a comment on [Hacker News](https://news.ycombinator.com/item?id=18477891).
