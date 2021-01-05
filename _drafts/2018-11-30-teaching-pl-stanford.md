---
layout: post
title: Teaching the Future of Programming Languages at Stanford
abstract: >-
    TODO
---

## The state of PL education

I love programming languages. I think they're one of the most fun and fundamental topics in computer science, with one foot in a world of beautiful theory and the other in a world of gritty practicalities. To me, learning programming langauges (PL) is about basic _computational literacy_. It's about understanding computational concepts like variables, functions, type systems, semantics, program analysis, etc. in their purest form, in a way that provides the best mental model for cleanly decomposing problems into algorithms. Learning PL is also about translating between systems of computation, moving from our idealized models into the ones that can execute efficiently on modern hardware.

It is from this viewpoint of excitement and optimism that I look onto the state of programming language education, and I despair. PL education is incredibly inconsistent---I have looked far and wide, and every new PL course I find has significantly different content than the rest. While courses on algorithms or computer systems seem to be fairly consistent from school to school, PL remains a wide outlier. I have personally taken two PL courses at [CMU]() and [Drake](), and studied the curricula of many others, including [Harvard](), [UW](), [Northeastern](), [UPenn](), [Purdue](), and of course [Stanford]()[^1].

Amongst these courses emerge a spectrum of curricula, ranging from "programming language zoo" (e.g. "here's six programming languages I think are cool, write programs in them") to "full-bore type theory" (e.g. "here's a billion extensions to the lambda calculus, write interpreters for all of them"). The "PL zoo" approach is problematic because it adopts the same approach of some algorithms courses by just provided a grab-bag of interesting computational models. "If you have a sufficiently declarative problem then use Prolog, if you have a sufficiently concurrent problem then use Erlang," and so on. It doesn't speak to the underlying structure between these languages, or often leaves that to be inferred by the student.

By contrast, type theory courses are often too divorced from reality to provide students a meaningful understanding of how abstract type systems map onto real world situations. I certainly left my type theory course thinking a combination of "this is cool, but I have no idea when I would use this knowledge" and "this seems too different from 'real world' PLs to be useful." You get the distinct impression that the course is only for people who want to _design_ programming languages, as opposed to just use them.

## Where there's a Will, there's a way[^2]

I'm not one to idly complain, so I set about to rectify this problem in the only way I knew how: by trying to design a programming language course myself. And that I did---this semester concludes the second iteration of my version of [CS 242](http://cs242.stanford.edu/), Stanford's course on programming languages (see [here](http://cs242.stanford.edu/f17) for the Fall '17 iteration). It's been a wild ride solo-teaching a course of 80 upper-level Stanford students in the middle of my PhD, and I wanted to reflect on my design decisions for the curriculum so others may benefit from my experience.

To start, I'll describe the philosophy and high-level design of the course. Quoting from the course description:

> CS 242 explores models of computation, both old, like functional programming with the lambda calculus (circa 1930), and new, like memory-safe systems programming with Rust (circa 2010). The study of programming languages is equal parts systems and theory, looking at how a rigorous understanding of the syntax, structure, and semantics of computation enables formal reasoning about the behavior and properties of complex real-world systems.

The main theme of the course is "bridging the gap between systems and theory." I wanted to show that PL theory was a useful device for describing and analyzing programs, and that the kinds of analyses supported in the theory are relevant to every-day programming. On the [first day of lecture](), I motivated the course by pointing out three questions in today's programming landscape:

1. **What is a programming language?** There is no [consistent definition](http://localhost:4000/notes/what-is-a-pl-survey/) of a programming language. This makes it difficult to know what lies in the domain of programming languages, or when PL ideas can apply to a particular system (claim: [more often than you think](http://localhost:4000/notes/what-is-a-programming-language/)).

2. **How do we describe programming languages?** In practice, the language used to talk about program semantics is inconsistent and imprecise. Instruction set documentation, language documentation (both [low]() and [high level]()), etc. all suffer from this problem. This leads, effectively, to an explosion of ad hoc dialects for specifying programs.

3. **How do we reason about programming languages?** Program analysis is central to PL, to make claims like "a program that passes the type checker is actually type-safe." Yet the first two problems lead to the last, which is that a system of computation poorly specified (or not identified as a PL in the first place) is not amenable to analysis or proof.

To answer these questions, the first third of the course covers [PL metalanguage](), [lambda calculus](), and [basic type theory](), essentially a condensed version of selected portions from [Types and Programming Languages]() (highly recommended book!). At the same time, students learn OCaml and the basics of functional programming, emphasizing that OCaml is "just" an executable version of the typed lambda calculus.[^3] The assignments include [the theory of dynamic scoping]() in the untyped lambda calculus, [an OCaml interpreter]() for the simply typed lambda calculus, and a [functional collections API]().

The main insight (or design decision) of the course is to depart from the traditional "more type theory" track, and instead look at the use of type theory in more practical programming languages: WebAssembly and Rust. WebAssembly serves as [living proof]() of "hey look, people actually use the PL metalanguage to describe real-world PLs." We also use the langauge to introduce formal descriptions of [memory and mutability](). With Rust, we focus less on formal specification and more on practical implications of its type systems. Specifically, looking at how [ownership types]() and [traits]() lead to memory safety and [freedom from data races](). Using [session types](), we see the two features compose to enable the specification of mini type DSLs. Assignments include a [memory allocator]() in WebAssembly, a [WebAssembly interpreter]() in Rust, a [futures library](), and [a verified TCP implementation]().

At the end of the course, we also have a mini unit on dynamic typing with Lua, both to contrast the benefits of dynamic vs. static typing, and also to give a brief window into the mechanisms underlying object-oriented programming.

## Lessons learned

Overall, students seem to really enjoy the course. I've gotten a lot of positive feedback:

> Just wanted to let you know that this is one of the best CS classes I've taken at Stanford---if not hands down the best. Lectures are always so exciting, and the homework is a ton of fun. I really like the mix of theory and systems-level stuff, as well as the mix of programming and written assignments, where both feel like they are valuable and adding to the other. I also feel like I'm being challenged to think in different ways than I do in most CS classes (mostly because of the functional paradigm). Thanks so much for all the care you put into the class!

One key component here is a focus on assignments first. Students are always going to remember the hands-on components more than anything else (particularly more than lectures), so I directed most of my mental energy in the design phase to picking interesting applications and assignment structures. I try to avoid rote exercises and fill-in-the-blank programs. One common pattern is exploring a new (but related) concept with background, e.g. [dynamic scoping](), [futures](), or [coroutines](). Another is debugging, e.g. [proposed language semantics]() or a [session types implementation]().

It's important, particularly in the more theoretical sections, to strike a balance between programming and written assignments. While I highly value the hands-on nature of programming, I am constantly surprised by students' abilities to complete programming assignments through guess and check (this can also be a weakness of an assignment if it permits such an approach). Written sections force students to think through their answers without a test suite or autograder, and students have noted in their feedback that they appreciate how the written assignments help them identify their own misconceptions.

I don't have much feedback at this point on how effectively the course provides a holistic framework to describe and understand programming languages. Students are definitely capable of understanding each component in isolation, but it's genuinely not clear whether the higher-level themes of the course come through. The most basic skill I claim is that a graduate of CS 242 should be able to engage with PL research and be slightly less confused than they would be before the course. Hence, for the [take-home final](), I have the students learn to use a theorem prover on their own just from online documentation. I'm still searching for other ways to probe students' understanding in this regard.



[^1]: Some schools notably lack PL courses or combine them with compilers, like Berkeley and MIT.

[^2]: I should probably only use this line at most one in my lifetime, so I hope you enjoyed it.

[^3]: This is is something of a Stanford-specific optimization. At CMU, functional programming was a prerequisite to the PL course, so everyone knew Standard ML coming in. However, CS 242 is the _only_ course that teaches functional programming at Stanford, so it was a challenge to jointly teach PL theory and functional programming at the same time. By contrast, for example, the [UW PL course]() focuses more on traditional functional programming education than PL theory.
