---
layout: post
title: Automatic Type Coercions with Procedural Macros in Rust
abstract: I briefly demonstrate how to use procedural macros to automatically perform type coercion in Rust, mimicking the behavior of dynamic languages.
---

As an eminently lazy Rust programmer, I often take one too many shortcuts. For example, the other day I was writing a function that takes as input a string.

```rust
fn foo(s: String) -> ... {}
```

Except I frequently invoked this function with a variety of things that turned into strings, including `&str`, `i32`, and other types, so much that I was frequently invoking the [`ToString`](https://doc.rust-lang.org/std/string/trait.ToString.html) trait. So I thought, why not move this into the API?

```rust
fn foo<S: Into<String>>(s: S) -> ... {
  let s: String = s.into();
  ...
}
```

Then I started thinking, how far can we take this pattern? Because the [`.into()`](https://doc.rust-lang.org/std/convert/trait.Into.html) function relies on Rust's trait resolution to figure out what type to coerce into, it feels kind of like a dynamically typed language. For example, here's a function that concatenates two strings:

```rust
fn concat<T1: Into<String>, T2: Into<String>>(t1: T1, t2: T2) -> String {
  let t1: String = t1.into();
  let t2: String = t2.into();
  t1 + &t2
}

fn main() {
  println!("{}, {}",
    concat("A", "B"),
    concat(1, "Hello".to_string()));
  // prints "AB, 1Hello"
}
```

At this point, it's clear that on the implementation side, this API style requires a fair amount of boilerplate. We can abstract that away through a procedural macro!

```rust
#[auto_into]
fn concat(t1: String, t2: String) -> String {
  t1 + &t2
}
```

[See here](https://gist.github.com/willcrichton/d49783efee8366d6de110e1960279544) for the barebones macro implementation (nightly required). This is cool because, in a sense, it makes your API strictly more general than before. Any calls that were valid before are still valid after `#[auto_into]`, except now you can pass any values which could be coerced into the desired input types.

That said, is this a good idea? Probably not in the general case, since implicit type coercions are a scary source of bugs, particularly for a language like Rust that errs on the side of explicitness. But it's a neat pattern enabled by the trait system that could be used for more practical designs, e.g. a student in my Programming Languages course used a similar idea to implement a fluent API for [dependency injection](http://cs242.stanford.edu/assets/projects/2017/diamondm-mvilim.pdf) in Rust.
