---
layout: post
title: Compiling Knowledge into Probabilistic Models
abstract: >-
    Turning procedural and structural knowledge into programs has established methodologies, but what about turning knowledge into probabilistic models? I explore a few examples of what such a process could look like.
---

<div style="display: none">
$$
\newcommand{\dataset}{\mathcal{D}}
\newcommand{\count}[1]{\#\ \text{#1}}
\newcommand{\bern}{\text{Bernoulli}}
\DeclareMathOperator*{\argmax}{arg\!\max}
$$
</div>

In programming, compilation is about translating between equivalent representations of things. For example, gcc (the C compiler) takes a C program, a representation of a thing your computer should do, and translates it into an assembly program, also a representation of a thing your computer should do, just in a language the computer actually understands. Ideally, those two programs are "equivalent" in the sense that the C specification defines a behavior for how the C program should work, and the computer executes the assembly in a manner consistent with the spec.

Unbeknownst to the compiler, a second kind of compilation occurs behind the scenes: from a C programmer's mental model of their program into the C program. For example, if I think "I need to loop through this array and print each element", then that translates into:

```c
int array[N] = { ... };
for (int i = 0; i < N; ++i) {
  printf("%d\n", array[i]);
}
```

Again, there are two representations: the mental model and the textual C program, which the programmer wants to be equivalent, but may not be if they wrote a typo, or don't know how C works, or have an incorrect expectation of how C works[^1]. And a final kind of compilation occurs when a programmer translates from their mental model of the problem being solved into a "programmatic" mental model of the solution, e.g. formulating an algorithm, designing a system, and so on. For example, if my problem is to sum the elements of an array, I can compile this into a C/systems/low-level/imperative programmatic model[^2]:

> Make a temporary sum variable and index. Write a for loop that iterates over the array. Get the i-th element and add into the sum.

Which then "compiles" into C:

```c
int array[N] = { ... };
int sum = 0;
for (int i = 0; i < N; ++i) {
  sum += array[i];
}
```

I could also compile this into an OCaml/functional/declarative programmatic model:

> Reduce the list with a sum operator.

```ocaml
let arr = [...] in
let sum = List.reduce (+) arr
```

This kind of commonplace "knowledge compilation" characterizes what I'll call procedural knowledge, i.e. verbs or actions, how to actually do something in a domain, usually in the form of a function or code fragment. Programmers also frequently compile ontological (or structural) knowledge, i.e. nouns or objects, how a domain is structured, usually in the form of a type or class definition. For example, if two distinct quantities are related, like the x/y of a 2D point, this is programmatically a product type, e.g. a struct in C:

```c
struct point_t { float x; float y; }
```

Or a record (or tuple) in OCaml:

```ocaml
type Point = { x : float; y : float; }
type PointTuple = float * float
```

If one quantity is dependent upon another, then we need a function type:

```ocaml
type Time = float
type PointGenerator = Time -> Point
```

If an entity is made up of categories, then we need a sum type (or variant, or tagged union):

```ocaml
type Chart = Scatter of Point list | Pie of float list | ...
```

These are all examples of identifying structure within a domain and encoding that structure, that ontology, into a program so that we may structure our remaining program around it. Programming languages offer an ontological toolbox of functions, products, sums, lists, and so on that we programmers adapt to a given domain.

While some programmers learn these skills implicitly through writing many programs, we have more resources than ever today on explicit methodologies for compiling knowledge into programs. For example, _[How to Design Programs](https://www.htdp.org/2019-02-24/)_ is a great introductory CS textbook that explains a methodology for designing programs around data types.

## Rich in methods, poor in methodologies

If such methodologies exist for general-purpose programming, do they exist for probabilistic modeling? Given a probabilistic mental model of a domain, how can I compile that model into an executable program? Over the last two quarters at Stanford, I took Stefano Ermon's course on [probabilistic graphical models](https://cs228.stanford.edu/) and Noah Goodman's course on [cognitive science through probabilistic programming](https://cocolab.stanford.edu/psych204-fall2018.html) seeking such enlightenment. While the path to nirvana was not neatly laid out before me, I have seen an ephemeral glimpse at a brighter future.

At their core, I think probabilistic models offer two fundamental capabilities: reasoning under uncertainty, and learning from data. One form of uncertainty arises from nondeterminism, i.e. some input to your problem changes in ways not fully predictable, e.g. Google modeling search inputs from people, or NASA modeling noisy communications from space probes. Probability theory has a rich standard library of models (e.g. Bernoulli, Gaussian, Poisson, ...) with mathematical properties that make them easy to use programmatically in modeling sources of noise/nondeterminisim.

Another kind of uncertainty is incomplete information. Even in a system that's fully deterministic, if a function is not bijective, then it can be impossible to reconstruct events only knowing partial information about inputs, outputs and intermediates. The standard example from a probability textbook is that if you wake up in the morning to see your lawn is wet, did it rain or did your sprinkler turn on? Probabilistic models offer the ability to explicitly represent these situations and answer these questions by marginalizing out unknown information.

Moreover, these models can permit [nonmonotonic reasoning](https://en.wikipedia.org/wiki/Non-monotonic_logic), i.e. my conclusion can change after seeing more evidence. For example, I might assume my sprinkler turned on because that happens more often than rain, but if I go outside and the roof is wet, then that suggests rain was the true culprit---adding information changed my conclusion.

Lastly, probabilistic models provide an explicit formalism for bridging domain knowledge and domain data. For example, if I know the causal structure of a domain, I can represent that as a graphical model: either rain or a sprinkler caused my lawn to get wet. The parameters (probability lawn is wet given rain or given sprinkler, and baseline probability of rain and sprinkler) can then be learned from the data. Parameters can also be augmented with human knowledge through priors in a Bayesian learning setup. In the general-purpose programming context, imagine if you could give examples of a program output (domain data) along with a skeleton of a program (source file with incomplete parts) and ask a system to fill in the holes. This kind of program synthesis task fits well as a probabilistic model.

## Example knowledge compilations

To concretize these points, I'll show a few examples of compiling knowledge into probabilistic models.

**Example:** I have a fair coin.

**General case:** Something happens with two possible outcomes, or an object has two possible categories. Each outcome/category is equally likely.

**Mathematical model:**

$$\text{CoinFlip} \sim \bern(p = 0.5)$$

<hr />

**Example:** I have an unfair 6-sided dice, where the first side is rolled 50% of the time, and the rest 10%.

**General case:** Something happens with N possible outcomes, and each outcome can have a different probability.

**Mathematical model:**

$$\text{DiceRoll} \sim \text{Categorical}(\theta = \{0.5, 0.1, 0.1, 0.1, 0.1, 0.1\})$$

<hr />

**Example:** I have a 6-sided dice, and I think that one of the sides is biased, but I'm not sure which.

**General case:** Something happens with N possible outcomes, and one outcome is more likely than the rest.

**Mathematical model:**

$$
\begin{align*}
\text{DicePrior} &\sim \text{Dirichlet}(\alpha = \{0.5, 0.5, 0.5, 0.5, 0.5, 0.5\}) \\
\text{DiceRoll} &\sim \text{Categorical}(\theta = \text{DicePrior})
\end{align*}
$$

<hr />

**Example:** The higher my GPA, the more likely I'll get into college.

**General case:** The probability of an event is correlated with a real-valued outcome, with an expected positive correlation.

**Mathematical model:**

$$
\begin{align*}
\text{GPAWeight} &\sim \mathcal{N}(\mu = 1, \sigma = 0.5) \\
\text{Accepted} &\sim \text{Bernoulli}\left(p = \cfrac{1}{1 + \exp(-(\text{GPAWeight} * \text{GPA}))}\right)
\end{align*}
$$

<hr />

These are all examples of structural/ontological probabilistic knowledge, i.e. they describe the shape of a situation with uncertainty. Next, let's look at procedural probabilistic knowledge, i.e. how to answer questions against these models.

**Example:** If 5 people with GPA 3.0 and 10 people with GPA 4.0 got accepted, what's the most suitable parameters for GPA weight?

**General case:** What parameters best explain the dataset, i.e. maximize the probability of all data under the model?

**Mathematical model:**

$$
\hat{\mu}, \hat{\sigma} = \argmax_{\mu, \sigma} \prod_{(\text{acc}, \text{gpa}) \in \dataset} P_{\mu,\sigma}(\text{Accepted} = \text{acc}, \text{GPA} = \text{gpa})
$$

<hr />

**Example:** If someone was accepted to college, what was their most likely GPA?

**General case:** Given observations, what values for unknown data maximize the joint probability under the model?

**Mathematical model:**

$$
\hat{\text{gpa}} = \argmax_{\text{gpa}} P(\text{GPA} = \text{gpa} \mid \text{Accepted} = \text{yes})
$$

<hr />

Both of these questions, parameter learning and conditional inference, are still answered at a high level of abstraction. From my impression taking the graphical models course, a lot of work in practice is picking the right method to accomplish a particular task, e.g. doing inference with exact ([variable elimination](https://ermongroup.github.io/cs228-notes/inference/ve/), [belief propagation](https://ermongroup.github.io/cs228-notes/inference/jt/)) vs. approximate methods ([MCMC](https://ermongroup.github.io/cs228-notes/inference/sampling/), [variational inference](https://ermongroup.github.io/cs228-notes/inference/variational/)). These methods also have hyperparameters that need to be carefully tuned, e.g. mixing time for MCMC, or variational family for variational inference.[^3]

Regardless, it seems to me that the the act of compiling knowledge into probabilistic models is still more art than science. At best, we are left to learn from [repositories of examples](http://forestdb.org/) and to try to back out a methodology accordingly. That's quite inefficient! And as we hurtle towards a data-driven world where more and more programmers are likely to need probabilistic models as a part of their daily routine, we ought to invest more in developing explicit techniques for probabilistic knowledge compilation. The examples given here are just a seed of an idea, but who knows, maybe a _How to Design Probabilistic Programs_ textbook could be just around the corner.

[^1]: For example, if I thought arrays in C were 1-indexed, then I could translate my goal into a C program that's consistent with my expectations, but will not execute as I expect because of my misunderstanding. That's a different kind of bug then if I accidentally 1-indexed and didn't mean to.

[^2]: Entertainingly, some old psychology of programming literature cite this kind of an example as the way "all experienced programmers" would decompose the problem. Sheil, B. A. “The Psychological Study of Programming.” ACM Computing Surveys, 1981.

[^3]: Worth noting that the [industrial-strength probabilistic programming frameworks](http://pyro.ai/) focus mostly on variational inference, suggesting that for models of real-world scale, approximate methods are necessary for computational feasibility.
