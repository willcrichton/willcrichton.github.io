---
layout: post
title: Partial Function Application as a Design Pattern
abstract: >-
    Partial function application, or currying, is omnipresent in the use of functional languages. I discuss its role as a design pattern, looking at three specific ways currying can improve the brevity and readability of an API.
---

Partial function application is a common feature of functional programming languages where functions can be given some, but not all, of their arguments. As a simple example, we can curry an "add" function in OCaml to produce a more specialized function:

```ocaml
(* In non-functional languages, multiple arguments are given as tuples *)
let add ((a, b) : int * int) : int =
  a + b
in

assert (add (2, 3) = 5);

(* An explicit curried style makes a new function for each argument *)
let add : int -> int -> int =
  fun (a : int) -> fun (b : int) -> a + b
in

let add2 : int -> int = add 2 in

assert (add 2 3 = 5);
assert (add2 3 = 5);

(* OCaml (like other functional languages) supports implicit currying *)
let add (a : int) (b : int) : int =
  a + b

(* This still works. The type of add is int -> int -> int *)
let add4 : int -> int = add 4 in

assert (add4 3 = 7)
```

If you're not as familiar with functional language syntax, here's the equivalent in Javascript:

```js
var add = function(a) {
  return function(b) {
    return a + b;
  }
}

var add2 = add(2);
console.assert(add2(3) == 5);
```

In this note, I want to move beyond the mechanics of currying to ask: how can partial application help you improve the design of your libraries?

## 1. Argument frequency of change

One rule of thumb for currying is to order your arguments from left to right in terms of _increasing frequency of change_. For example, consider an API for querying a database:

```ocaml
module type Database = sig
  type connection
  type row

  val connect : unit -> connection
  val select : connection -> table:string -> column:string -> row list
end

module DatabaseTest(Db : Database) = struct
  let c = Db.connect () in

  (* Verbose repetition between selects... :( *)
  let firstnames = Db.select c ~table:"users" ~column:"firstname" in
  let lastnames = Db.select c ~table:"users" ~column:"lastname" in

  (* Curry over the database connection *)
  let select = Db.select c in

  (* Curry over the table *)
  let selectuser = select ~table:"users" in

  (* Concise column access! :) *)
  let firstnames = selectuser ~column:"firstname" in
  let firstnames = selectuser ~column:"lastnames" in

  ()
end
```

For the `select` function, the database connection is going to change the _least_ frequently. We usually connect to a database and run many queries. Then the table is next least frequent to change, as we may select multiple columns from a table (as in this example). So we can provide our parameters in order, and now the user can iteratively whittle down their helper functions until they need the minimal number of arguments to get the job done. How concise!

Two interesting nuances here. First, if we use named arguments (e.g. `table` and `column` above), we aren't restricted to currying in the left-to-right ordering. For example, we could curry on the column and leave the table unspecified without changing the original function definition:

```ocaml
let select_firstname : table:string -> row list =
  Db.select c ~column:"firstname" in
let firstnames = select_firstname ~table:"users"
```

This means the left-to-right rule only applies for anonymous arguments, not named arguments.

Second, you could interpret this idiom as approaching the expressiveness of an object-oriented interface, but without objects. A common approach to this type of configuration-minimizing design pattern would be to have a Database object that is configured once and offers methods that can access the configuration. For example, in Python:

```python
class Database:
   def __init__(self):
     self._c = connect_to_db()

   def select(self, table, column):
     return self._c.select(table, column)

db = Database()
firstnames = db.select('users', 'firstname')

# Explicit currying by creating new functions
selectuser = lambda column: db.select('users', column)
lastnames = selectuser("lastname")
```

Note that currying allows us to both avoid redundant configuration while also enabling expressive use of methods, while OOP languages like Python et al. only easily permit the former.

## 2. Readable method chains

One wonderful part of object-oriented interfaces is the use of method chains to express sequences of actions in a readable left/right, top/bottom fashion. For example in Rust, I can make a space-separated string of all the even numbers in a list like this:

```rust
fn main() {
  let v: Vec<i32> = vec![1, 2, 3, 4, 5];
  let s: String = v
    .into_iter()
    .filter(|n| n % 2 == 0)
    .map(|n| n.to_string())
    .collect::<Vec<_>>()
    .join(" ");
  println!("{}", s); // 2 4
}
```

I would consider this readable in the sense that to follow the sequence of events, I can read top-down in a natural fashion, and understand the state of the list at each point. "Ok, first we have the list, then it's an iterator, then we get the event numbers, then we turn each one into a string, convert it back into a list, then join it into a final string."

By contrast, a common problem in function-oriented interfaces is the "inside-out" problem:

```ocaml
let l: int list = [1; 2; 3; 4; 5] in
List.join " "
  (List.map string_of_int
    (List.filter (fun n -> n mod 2 = 0) l))
```

To read this sequence of operations, I have to scan to find the inner-most operation, then start reading from the inside out to follow the sequence. I personally find this onerous for the same reason as reading prefix or postfix arithmetic: the order of operations does not follow the order of reading.

However, with some clever usage of currying and function combinators, we can turn this around. First, in OCaml, there is an infix "pipe" operator that calls a function on the right with an argument on the left.

```ocaml
let (|>) = fun (x : 'a) (f : 'a -> 'b) : 'b -> f x
in

let l = [1; 2] in
let l' = (l |> List.map (fun x -> x + 1)) in
assert (l' = [2; 3])
```

With this operator in hand, we carefully design our operations to take their primary object as the _last_ argument. For example, the map and filter functions on lists have these type signatures:

```ocaml
List.map : ('a -> 'b) -> 'a list -> 'b list
List.filter : ('a -> bool) -> 'a list -> 'a list
```

Note that the transforming functions come first, and the target list (`'a list`) comes last (right before the output). With our API ordered like this, we can then rewrite the inside-out example:

```ocaml
let l: int list = [1; 2; 3; 4; 5] in

l
|> List.filter (fun n -> n mod 2 = 0)
|> List.map string_of_int
|> List.join " "
```

Wow! Almost like normal method chaining. The main difference here is that we still have to explicitly reference the `List` module where the function was defined. In an object oriented interface, we can just say `l.filter(..)` because the compiler determines which function `filter` refers to from the type of `l`. That is to say, object-oriented interfaces use _type-directed_ name resolution, while functional interfaces use _explicit_ name resolution[^1].

## 3. Concise embedded DSLs

Another great use of currying is to create combinator-based embedded domain specific languages. For example, I was working today on an OCaml interface inspired by the [Allen interval algebra](https://en.wikipedia.org/wiki/Allen%27s_interval_algebra) which defines different relations on time intervals. The goal was to have an interface that lets me quickly combine different interval comparisons to create new operators. To define an "interval is near" function:

```ocaml
let open IntervalAlgebra in
let is_near : interval -> interval -> bool =
  overlaps ||
  (before ~max_dist:(Some 10.)) ||
  (after ~max_dist:(Some 10.))
in

let ai = {start = 0.; end_ = 10.} in
let bi = {start = 12.; end_ = 14.} in
let ci = {start = 25.; end_ = 27.} in

assert (is_near ai bi);
assert (not (in_near ai ci))
```

I call this an embedded DSL since it repurposes syntax, e.g. the or operator `||` isn't combining boolean values, but instead functions that produce boolean values. I was able to implement this interface without much trouble using currying:

```ocaml
module IntervalAlgebra = struct
  type interval = {start: float; end_: float}

  let overlaps (ai : interval) (bi : interval) : bool =
    ai.start <= bi.end_ && ai.end_ >= bi.start

  let before ?(max_dist : float option = None) (ai : interval)
        (bi : interval) : bool =
    let diff = bi.start -. ai.end_ in
    match max_dist with
    | Some dist -> 0. <= diff && diff <= dist
    | None -> 0. <= diff

  let after ?(max_dist : float option = None) (ai : interval)
        (bi : interval) : bool =
    before ~max_dist bi ai

  let (||) f g a b = (f a b) || (g a b)
  let (&&) f g a b = (f a b) && (g a b)
end
```

I use currying in two ways here: first, currying allows operators to have parameters, e.g. the `before` and `after` operators have an optional `max_dist` parameter that is provided once, and used every time the operator is called. Second, I use currying to define the higher-order operator combinators (the `||` and `&&`). Calling `before || after` fills in the values of `f` and `g`, but then return a new function waiting for the intervals `a` and `b` before calling them appropriately.

If you use currying in cool ways beyond what's shown here, please leave a note [in the comments]() or send me an email at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu).

[^1]: Languages with type classes (like Haskell) or traits (like Rust) use type-directed name resolution without objects. See my post on [Name Resolution in Programming Languages](/notes/specificity-programming-languages/) for more.
