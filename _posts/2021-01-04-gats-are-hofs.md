---
layout: post
title: Generic associated types encode higher-order functions on types
abstract: >-
    GATs allow type parameters to associated types in traits. This feature enables total type-level functions to be associated to structs. I show how to use this pattern to implement higher-order type-level functions, and how to use specialization to make partial functions into total functions.
---

_Part of an ongoing series about type-level programming in Rust. Read [part one](http://willcrichton.net/notes/type-level-programming/) first!<br />_

With [generic associated types](https://github.com/rust-lang/rfcs/blob/master/text/1598-generic_associated_types.md) landing recently in Rust nightly, I've been wondering: what expressive power does this feature add to type-level programming? The answer is **higher-order functions on types**, and in this post I'll explain what that means and how it works.

## A refresher on type-level programming

Using a pure functional programming style, we can define objects like a list of types. For example, using [tyrade](https://github.com/willcrichton/tyrade), my type-level programming language:

```rust
tyrade! {
  enum TList {
    TNil,
    TCons(Type, TList)
  }

  enum TOption {
    TNone,
    TSome(Type)
  }

  // Get the Nth item from the list, where Index is either Z or S<N>
  fn Nth<List, Index>() {
    match List {
      TNil => TNone,
      TCons(X, XS) => match Index {
        Z => TSome(X),
        S(IMinusOne) => Nth(XS, IMinusOne)
      }
    }
  }
}

fn main() {
  // checks that Nth([i32, f32], 1) == Some(f32)
  assert_type_eq::<
    Nth<TCons<i32, TCons<f32, TNil>>, S<Z>>,
    TSome<f32>
  >();
}
```

The `tyrade!` procedural macro compiles the pseudo-Rust notation into a series of structs, traits, and impls. For example:

```rust
pub struct TNil;
pub struct TCons<T0, T1>(...);

pub trait ComputeNth<Index> {
    type Output;
}
pub type Nth<List, Index> = <List as ComputeNth<Index>>::Output;

impl<Index> ComputeNth<Index> for TNil {
    type Output = TNone;
}
impl<X, XS> ComputeNth<Z> for TCons<X, XS>
where X: ComputeTSome {
    type Output = TSome<X>;
}
impl<IMinusOne, X, XS> ComputeNth<S<IMinusOne>> for TCons<X, XS>
where XS: ComputeNth<IMinusOne> {
    type Output = Nth<XS, IMinusOne>;
}
```

> See my explainer on [type-level programming](https://willcrichton.net/notes/type-level-programming/) if you are confused about the correspondence between these programs.

## Higher-order functions on types

For me, Tyrade is a explicit representation of my mental model for type-level programming. Once I conceptually understood the correspondences between type-level enums and structs, or between type-level functions and traits, then I reified that understanding into the Tyrade compiler.

However, trait/function correspondence only worked when the arguments to type-level functions were types. To explain, we'll use the running example of a list map function. The goal is to write it in Tyrade like this:

```rust
tyrade! {
  fn Map<List, Func>() {
    match List {
      TNil => TNil,
      TCons(X, XS) => TCons(Func(X), Map(XS, Func))
    }
  }
}
```

Then we could use the `Map` type function like this:

```rust
tyrade! {
  fn TIsZero<N>() {
    match N {
      Z => TTrue,
      S(N1) => TFalse
    }
  }
}

fn main() {
  assert_type_eq::<
    Map<
      TCons<Z, TCons<S<Z>, TNil>>,
      TIsZero
    >,
    TCons<TTrue, TCons<TFalse, TNil>>
  >();
}
```

However, the existing translation of `Map` doesn't work. It would become:

```rust
pub trait ComputeMap<Func> {
  type Output;
}
pub type Map<List, Func> = <List as ComputeMap<Func>>::Output;

impl<Func> ComputeMap<Func> for TNil {
  type Output = TNil;
}
impl<X, XS, Func> ComputeMap<Func> for TCons<X, XS>
where XS: ComputeMap<Func> {
  type Output = TCons<Func<X>, Map<XS, Func>>;
}
```

And this code fails to compile because `Func` can't be invoked with a parameter:

```
error[E0109]: type arguments are not allowed for this type
    |
    |     type Output = TCons<Func<X>, Map<XS, Func>>;
    |                              ^ type argument not allowed
```

Herein lies the crux of the issue: type variables (i.e. impl quantifiers) are only allowed to be of kind `type`, and not of kind `type -> type`. To get higher-order type functions, we need Rust to support higher-kinded types (HKT). While Rust doesn't support HKT directly, the addition of generic associated types (GATs) enables a pseudo-HKT pattern. See [Niko's extended discussion](http://smallcultfollowing.com/babysteps/blog/2016/11/03/associated-type-constructors-part-2-family-traits/) for the gory details.

## Implementing HOFs with HKTs with GATs

`TIsZero` cannot be passed directly into `ComputeMap`, so the key idea is to create a proxy object `TIsZeroProxy` which can be passed in. Using GATs, we associate the `TIsZeroProxy` back to `TIsZero` in a way that can be referenced within `ComputeMap`. First, the proxy:

```rust
pub trait FuncProxy {
  type Func<T>;
}

pub struct TIsZeroProxy;
impl FuncProxy for TIsZeroProxy {
  type Func<T> = TIsZero<T>;
}
```

Then the implementation of `ComputeMap` can be parameterized by any type implementing `FuncProxy`:

```rust
impl<X, XS, Proxy> ComputeMap<Proxy> for TCons<X, XS>
where
  Proxy: FuncProxy,
  XS: ComputeMap<Proxy>
{
  type Output = TCons<Proxy::Func<X>, Map<XS, Proxy>>;
}
```

However, this attempt still doesn't quite work. We get an error in the implementation of `FuncProxy` for `TIsZeroProxy`:

```
error[E0277]: the trait bound `T: ComputeTIsZero` is not satisfied
    |
    |   type Func<T> = TIsZero<T>;
    |   ^^^^^^^^^^^^^^^^^^^^^^^^ the trait `ComputeTIsZero` is not implemented for `T`
    |
```

Why do we get this? Recall that `TIsZero<T>` is an alias for `<T as ComputeTIsZero>::Output`. This means that `T` must implement the `ComputeTIsZero` trait, which isn't guaranteed by our general `FuncProxy` trait definition. We could theoretically change `FuncProxy` to include this bound, something like:

```rust
trait FuncProxy {
  type Func<T: ComputeTIsZero>;
}
```

However, our goal is for `Map` to take as input any type-level function. This definition of `FuncProxy` would restrict the implement to only functions mentioned in the trait bounds.

## Dealing with partial functions

Let's back up to understand the conceptual issue. In Rust, type-level functions are partial functions, meaning they may not be implemented for all types. For example, `TIsZero` is only implemented for the types `Z` and `S<N>`, but not e.g. for the type `String`. However, to define `Map`, we have to ensure that `Proxy::Func<X>` is defined for all `X` in a type list.

Previously, we could ensure this condition via a trait bound. For example, if `Proxy::Func` was `ComputeTIsZero`, then we could add `X: ComputeTIsZero` to the implementation. But for any generic `Proxy::Func`, there is no way to say `X: Proxy::Func` because `Proxy::Func` is a type, not a trait. Hypothetically, if Rust supported [associated traits](https://github.com/rust-lang/rfcs/issues/2190), we could do something like:

```rust
trait FuncProxy {
  trait Func { type Output; };
}

impl FuncProxy for TIsZeroProxy {
  trait Func = ComputeTIsZero;
}

type CallProxy<Proxy, T> = <T as Proxy::Func>::Output;

impl<X, XS, Proxy> ComputeMap<Proxy> for TCons<X, XS>
where
  Proxy: FuncProxy,
  XS: ComputeMap<Proxy>,
  X: Proxy::Func
{
  type Output = TCons<CallProxy<Proxy, X>, Map<XS, Proxy>>;
}
```

However, Rust doesn't have such a feature. Instead, we can use [specialization](https://github.com/rust-lang/rust/issues/31844) to make all type functions total. We can define a base case where a type function returns an error if it's not implemented, but as a type rather than a compiler error. To compile `TIsZero`, this solution looks like:

```rust
pub struct Error;

pub trait FuncProxy {
  type Func<T>;
}

pub trait ComputeTIsZero {
  type Output;
}

type TIsZero<T> = <T as ComputeTIsZero>::Output;

impl ComputeTIsZero for Z {
  type Output = TTrue;
}

impl<N> ComputeTIsZero for S<N> {
  type Output = TFalse;
}

/* key addition */
impl<T> ComputeTIsZero for T {
  default type Output = Error;
}

struct TIsZeroProxy;
impl FuncProxy for TIsZeroProxy {
  type Func<T> = TIsZero<T>;
}
```

With this addition, the `TIsZeroProxy` implementation no longer errors, because `ComputeTIsZero` is guaranteed to be implemented for all types `T`. And now, at long last, our `Map` program will execute correctly if we replace `TIsZero` with `TIsZeroProxy`:

```rust
fn main() {
  assert_type_eq::<
    Map<
      TCons<Z, TCons<S<Z>, TNil>>,
      TIsZeroProxy
    >,
    TCons<TTrue, TCons<TFalse, TNil>>
  >();
}
```

> Note: as of January 2021, this pattern is theoretically sound, but seems to have ongoing performance or correctness issues in the compiler. Specialization combined with recursive trait bounds will occassionally cause the compiler to stack overflow  --- see my [Github issue](https://github.com/rust-lang/rust/issues/80700).

## Dynamically-kinded type-level programming

To add support for higher-order type functions, I had to remove support for type annotations (actually kind annotations) from Tyrade. Previously, you could write functions like this:

```rust
tyrade! {
  fn TIsZero(N: TNum) -> TBool {
    match N {
      Z => TTrue,
      S(N1 @ TNum) => TFalse
    }
  }
}
```

This program would compile into the trait definition:

```rust
trait ComputeTIsZero: TNum {
  type Output: TBool;
}
```

This ensures, for example, that a function's return value matches its return kind. If you wrote a function with a mismatch:

```rust
tyrade! {
  fn TIsZero(N: TNum) -> TBool {
    Z
  }
}
```

Then the compiler raises an error at the point of _definition_ for `TIsZero` rather than the point of _use_. Hence, this language is statically-kinded. However, to kind-check a higher-order function like `Map`, we need a polymorphic kind system. Ideally, we could write in Tyrade:

```rust
tyrade! {
  fn Map<A, B>(L: List<A>, F: A -> B) -> List<B> {
    ...
  }
}
```

I don't believe it's possible to encode this concept into Rust's trait system. So to add higher-order functions, our type-level programming language had to become dynamically-kinded. A sad trade-off, but perhaps more acceptable for type-level programming than value-level. Although errors are caught by the users and not the definers, at least they're still caught at compile-time!
