---
layout: post
title: Type-directed metaprogramming in Rust
abstract: I explore how to use Rust compiler internals to metaprogram Rust using information from the typechecker, e.g. to automatically insert garbage-collection into Rust code, and discuss the benefits and drawbacks of this approach.
---

_All code in this note is available in the [rustc-type-metaprogramming](https://github.com/willcrichton/rustc-type-metaprogramming) repository._


## Introduction

Metaprogramming, or code that generates code[^1], is broadly useful in statically typed languages for providing abstractions that are difficult to capture in the base syntax or type system. For example, Rust uses [macros](https://doc.rust-lang.org/book/first-edition/macros.html) for simple pattern-matching-based code substitution (a more powerful and hygienic version of the C preprocessor), e.g. to implement variadic arguments like in [println!](https://doc.rust-lang.org/1.11.0/std/macro.println!.html) and early returns like in [try!](https://doc.rust-lang.org/1.11.0/std/macro.try!.html).

```rust
fn main() {
    println!("{} {} {}", "This has", "many", "arguments");
}
```

However, pattern-matching-based metaprogramming tools are limited to simple syntactic transformations. Many common use cases require introspecting a syntactic construct and generating code accordingly, most notably [custom derive](https://github.com/dtolnay/syn#example-of-a-custom-derive). In that example, the metaprogram takes a struct and generates code by looking at the struct's fields, e.g. to automatically generate [serializers](https://github.com/serde-rs/serde) or [SQL queries](http://docs.diesel.rs/diesel/deserialize/trait.Queryable.html).

```rust
#[derive(Serialize)]
struct Point { x: f32, y: f32 }

fn main() {
    let origin: Point = Point { x: 0, y: 0 };
    println!("{}", origin.to_json()); // {"x": 0, "y": 0}
}
```

Many of these custom derives are in fact examples of type-directed metaprograms, since they use the type of the struct fields to determine what code to generate.  However, this approach has two limitations:
1. This only works for structs since Rust requires the programmer to explicitly write down the type of each field. Many types in Rust are not written down, but instead inferred by the compiler.
2. The types are only treated syntactically, not semantically. For example, if the programmer does:
    ```rust
    type MyFloat = f32;

    #[derive(Serialize)]
    struct Point { x: MyFloat, y: f32 }
    ```
    Then then the deriver has no way to understand that the types `MyFloat` and `f32` are the same.

More broadly, the issue is that *most compilers refuse to expose their type systems (or other internals) to the outside world.*{:class="hl"} Even today, compilers are largely treated as black boxes whose input is a text file and whose output is either a working binary or an error message. At most, languages like Rust will expose their syntax through procedural macro systems, never providing APIs for types, lifetimes, or properties/IRs.

However, at the same time, *compilers are able to infer more than ever about their programs through static analysis.*{:class="hl"} With that comes a tradeoff&mdash;requiring the programmer to write down less information about their program (while still being type/memory-safe) makes the programmer more productive. However, _in plain text_, this makes it more difficult for others to read the same program, as understanding types and lifetimes often help us understand what a piece of code is doing. This is why IDEs are actually taking the charge in cracking open the compiler black box. The folks at Microsoft created both the [Language Server Protocol](https://langserver.org/) for standardizing a common interface for program navigation/editing, and they've also been hard at work on [Roslyn](https://github.com/dotnet/roslyn/wiki/Roslyn%20Overview), a new API for opening up the C# compiler.

*The benefits of extracting knowledge out of the compiler extend well beyond IDEs.*{:class="hl"} As more compiler APIs emerge, statically typed languages can begin to approach dynamically typed languages in their flexibility and extensibility, but without the overhead. It will become easier to use the introspective tools of today (debugging complex data structures, automatic serializer generation) as well as enable the language extensions of tomorrow ([type-directed macro parsing](https://www.cs.cmu.edu/~aldrich/papers/ecoop14-tsls.pdf), [embedded high-performance DSLs](http://terralang.org/)). So let's figure out how much we can already do with our current compilers!


## Using the rustc API

Of the moderately popular statically typed languages that I know of, Rust has one of the nicest compilers, `rustc`, in terms of its [documentation](https://rust-lang-nursery.github.io/rustc-guide) and ease of integration. Since rustc is written in Rust, it's easy to call out to Rust compiler functions in Rust code. Subsequently, in the remainder of this note, we will look at how to use the Rust compiler to do type-directed metaprogramming of Rust code.

Before diving into details, a word of caution: the Rust compiler API is not stable at all, and changes frequently. The specific code in this note will likely be somewhat out of date in a few weeks or months. Running the code requires using the nightly builds. If you are a Rust metaprogramming compiler-hacking fanatic like me, then the specifics will help you understand how to actually use the compiler's API. Otherwise, you can treat this as an example of what type-directed metaprogramming could look like in a brighter future where these APIs are stable. All of the code below is available in my repository [rustc-type-metaprogramming](https://github.com/willcrichton/rustc-type-metaprogramming). Let's get to it!

On a high level, our first goal is just to call the Rust compiler and extract the types of a few fragments of Rust code. The Rust compiler API can be found in their [GitHub repo](https://github.com/rust-lang/rust/tree/8aa27ee30972f16320ae4a8887c8f54616fff819/src) with [high-level documentation](https://rust-lang-nursery.github.io/rustc-guide/). To start, we need to create a new crate and put it on nightly:
```
$ cargo new --bin rustc-type-metaprogramming
$ cd rustc-type-metaprogramming
$ rustup override set nightly-2018-03-19
```

Then we fill out the `src/main.rs` file:

```rust
#![feature(rustc_private, quote)]
fn main() {}
```

We use Rust's feature gates to explicitly declare that we intend to use the private API to rustc as well as the quotation API in [`libsyntax`](https://github.com/rust-lang/rust/tree/8aa27ee30972f16320ae4a8887c8f54616fff819/src/libsyntax) (more on that later). At this point, we can look to the rustc driver ([`librustc_driver`](https://github.com/rust-lang/rust/tree/8aa27ee30972f16320ae4a8887c8f54616fff819/src/librustc_driver)) to see how the Rust compiler calls its own functions from the top-level (i.e. when the user calls `rustc` on the command line). Specifically, the [`run_compiler`](https://github.com/rust-lang/rust/blob/8aa27ee30972f16320ae4a8887c8f54616fff819/src/librustc_driver/lib.rs#L445) and [`compile_input`](https://github.com/rust-lang/rust/blob/8aa27ee30972f16320ae4a8887c8f54616fff819/src/librustc_driver/driver.rs#L67) functions show the 10,000 feet view of the compiler stages. A plain English explanation of this is also provided in the [documentation](https://rust-lang-nursery.github.io/rustc-guide/high-level-overview.html).

We need to do a lot of stuff that's required by the compiler but largely irrelevant for our task (like provide command line options, create code maps for a non-existent source file, set up a bunch of compiler infrastructure). In the code snippets, I omit the uninteresting boilerplate/lifetimes/etc. with `...`, but you can find the full working example in the repository. Let's say we want to type-check the function `fn main() { let x = 1 + 2; }`. Our metaprogramming function then looks like:

```rust
fn main() {
    ...

    let krate = {
        ...
        ast::Crate {
            ...
            quote_item!(fn main() { let x = 1 + 2; })
        }
    };

    let hir = driver::phase_2_configure_and_expand(krate, ...);
    ...

    ty::TyCtxt::create_and_enter(hir, ..., |tcx| {
        typeck::check_create(tcx).unwrap();
        println!("Type checked successfully!");
    });
}
```

This consists of three steps: first, we need to produce a syntactic representation of the program. One way to do this is to represent the program as a string and then run the rustc parser, e.g.

```rust
let prog: &str = "fn main() { let x = 1 + 2; }";
let parser = Parser::new(); // not actually this easy IRL
let func: ast::Item = parser.parse(prog).unwrap();
```

However, a nicer way to do this is to use quotations, or macros that essentially do the parsing for us. Quotations like `quote_item!` take as input Rust code and return the programmatic representation of that code as a Rust syntax tree (AST), which we use above. We then wrap the function in a crate, since that's the input the Rust compiler expects.

Second, we convert the AST into the high-level intermediate representation (HIR), described [here](https://rust-lang-nursery.github.io/rustc-guide/hir.html). HIR has fewer syntactic forms that the AST the programmer uses, e.g. `for` loops are converted into `loop` loops. Lastly, we run the typechecker by creating a type context `tcx` and run it with `TyCtxt::check_crate`. If our code snippet typechecks like it does in our example, then this code will execute and print the success message. You can verify this with:

```
$ cargo run
Type checked successfully!
```

## Extracting types from rustc

Now that we can run the compiler, we next want to extract the types it computes. Let's say we want to print out the type of every expression in our sample program. One way to do this would be to manually traverse the syntax tree with recursive `match` statements, but that's onerous and not easily extensible when the AST changes. Instead, we can use the visitor pattern where we only define behavior for the parts of the syntax tree we care about, and use default implementations for the rest.

Luckily, this is a common pattern in the Rust compiler so they have already implemented much of this machinery for us! Specifically, `librustc::hir::intravisit` provides a [Visitor trait](https://github.com/rust-lang/rust/blob/8aa27ee30972f16320ae4a8887c8f54616fff819/src/librustc/hir/intravisit.rs#L149) that we can implement to walk through a HIR tree.

```rust
struct TestVisitor {
    tcx: ty::TyCtxt
}

impl Visitor for TestVisitor {
    ...

    fn visit_expr(&mut self, expr: &hir::Expr) {
        let ty = self.tcx.type_of(expr); // not actually this easy IRL
        println!("Node: {:?}, type: {:?}", expr, ty);
        intravisit::walk_expr(self, expr);
    }
}

fn main() {
    ...

    ty::TyCtxt::create_and_enter(hir, ..., |tcx| {
        typeck::check_crate(tcx).unwrap();
        let mut visitor = TestVisitor { tcx: tcx };
        tcx.hir.visit(&mut visitor);
    });
}

```

Running this code, we get the following output:
```
$ cargo run
Node: expr(13: { let x = 1 + 2; }), type: ()
Node: expr(11: 1 + 2), type: i32
Node: expr(9: 1), type: i32
Node: expr(10: 2), type: i32
```

Awesome! We were able to access every expression and its type, even though no types were ever written down explicitly. The code works by creating a visitor `TestVisitor` that contains the type context `tcx` that tells us the types of expressions when we ask it with `type_of`. The visitor walks through the HIR tree, and when it finds an expression like `1+2`, it calls the function which prints both the expression and its type. Then we call `walk_expr` which continues recursively visiting the components of the expression, `1` and `2` in this case. Note that in Rust, function bodies are blocks which are expressions, so the block `{let x = 1 + 2;}` is an expression that has the empty tuple (unit) return type.


## Auto-GC for Rust

One possible application of type-directed metaprogramming could be the automated application of garbage collection techniques to selected code blocks. Dealing with lifetimes in Rust can be difficult sometimes, so it would be nice to have the compiler automatically reference count everything by default, which in the simplest (and least-performant) case looks like this:

```rust
// before
let x: i32 = 1;
let y: i32 = x + 1;

// after
let x: Rc<i32> = Rc::new(1);
let y: Rc<i32> = Rc::new(*x + 1);
```

While much of this translation can be done syntactically, knowing the types during translation can help us translate at a finer granularity  (only translate certain types) and produce better error messages (an issue with `Rc<i32>` is actually with `i32` in the source code). To demonstrate the simplest proof-of-concept, I implemented this approach as a procedural macro: `auto_gc!`. For example, if we have a `main.rs` that looks like:

```rust
...
fn main() {
    auto_gc! {
        let x = 1;
        let y: i32 = 1 + x;
    };
    println!("{:?}", *y);
}
```

Then running `cargo expand` (equivalent to `gcc -E`, expands out the macros), this generates:

```rust
...
fn main() {
    let x: Rc<i32> = Rc::new(1);
    let y: Rc<i32> = Rc::new(*Rc::new(1) + *Rc::new(*x));
    ...
}
```

> Note that the expanded `x` has an explicit `Rc<i32>` type annotation despite not being in the original source, since we could use info from the Rust typechecker.

The implementation ([source here](https://github.com/willcrichton/rustc-type-metaprogramming/blob/master/auto-gc/src/lib.rs)) uses a "folder" (instead of a visitor) to generate an output for each node in the HIR, largely keeping the code the same except inserting dereferences and `Rc::new` calls where appropriate. My code is wrapped in Rust's procedural macro interface that allows code inside an `auto_gc!` call to be replaced by arbitrary code generated by my function.


## Future work

I'm glad I was able to get this off the ground. Hats off to the Rust developers for the time they've invested in documenting the compiler. I think it will pay great dividends for the future, not just for people who want to hack on the compiler, but also for people like me who want to take it in new directions.

That said, after playing around, this approach has a number of logistical challenges today:
1. HIR wasn't meant to be transformed like the AST. While the AST module has a Folder trait, the HIR module does not, so I had to implement it myself.
2. All code generation facilities are targeted towards the AST, not HIR. For example, if I'm folding over a HIR tree, I have to manually define the translation of values between HIR and AST, which is a lot of seemingly unnecessary work. There's no quotation library for HIR.
3. Using the compiler (in my own code) inside the compiler (e.g. in a procedural macro definition) can be dangerous. I ran into a tricky bug where I accidentally defined two string interning contexts and had some wacky results when keywords were getting arbitrarily mutated to other words.

None of these issues are fundamental, and largely just mean providing better library support around munging HIR constructs and mapping them back to the AST. I intend to investigate further into what rustc needs to better enable type-directed metaprogramming.

[^1]: The line between metaprogramming and normal programming is quite blurry. For example, higher-order functions, or functions that return functions as inputs/outputs, are considered routine (distinctly normal) in functional languages like OCaml and Haskell (largely enabled by their [currying-by-default](https://realworldocaml.org/v1/en/html/variables-and-functions.html#multi-argument-functions)). However, in Python, [decorators](http://blog.thedigitalcatonline.com/blog/2015/04/23/python-decorators-metaprogramming-with-style/) are frequently called metaprograms, despite essentially being normal higher order functions with syntactic sugar.
