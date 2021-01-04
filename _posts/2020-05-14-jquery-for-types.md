---
layout: post
title: jQuery, but for types
abstract: >-
    Using type-level programming, I show how to use a jQuery-like selector language to perform updates on nested types in Rust.
---

_Part of an ongoing series about type-level programming in Rust. Read [part one](http://willcrichton.net/notes/type-level-programming/) first!<br />All code in this note is available on GitHub: [willcrichton/tquery](https://github.com/willcrichton/tquery)_

When doing type-level programming, sometimes our types become quite large, which can make them unwieldy to work with. In this note, we're going to develop a library of _type selectors_ to perform accesses and updates on deeply nested types.

As a real world example, we're going to look at the state machine underlying Java's [ResultSet API](http://www.cs.cmu.edu/~jssunshi/pubs/thesis-extras/PlaiddocResultSet.html) for handling database query outputs. The linked documentation contains the full description, but here's a brief ASCII diagram summarizing the state.

```
                                                                  |‾InvalidRow
                                                |‾CurrentRow----OR-|_ValidRow-----OR-|‾NotYetRead
                             |‾Position------OR-|                                    |_Read
                             |                  |_InsertRow-----OR-|‾Inserting
ResultSet---OR-|‾Open----AND-|                                     |_Inserted
               |             | Concurrency---OR-|‾ReadOnly
               |             |                  |_Updatable
               |             |_Direction-----OR-|‾Scrollable
               |                                |_ForwardOnly
               |_Closed
```

To encode this diagram in Rust with typestate, each branch of an "OR" is a unique struct, and each branch of an "AND" is a type parameter to a struct.

```rust
// obligatory PhantomData are omitted
struct ResultSet<SetState>;

struct Open<Position, Concurrency, Direction>;
struct Closed;

struct CurrentRow<CRowState>;
struct InsertRow<InsState>;

struct ValidRow<VRowState>;
struct InvalidRow;

struct Read;
struct NotYetRead;

struct Inserting;
struct Inserted;

struct Concurrency<CcState>;
struct ReadOnly;
struct Updatable;

struct Direction<DirState>;
struct Scrollable;
struct ForwardOnly;
```

Here's an example of a possible state of the result set.

```rust
ResultSet<
  Open<
    CurrentRow<ValidRow<Read>>,
    ReadOnly,
    ForwardOnly>>
```

This is a large type! It contains a lot of information. It's like a struct, but with types instead of values.

To see how large types can be hard to work with, let's try to implement the [next](http://www.cs.cmu.edu/~jssunshi/pubs/thesis-extras/PlaiddocResultSet.html#next()) method for the ResultSet. This method requires the `ResultSet` to be in the `CurrentRow` state. Then it either returns `NotYetRead` if successfully moving to the next row, or `InvalidRow` otherwise. We can write the `impl` like this:

```rust
impl<CRowState, Concurrency, Direction>
ResultSet<Open<CurrentRow<CRowState>, Concurrency, Direction>> {
  pub fn next(mut self)
    -> Result<
      ResultSet<Open<CurrentRow<ValidRow<NotYetRead>>,
                Concurrency, Direction>>,
      ResultSet<Open<CurrentRow<InvalidRow>,
                Concurrency, Direction>>
    > {
    ...
  }
}
```

Whew, that's a lot of characters for a return type! Contrast this with the concision of the ResultSet documentation:

![](/images/assets/tquery-1.png)

Intuitively, the difference is that the documentation only references a _change_, i.e. the part of the ResultSet state that was modified as a result of `next()`. By contrast, our Rust code has to spell out the entire type each time, even though e.g. `Concurrency` and `Direction` are the same.

Ideally, we'd have some way of describing these kinds of surgical updates to a type in Rust. Think about it like a struct. What if I could write this:

```rust
type RS = ResultSet<Open<CurrentRow<CRowState>, Concurrency, Direction>;
RS.SetState.Position.CRowState = InvalidRow;
```

That kind of nested mutation on a struct works perfectly fine for values, but we don't have an equivalent notation for types. Another way to think about it is as a _language of selectors_. In JavaScript, you can use jQuery to access an arbitrary part of the DOM tree:

```javascript
$('#result-set .set-state .position .c-row-state').html(
  '<div class="InvalidRow" />'
);
```

Let's do that, but for types!

## Accessing individual types

First, we need some way of reading and writing to the sub-pieces of a type. For example, `Open<P, C, D>` is essentially a tuple with three components. I want an API that looks like:

```rust
Get<Open<P, C, D>, 0> = P
Get<Open<P, C, D>, 2> = D
Set<Open<P, C, D>, 1, T> = Open<P, T, D>
```

Using our [type operators](http://willcrichton.net/notes/type-level-programming/) pattern, we can encode this idea through traits.

```rust
pub trait ComputeGetType<Idx> { type Output; }
pub type GetType<T, Idx> = <T as ComputeGetType<Idx>>::Output;

pub trait ComputeSetType<Idx, NewT> { type Output; }
pub type SetType<T, Idx, NewT> = <T as ComputeSetType<Idx, NewT>>::Output;
```

Using the [typenum](https://docs.rs/typenum/1.12.0/typenum/) crate for type-level numbers (e.g. `U0`, `U1`, ...), we can implement these traits for e.g. the `Open` type.

```rust
impl<P, C, D> ComputeGetType<U0> for Open<P, C, D> { type Output = P; }
impl<P, C, D> ComputeGetType<U1> for Open<P, C, D> { type Output = C; }
impl<P, C, D> ComputeGetType<U2> for Open<P, C, D> { type Output = D; }

impl<P, C, D, T> ComputeSetType<U0, T> for Open<P, C, D> {
  type Output = Open<T, C, D>;
}
impl<P, C, D, T> ComputeSetType<U1, T> for Open<P, C, D> {
  type Output = Open<P, T, D>;
}
impl<P, C, D,T > ComputeSetType<U2, T> for Open<P, C, D> {
  type Output = Open<P, C, T>;
}
```

This translation is fairly mechanical, so we can implement it with a custom derive. I won't go into the details, but you can find a proof-of-concept [here](https://github.com/willcrichton/tquery/blob/master/tquery-derive/src/lib.rs).

```rust
#[derive(TQuery)]
struct Open<Position, Concurrency, Direction>;
```

Now, we can use our getter/setter type operators. For example:

```rust
GetType<Open<P, C, D>, U1> = C
```

## Traversing nested types

Next, we need the ability to apply multiple getters/setters to a nested type. Ultimately, my goal is to implement a type operator `UpdateCurrentRow` that traverses the `ResultSet` three layers down to change `CurrentRow`. For example:

```rust
type UpdateCurrentRow<RS, T> = ???
type RS2 = UpdateCurrentRow<
  ResultSet<Open<CurrentRow<S>, C, D>>,
  T>;
RS2 == ResultSet<Open<CurrentRow<T>, C, D>>
```

Think about traversing a nested tuple in Rust. It looks like this:

```rust
let t = (((0, 1), 2, 3), 4);
assert!(((t.0).0).1 == 1);
assert!(t.1 == 4);
assert!((t.0).2 == 3);
```

> This code would, of course, be extremely bad style in practice. But when we're in type-land, we don't get to live a life of luxury.

Similarly for the ResultSet, I will represent the type traversal as a list of indices.

```rust
type UpdateCurrentRow<RS, T> =
  Replace<RS, (U0, (U0, (U0, ()))), T>;
```

Now our challenge is to implement the `Replace` operator. It should take as input a type, a selector, and a new type to replace at the location of the selector. Before looking at the gory Rust code, consider a simple implementation in OCaml-style:

```ocaml
let rec replace (t1 : type) (sel : int list) (t2 : type) =
  match sel with
  | [] -> t2
  | (n :: sel') ->
    let t2' = replace (type_get t1 n) sel' t2 in
    type_set t1 n t2'
```

To replace a type, we recursively iterate over the selector list. In the base case, we return the replacing type. In the inductive case, we get the N-th type from `t1`, then recurse with the remaining selector `sel'`. We place this updated type back into its context in `t1` using `type_set`.

To lower this code into a Rust type operator, we first define the trait as usual:

```rust
pub trait ComputeReplace<Selector, Replacement> { type Output; }
pub type Replace<T, Selector, Replacement> =
  <T as ComputeReplace<Selector, Replacement>>::Output;
```

The base case is fairly simple:

```rust
impl<Replacement, T> ComputeReplace<(), Replacement> for T {
  type Output = Replacement;
}
```

The inductive case is a little crazy though:

```rust
impl<Sel, SelList, Replacement, T>
  ComputeReplace<(Sel, SelList), Replacement> for T
where
  T: ComputeGetType<Sel>,
  GetType<T, Sel>: ComputeReplace<SelList, Replacement>,
  T: ComputeSetType<Sel, Replace<GetType<T, Sel>, SelList, Replacement>>
{
  type Output = SetType<
    T, Sel,
    Replace<
      GetType<T, Sel>, SelList, Replacement>>;
}
```

Again, this code makes most sense when placed in correspondence with the OCaml program. The `type Output` section describes the actual computation. The `where` bound is is necessary to make the computation possible.

With this type operator in place, our `UpdateCurrentRow` alias now works as planned! Bringing this back to the original problem, we can rewrite the `next()` type signature:

```rust
type UpdateCurrentRow<RS, T> =
  Replace<RS, (U0, (U0, (U0, ()))), T>;

impl<S, C, D> ResultSet<Open<CurrentRow<S>, C, D>> {
  pub fn next(mut self) ->
    Result<
      UpdateCurrentRow<Self, ValidRow<NotYetRead>>,
      UpdateCurrentRow<Self, InvalidRow>
    >
  {
    panic!()
  }
}
```

Note that the wonderful implicit `Self` type allows us to avoid repeating the `ResultSet` definition, making the return type much more readable than before. Now, the change between the typestates is more clearly the focus.

## Named selectors

While the type signature externally looks nice, the selector is still hard to read. To understand what `U0` means, you have to go back to the original struct type parameters and do the lookup yourself. One way around this is to create struct-specific named aliases. For example:

```rust
#[derive(TQuery)]
struct Open<Position, Concurrency, Direction>;
type TPosition = U0;
type TConcurrency = U1;
type TDirection = U2;

GetType<Open<P, C, D>, TConcurrency> = C
```

This feature can also be [automatically derived](https://github.com/willcrichton/tquery/blob/master/tquery-derive/src/lib.rs#L40). So now we can rewrite our selector as:

```rust
type UpdateCurrentRow<RS, T> = Replace<
  RS, (TSetState, (TPosition, (TRowState, ()))), T>;
```

Much clearer than before!

## Is this jQuery?

Wrapping up, we've seen how to implement a selector language for replacing nested types. The language is still pretty far from actual jQuery. There's no way to tag classes of types, or to distinguish between a direct vs. indirect descendent. I would love to hear of any use cases for that style of functionality!
