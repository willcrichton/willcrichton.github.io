---
layout: post
title: Implementing a Type-safe printf in Rust
abstract: >-
    I show how to use heterogeneous lists and traits to implement a type-safe printf in Rust. These mechanisms can ensure that two variadic argument lists share important properties, like the number of format string holes matches the number of printf arguments.
---

_Part of an ongoing series about type-level programming in Rust. Consider reading [part one](http://willcrichton.net/notes/type-level-programming/) first! All code in this note can be found in [this gist](https://gist.github.com/willcrichton/e7fcf1b0e84b4be7f172f0e0245cf149)._

Rust has a great printf function, [`println!`](https://doc.rust-lang.org/std/macro.println.html). It has a rich formatting language, but also catches mistakes at compile-time. For example, `println!` will check that the number of arguments matches the number of holes in the format string:

```
error: 2 positional arguments in format string, but there is 1 argument
  --> src/printf.rs:36:13
   |
36 |   println!("{} {}", "Hello");
```

How does the Rust compiler make this check? Because both the format string and the argument are within the macro, Rust will check that the number of holes matches the number of arguments. Consequently, format strings _have_ to be within the macro. If we write:

```rust
let s = "{} {}";
println!(s, "hi")
```

This code fails to compile with the error:

```
error: format argument must be a string literal
  --> src/printf.rs:42:12
   |
42 |   println!(s, "hi");
```

I'll show you how to implement type-safe printf without using procedural macros. More generally, this note contains a Rust recipe for functions where:

1. Arguments are variadic
2. Each argument can be a different type (`Vec<T>` not allowed)
3. Multiple variadic inputs share a parallel property, e.g. the number of arguments should match the number of format holes

## Core mechanism: HList

First, we need to understand the main type-level mechanism: a heterogeneous list (or H-list). An H-list is a sequence of values of potentially different types. For example, `[1, "a", true]` is an H-list, but not a valid Rust vector. H-lists are implemented in Rust using a linked-list style:

```rust
struct HNil;
struct HCons<Head, Tail> {
  head: Head,
  tail: Tail
}

let example: HCons<i32, HCons<bool, HNil>> =
  HCons{head: 1, tail: HCons{head: true, tail: HNil}};
```

The key idea is that the type of an H-list changes every time you make a change to it. By contrast, if you push to a `Vec<T>`, the type of the vector stays the same.

Just like Rust has `vec![]`, we can use the [frunk](https://github.com/lloydmeta/frunk#hlist) crate to get an `hlist!` macro.

```rust
let example = hlist![1, true]; // same as above
```

## Setting up printf

Let's go back to the ingredients of printf. We need a format string and an argument list. The key idea is to represent both with an H-list, and carefully use Rust's traits to ensure our desired property: the number of arguments should match the number of holes.

First, to represent format strings, we will have a sequence of structs that represent each part of the string.

```rust
pub struct FString(&'static str);
pub struct FVar;

// Assume that we compile "Hello {}! The first prime is {}" into this code.
// That would be a simple syntactic transformation.
let example = hlist![
  FString("Hello "), FVar, FString("! The first prime is "), FVar
];
```

To represent arguments, we will use a matching H-list of values. For example:

```rust
let args = hlist!["world", 2];
```

Then, our goal is to create a function `format` such that this is true:

```rust
assert_eq!(
  example.format(args),
  "Hello world! The first prime is 2"
);
```

And this should be a compile-time (NOT run-time) error:

```rust
example.format(hlist!["Only one arg"]);
```

## The Format trait

In the spirit of type-level computation, we start by defining a trait.

```rust
trait Format<ArgList> {
  fn format(&self, args: ArgList) -> String;
}
```

Here, `self` is the H-list of the format directives, and `ArgList` is the H-list of the variadic arguments. `Format` need to take `ArgList` as a type parameter, because its type will change as we remove elements from the `ArgList` list.

Now, we proceed to implement the `Format` trait by cases. First, the base case for reaching the end of the format list `HNil`:

```rust
impl Format<HNil> for HNil {
  fn format(&self, _args: HNil) -> String {
    "".to_string()
  }
}
```

This impl says that when we reach the end of a format list, just return the empty string. And the only argument we will accept is an empty argument list. Combined with the next impls, this inductively ensures that extra arguments are not accepted.

Next, we will implement `FString`. This implementation should use the string constant contained in the `FString` struct, and combine it recursively with the rest of the format list. We don't use variadic arguments for `FString`, so they get passed along. In Rust, this English specification becomes:

```rust
impl<ArgList, FmtList> Format<ArgList>
for HCons<FString, FmtList>
where FmtList: Format<ArgList>
{
  fn format(&self, args: ArgList) -> String {
    self.head.0.to_owned() + &self.tail.format(args)
  }
}
```

Note that we have to add `FmtList: Format<ArgList>` to ensure the recursive call to `self.tail.format` works. Also note that we aren't implementing `Format` directly on `FString`, but rather on an H-list containing `FString`.

Finally, the most complex case, `FVar`. We want this impl to take an argument from the `ArgList`, then format the remaining format list with the remaining arguments.

```rust
impl<T, ArgList, FmtList> Format<HCons<T, ArgList>>
for HCons<FVar, FmtList>
where
  FmtList: Format<ArgList>,
  T: ToString,
{
  fn format(&self, args: HCons<T, ArgList>) -> String {
    args.head.to_string() + &self.tail.format(args.tail)
  }
}
```

Be careful to observe which H-list is being accessed by `head` and `tail`. Here, the `args` H-list provides the data to fill the hole via `args.head`.

## Checking our properties

With this implementation, our correct example successfully compiles and runs:

```rust
let example = hlist![
  FString("Hello "), FVar, FString("! The first prime is "), FVar
];
assert_eq!(
  example.format(hlist!["world", 2]),
  "Hello world! The first prime is 2"
);
```

What about our incorrect example? If we write this:

```rust
example.format(hlist!["just one arg"]);
```

This code fails to compile with the error:

```
error[E0308]: mismatched types
  --> src/printf.rs:48:18
   |
48 |   example.format(hlist!["just one arg"]);
   |                  ^^^^^^^^^^^^^^^^^^^^^^
   |                  expected struct `Cons`, found struct `HNil`
   |
   = note: expected struct `HCons<_, HNil>`
              found struct `HNil`
```

While the error is enigmatic, our mistake is at least correctly caught at compile-time. This is because Rust deduces that `example.format()` expects an H-list of the shape `HCons<_, HCons<_, HNil>>`, but it finds `HNil` too soon in our 1-element H-list. A similar error occurs when providing too many args.

Stupendous! We have successfully implemented a type-safe printf using H-lists and traits.

## Extending our abstraction

Right now, our `Format` function just checks that the format list and argument list are the same length. We could extend our format structures, for example to ensure that an `FVar` must be a particular type, or must use `Debug` vs. `Display`. Here's the sketch of such a strategy:

```rust
use std::marker::PhantomData;

// Add flags for whether using Display or Debug
pub struct FDisplay;
pub struct FDebug;

// Use a type parameter with PhantomData to represent the intended type
pub struct FVar<T, Flag>(PhantomData<(T, Flag)>);

// Now, T has to be the same between the format list and arg list
// Also, FDisplay flag requires that `T: Display`
impl<T, ArgList, FmtList> Format<HCons<T, ArgList>>
for HCons<FVar<T, FDisplay>, FmtList>
where
  FmtList: Format<ArgList>,
  T: Display,
{
  fn format(&self, args: HCons<T, ArgList>) -> String {
    // using format! is cheating, but you get the idea
    format!("{}", args) + &self.tail.format(args.tail)
  }
}

// Similar impl for `T: Debug` when `FDebug` is used
```

With this approach, if our format list and arg list differ in type:

```rust
let fmt = hlist![FString("n: "), FVar::<i32, FDisplay>(PhantomData)];
fmt.format(hlist!["not a number"]);
```

Then the code will not compile with the error, `&'static str is not i32`.

Shout-out to [this blog post](https://www.servant.dev/posts/2018-07-12-servant-dsl-typelevel.html) from Haskell's servant framework which got me thinking about adapting their strategy into Rust.
