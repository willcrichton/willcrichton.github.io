---
title: "Defeating Coherence in Rust with Tacit Trait Parameters"
description: A strategy for working around Rust's rules that prevent overlapping trait implementations.
date: August 29, 2024
author: Will Crichton
---

Rust enforces a concept called [*coherence*](https://doc.rust-lang.org/reference/items/implementations.html#trait-implementation-coherence) to avoid ambiguities in trait resolution. Coherence codifies the common knowledge that Rust disallows conflicting trait implementations, like this:

```rust
trait Noise {
  fn make_noise(&self);
}

struct Cat;

impl Noise for Cat {
  fn make_noise(&self) {
    println!("meow");
  }
}

impl Noise for Cat {
// error: ^^^^^^^^ conflicting implementation for `Cat`
  fn make_noise(&self) {
    println!("MRRROOOOOOW");
  }
}
```

However, sometimes an API *wants* to violate coherence. To my knowledge, the most common case is when handling functions. Say you want to implement a trait for functions of different numbers of parameters, like this:

```rust
impl<T0, F> Noise for F where F: Fn(T0) {
  /* ... */
}

impl<T0, T1, F> Noise for F where F: Fn(T0, T1) {
  /* ... */
}
```

As a real world example, this shows up in [Axum's `Handler` trait](https://docs.rs/axum/latest/axum/handler/trait.Handler.html) and [Bevy's `SystemParamFunction` trait](https://docs.rs/bevy/0.14.1/bevy/ecs/prelude/trait.SystemParamFunction.html). But if you use a straightforward trait definition, you'll get a compiler error like this:

```
error[E0207]: the type parameter `T0` is not constrained by the impl trait, 
              self type, or predicates
```

The purpose of this note is to document a workaround to this problem, and the general concept of working around coherence.

## Tacit trait parameters

The basic idea is to introduce a trait parameter which prevents two implementations from conflicting. It looks like this:

```rust
trait Noise<M> {
  fn make_noise(&self);
}

struct Quiet;
struct Loud;

struct Cat;

impl Noise<Quiet> for Cat {
  fn make_noise(&self) {
    println!("meow");
  }
}

impl Noise<Loud> for Cat {
  fn make_noise(&self) {
    println!("MRRROOOOOOW");
  }
}
```

I characterize the trait parameter `M` as <q>tacit</q> because it's intended to be inferred from context. `M` seems to be the canonical name used for tacit parameters by crates like Bevy and Axum. That's because it stands for "marker," but "marker traits" already [mean something else in Rust](https://doc.rust-lang.org/std/marker/index.html), so I'm using a different term.

From Rust's perspective, `Noise<Quiet>` and `Noise<Loud>` are different traits, and so these implementations do not conflict (i.e., they are coherent). However, you don't often see APIs designed like this because it requires API clients to disambiguate which implementation they're using. If you try this:

```rust
fn main() {
  Cat.make_noise();
}
```

Then you will get this compiler error:

```
error[E0283]: type annotations needed
  --> src/main.rs:23:7
   |
23 |   Cat.make_noise();
   |       ^^^^^^^^^^
   |
note: multiple `impl`s satisfying `Cat: Noise<_>` found
   [...]
```

To compile, you would need to write an ugly [fully-qualified](https://doc.rust-lang.org/reference/expressions/call-expr.html#disambiguating-function-calls) path like this:

```rust
fn main() {
  <Cat as Noise<Quiet>>::make_noise(&Cat);
}
```

## Disambiguating tacit parameters

To avoid this issue (as Axum and Bevy do), you have to carefully design your impl blocks such that an implementation can always be disambiguated from context. Concretely, imagine implementing `Noise` for functions like this:

```rust
impl<T0, F> Noise<(T0,)> for F where F: Fn(T0) {
  fn make_noise(&self) {
    todo!()
  }
}

impl<T0, T1, F> Noise<(T0, T1,)> for F where F: Fn(T0, T1) {
  fn make_noise(&self) {
    todo!()
  }
}
```

The key observation is that the tacit trait parameter is a tuple of the function's parameters. Therefore functions of a given type always have a *unique* tacit parameter, unlike the case of `Cat` which has two possible tacit parameters (`Loud` and `Quiet`). This way, we can call `make_noise` with no errors:

```rust
fn main() {
  let dog = |n: usize| { println!("{}", "BARK".repeat(n)); }
  dog.make_noise();
}
```

This code compiles! Of course, it panics at the `todo!()` because we haven't described how to generate a `usize` to provide to the function. Frameworks like Axum and Bevy use this pattern when these values exist in a global store which can be injected on-demand into callbacks. That implementation detail is beyond the scope of this post, but I cover something similar in my note [<q>Types Over Strings: Extensible Architectures in Rust</q>](https://willcrichton.net/notes/types-over-strings/).

## Alternative applications

I haven't seen any other uses of tacit trait parameters out in the wild. It seems like a feature to use carefully. Coherence is generally a good idea and should not be worked around lightly. We don't want to rely on type inference too heavily.

One interesting case is where having conflicting implementations for the same `Self` type, like `Noise<Quiet>` and `Noise<Loud>` would make for a fluent API. I imagine that it could work when you have some kind of context which always disambiguated the tacit trait parameter. For instance, imagine if we had a `PetList` which always held quiet or loud pets:

```rust
struct PetList<M, T> {
  pets: Vec<T>,
  _marker: PhantomData<M> // needed to satisfy rustc
}

impl<M, T: Noise<M>> PetList<M, T> {
  fn new() -> Self {
    PetList { 
      pets: Vec::new(),
      _marker: PhantomData
    }
  }

  fn push(&mut self, pet: T) {
    self.pets.push(pet);
  }
  
  fn everyone_is_yapping(&self) {
    for pet in &self.pets {
      pet.make_noise();
    }
  }
}

fn main() {
  // Specify `Loud` once up front, and never again!
  let mut pets: PetList<Loud, Cat> = PetList::new();
  pets.push(Cat);
  pets.everyones_yapping();
}
```

Let me know if you have any concrete examples of APIs like this! Email me at [crichton.will@gmail.com](mailto:crichton.will@gmail.com).