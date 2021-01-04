---
layout: post
title: A Coming Revolution in Metaprogramming
abstract: A single programming language is no longer enough. I predict that soon, the best programmers will fluently move between languages and the best languages will interoperate well with others. This interoperability will likely stem from strong metaprogramming facilities. I examine how we might build a programmable compiler and look at recent work toward that end.
---

<div class="figure">
    <img src="http://i.imgur.com/UrY0HZM.jpg" />
    <div class="caption">Figure 1: the programming languages of the world are fragmented. What if we all spoke the same one?</div>
</div>

## Introduction
The chief purpose of a computer, particularly for programmers, is to automate. Computers excel at automating calculation, communication, logistics, learning, and a whole host of rudimentary tasks. Yet, curiously enough, most programmers (myself included) are only ever taught computational automation to the first order, writing code to automate tasks like adding a set of numbers or processing a customer's order. Second order automation goes by many names: metaprogramming, compilation, translation, macros,  but they all boil down to the same idea: automating the creation of code [^1]. The most rudimentary form of metaprogramming is the C preprocessor:

```c
#include <stdio.h>
#define DO_TWICE(X) { X; X; }

// prints "Hello world!" twice
void main() {
  DO_TWICE(printf("Hello world!\n"));
  // expands to: { printf("Hello world!\n"); printf("Hello world!\n"); }
}
```
<div class="caption">Figure 2: copying code with the C preprocessor. This is not a safe way to do macros!</div>

C preprocessor macros are functions from String &rarr; String that take in raw uninterpreted source code and produce more raw source code. This is an unwieldy form of compilation as the macro writer can infer nothing about the structure of his inputs, but it is compilation nonetheless. C macros define new syntax that can change the language in nontrivial ways (see [Cello](https://github.com/orangeduck/Cello/blob/master/include/Cello.h#L600) or [Boost](http://svn.boost.org/svn/boost/trunk/boost/foreach.hpp)). The C language itself can also be considered metaprogramming if you treat it like a giant macro language for assembly.

Code generation pops up in many other places past just macros and traditional compilers. IDEs like Eclipse often have facilities for automatically generating class definitions and getters/setters for Java. People use frameworks like Ruby on Rails because half of the code you need for setting up a website gets generated with a few keystrokes. Facebook's React.js can translate HTML-ish markup into Javascript with its JSX format.

In all of these cases, codegen addresses a common problem of the working programmer: *most programming languages will, at some point, lack the facilities for expressing some logic that the programmer wishes to encode*{:class="hl"}. In the Java example, you want to be able to append `@with_getter_and_setter` to a member field declaration but instead you have to write the functions yourself [^2]. For Rails, there is no `Website.new` function in Ruby that encapsulates all the functionality you need. With React, HTML is simply more succinct at expressing markup than Javascript.

If a programming language can not sufficiently transcribe the programmer's intent, then it must be able to interoperate with another language that can. From this observation arises two hypotheses:

1. The most productive programmers in the coming years will be those that can work between multiple interoperable languages instead of a single general purpose language.
2. The most productive programming languages will be those which are fully extensible at the language level.

## A Diaspora of Functionality

Those coming from a web programming background will be no stranger to the plight of the programming polyglot. Ten years ago, creating a website required knowledge of at least three languages: HTML, CSS, and Javascript. Today, front-end dev consists of no less than 30 languages and frameworks that each compile into various subsets and supersets of those three original languages. Although this can be overwhelming at times, this is considerably better than the alternative&mdash;just imagine if you had to use Java and Tk instead of HTML. Twenty years ago, most GUI programming was actually done imperatively. The dispersion of this functionality into separate syntaxes (HTML for the markup, CSS for the styling, JS for the scripting) is a natural response to the inability for Java (or similar languages) to concisely express the layout and logic of a webpage.

This kind of diaspora is symptomatic of a larger trend occurring across both industry and academia. In data science, rather than coding math routines by hand in FORTRAN/C/CUDA, statisticians write correlations in Python and then call out to C to do the heavy lifting through libraries like [numpy](http://numpy.org). In software engineering, languages like Groovy are used to reduce the verbosity of project configurations in Java and encode high level business logic. Domain-specific languages (DSLs), or programming languages specialized to a single purpose like [physical simulation](http://ebblang.org/) or [graphics shading](https://en.wikipedia.org/wiki/OpenGL_Shading_Language), emerge from the woodwork at an unprecedented rate.

*Languages should specialize in the same way that we modularize applications.*{:class="hl"} If our application, a website for example, needs to define website structure, styling, and scripting, we would not clump all of this functionality into a single class or method. Why should they get clumped into a single language? Historically, I believe, this has been the case simply because creating a new language is difficult on two counts:

1. Compilers are hard. To define a language today, you need to know lexing and parsing/context free grammars as well as tools to generate lexers and parsers. You need to understand abstract syntax trees, type systems (including inference), intermediate representations (e.g. LLVM), assembly languages (x86, WebAssembly, ...), optimizations, interpreters, JIT compilers, and so on. Courses on compilers have high variance in quality, so only a small number of developers end up qualified to work on industrial-strength compilers. By contrast, every language has a million tutorials teaching its ins and outs, so writing a library is far easier than writing a language.
2. Interoperability is hard. Unless a new language has such exceptional merit so as to stand on its own, it must be able to work with some existing set of languages. Working well with another language requires either pinning to their runtime/type system (e.g. Scala/Clojure running on the JVM) or defining a foreign function interface for moving between the two (e.g. every language that can call to C). So many new languages wither away because they don't play well with the existing ecosystem of programming tools.

Today, neither of these problems are close to being solved. However, solutions are on the horizon, and I believe these are what will usher in the era of the metaprogrammer.

## The Programmable Compiler

Languages today generally lack interoperability because they are developed each in isolation. The people writing GHC for Haskell aren't thinking, "how can we optimize for Python compatibility?" So glue between languages ends up with ad-hoc bindings that are rarely cross-platform. Specifically, by "develop in isolation," I really mean that all of these languages either LLVM/x86 or a custom-made bytecode (that in turn is interpreted by code compiled by a language targeting LLVM/x86). Interop between languages needs to happen at a level far higher than abstract assembly to get any meaningful benefit. Ideally, languages would be developed as extensions to a base language that was more high level than assembly, one like Rust or OCaml. In order for languages to be created as such, these base languages need strong facilities for metaprogramming.

I've heard it said that the last forty years of programming language development have been rediscovering all the features of Lisp, and that metaprogramming is the last part that has yet to make it into the mainstream. Lisp is famous for its declaration that "code is data," and so should it be. However, Lisp takes the easy way out to turning code into data by forcing programmers to code in blobs of parentheses, or S-expressions. Of course metaprogramming is easy when the programmer writes in the closest possible thing to abstract syntax. The more interesting question is: how does metaprogramming, this second order automation, work with different syntaxes? Different intermediate representations? Languages with garbage collection and languages with dynamic types?

The answer to this question will come in the form of a programmable compiler. For too long, the compiler has been treated as an almost sacred boundary, its APIs off limits to the programmer except for some set of restricted AST transformations. *I believe that a fully programmable compiler, one which exposes its concrete syntax, abstract syntax, and code generation facilities to its users, can solve both of the issues limiting language development.*{:class="hl"} To understand how, let's take a look at some recent work in this area.

1. [Wyvern](http://www.cs.cmu.edu/~aldrich/wyvern/): at CMU, Jonathan Aldrich's group has been working on the Wyvern language, which incorporates a novel language feature called Type-Specific Languages (TSLs) developed by Cyrus Omar. TSLs are a means of extending the syntax of Wyvern by defining parsers as a first-class member of the language and allowing users to create their own mini-languages inside of Wyvern:
   <img src="http://i.imgur.com/7c2oyxx.jpg" style="max-height: auto;display:block;margin:0">
    <div class="caption">Figure 3: HTML templating with SQL and CSS mixed in using Wyvern.</div>
    This is similar to [procedural macros](https://doc.rust-lang.org/book/compiler-plugins.html) in Rust which are essentially functions from TokenStream &rarr; AST that define an alternate syntax for the language. TSLs, however, are notable in that they are unambiguous and composable. The general idea is that a TSL returns a value of a known type, and the compiler can do type inference to determine the expected type of a value, so it can resolve ambiguity between languages based on their types. Additionally, the TSLs can be used within each other. When you define a new TSL, you get interoperability with every other TSL defined in Wyvern _for free!_ Imagine if you could freely mix C, OCaml, Javascript and HTML with type-safe interop. This style of composition is the future of front-end, or syntax level, interop.
2. [Terra](http://terralang.org): at Stanford, Zach DeVito along with Pat Hanrahan created the Terra language, which is a low-level language that is interoperable with Lua and can also be metaprogrammed in Lua. Their primary goal for Terra is using it to construct domain-specific languages like [Ebb](http://ebblang.org) and [Opt](http://optlang.org/). While Wyvern compiles down its languages all into the same base language and type system (SML), Terra uses Lua to define both the compiler and the top-level interface for each new language, but then compiles them down into Terra (as opposed to Lua) for performance.
   <img src="http://i.imgur.com/hd1UkVs.jpg" style="max-height:auto;display:block;margin:0">
    <div class="caption">Figure 4: JIT compiling Terra code in Lua.</div>
    Here, the fundamental concept is that exposing the compiler's intermediate representations enables other languages to precisely control their compiled code (as oppose to just compiling to the host language and hoping for the best) while still maintaining a level of interoperability.
3. [Lia](http://github.com/willcrichton/lia): in my free time, I started working on a language called Lia which is a Javascript-esque syntax that compiles into pure Rust code using the aforementioned procedural macros&mdash;imagine a Javascript runtime where you could easily call any Rust function.
    {% raw %}
    ```rust
    // lia! declares a set of Lia functions. It is a procedural macro that compiles Lia into Rust.
    lia! {
        function multiply_matrices() {
            console.log("Multiplying matrices");
            var x = @Matrix::from_list([[4, 3], [2, 1]]); // The @ means a foreign (Rust) function
            var y = @Matrix::from_list([[1, 2], [3, 4]]);
            var z = @Matrix::multiply(x, y);
            return @Matrix::get(z, 0, 0);
        }
    }

    #[derive(Clone)]
    struct Matrix {
        data: Vec<i32>,
        rows: i32,
        cols: i32,
    }

    // Putting #[lia_impl_glue] on an impl block will automatically generate functions that
    // do the appropriate type-casting from Lia's dynamic types into Rust's static types.
    #[lia_impl_glue]
    impl Matrix {
        // some functions omitted...

        pub fn multiply(&self, other: &Matrix) -> Matrix {
            assert!(self.cols == other.rows);

            let mut new_mat = Matrix::new(self.rows, other.cols);
            for i in 0..self.rows {
                for j in 0..other.cols {
                    let mut dot = 0;
                    for k in 0..self.cols {
                        dot += self.get(i, k) * other.get(k, j);
                    }
                    new_mat.set(i, j, dot);
                }
            }

            return new_mat;
        }
    }

    fn main() {
        // Lia includes macros that simplify handling Lia functions and values in Rust.
        let result: LiaAny = call!(multiply_matrices());
        cast!(let num: i32 = result);
        assert!(num == 13);
    }
    ```
    {% endraw %}
    <div class="caption">Figure 5: Using Rust code in Lia to multiply matrices.</div>

    In my mind, Rust is the ideal compile target for an ecosystem of interoperable languages, as it has the least number of opinions on how to run your program while still ensuring safety. Specifically, it manages memory at compile time and also provides a static type system. In my mind, there are three main tiers of general purpose languages: low level systems languages like Rust, C++, and Terra that provide static types and compile-time or manually managed memory comprise the first tier. In the next tier are languages like OCaml, Haskell, Scala, and Java that provide static types but impose a garbage collector in exchange for usability. The last tier consists of dynamically typed and garbage collected languages, usually called scripting languages, like Javascript, Python, and Ruby. Traditionally, all of these kinds of languages are developed in relative isolation, but there is no real reason for that to be the case. I see a future where Rust, OCaml, and Javascript (or some selection of languages like that) all seamlessly interoperate in the same ecosystem. Lia is a first step towards that ideal by exploring the issues and uses cases for a third tier scripting language embedded inside of a first tier systems language.

There's considerably more related work in areas like gradual/like typing, metacompilation, and so on than can be discussed in this note. There's also plenty of related work that I'm simply unaware of&mdash;make sure to bring it up in the comments! This note is more for inspiring discussion than providing answers, as I don't yet know what the fabled programmable compiler will look like or how it will work. My vague idea is to create a second-tier language in a similar fashion to Lia, so a language like OCaml embedded in Rust, and then to use that as a starting point for metaprogramming that can produce TSLs (in Wyvern style) that compile to OCaml or produce DSLs (in Terra style) that compile to Rust. If you have any ideas, please let me know either in the comments or at [wcrichto@stanford.edu](mailto:wcrichto@stanford.edu).

## References

[^1]: My initial idea for this note came about after playing a little too much [Factorio](http://factorio.com).

[^2]: I'm sure that this has been ameliorated since my short stint in Java, but you get the general idea.
