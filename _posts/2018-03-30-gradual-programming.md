---
layout: post
title: Gradual Programming
abstract: Programming is a fundamentally incremental (or gradual) process, and our programming languages should reflect that. I show several ways in which program models transition over time and discuss how future research can further a human-centric vision for programming languages.
---

## Picking the right problem

What are the big problems in programming languages in 2018? The ones which, if we solve them, will have the greatest impact on the next generation of programmers? [^0] This question, to me, is the allure of programming language research, that the tools and theories we develop don't affect just a single domain, but potentially _everybody_ who programs. But therein lies another problem: how on earth are we supposed to know the needs of every single programmer? It's easy enough to work on a language for X new type theory or Y new language feature that I personally think is interesting, but what about everyone else?

This is one of the great failings of programming languages as a modern research field. A lot of the research is driven by the intuitions of the researchers, which are in turn shaped by their specific experiences with programming tools, languages, environments, and so on. An intuitionist approach has clearly taken us quite far to our current standing&mdash;smart people tend to have good intuitions&mdash;but I have to speculate that the apparent stagnation in widespread adoption of modern PL research is due in part to a lack of focus on the end user. A sentiment I've seen repeated is that there have been [no new big ideas since Prolog](https://youtu.be/-I_jE0l7sYQ?t=10m49s).

I believe, then, that viewing programming languages (PL) through a lens of human-computer interaction (HCI) is the most critical meta-problem in the field today. More than ever, we need surveys, interviews, user studies, sociologists, psychologists, and so on to provide data-driven hypotheses about the hard parts of programming. Not just for learners, but for everyone, from the grizzled low-level systems developers to the rising tide of web developers. We're starting to see this in the [Usability of Programming Languages Special Interest Group](https://docs.google.com/document/d/1-GUt5oVPpi7rlObbU1WbA5V1OQBX1iaghryLJ6-ND9o/edit) at CHI (HCI conference), in papers like an [Empirical Analysis of Programming Language Adoption](http://lmeyerov.github.io/projects/socioplt/papers/oopsla2013.pdf), and in emerging [working groups for language usability](https://medium.com/bits-and-behavior/designing-learnable-teachable-and-productive-programming-languages-dagstuhl-trip-report-81e41bde84bd).

However, in the meantime, we can still make progress on core PL problems that we believe to be impactful. The manifesto presented in the remainder of this note stems mostly from my personal experience&mdash;I've been programming for just over a decade now in games (Lua, C), websites (PHP, JS), high-performance/distributed systems (C++, Go, Rust), compilers (Standard ML, OCaml), and data science (Python, R). In the course of these experiences, I've worked on small scripts, personal projects, open-source software, products at tiny (2 people), small (15), medium (500), and big (2000+) companies, and nowadays on academic research. I studied programming language theory at Carnegie Mellon, and these days I teach the [programming language course](http://cs242.stanford.edu/) at Stanford.

All of which is to say, although we need more data, I have done my best to form an educated opinion on problems in programming languages that matter across many domains and actually occur in the real world. Yet still there is much I do not know, and as always, I encourage you to read on with a critical eye.

## Thinking gradually

I hold this fundamental belief: **programming languages should be designed to match the human programming process.**[^1] We should seek to understand how people think about programs and determine what programming processes come intuitively to the human mind. There are all sorts of fascinating questions here, like:
* Is imperative programming more intuitive to people than functional programming? If so, is it because it matches the way our brains are configured, or because it's simply the most common form of programming?
* How far should we go to match people's natural processes versus trying to change the way people think about programming?
* How impactful are comments in understanding a program? Variable names? Types? Control flow?

A basic observation about the human programming process is that it is incremental. No one writes the entirety of their program in a single go, clicks compile + publish, and never looks at the code again. Programming is a long slog of trial and error, where the length of the trial and the severity of the error depend heavily on the domain and the tooling. This is why inspectable output and fast compile times matter, e.g. changing an HTML document and refreshing the page shows you instantly what happened. Bret Victor's [Learnable Programming](http://worrydream.com/#!/LearnableProgramming) discusses this idea in detail.

I call this process **"gradual programming"** [^2] [^3]. While paradigms like imperative or functional programming characterize certain underlying aspects of our mental model of program, gradual programming describes a process by which a mental model is formed. In that sense, gradual programming is just... programming, but I think a new name is helpful in having a clear discussion.

Gradual programming is the programmer tracking the co-evolution of two things: 1) the syntactic representation of the program, as expressed to the computer via a programming language, and 2) a conceptual representation of the program, inside the mind. In the beginning of the process, the programmer starts with no syntax (an empty file) and usually a fuzzy idea of how the final program should work. From this point, she takes small steps in building components of the program until the final version is complete.

If you do programming, you have most certainly gone through this process before and can likely relate, but usually most of the thought process occurs implicitly (i.e. inside your head) and is never reified into a communicable form. To be concrete about this gradual process, let's walk through an example in detail. Let's say I want to write a program to append a line of text to a file. In my head, I have a model of the program that looks like this:

```
input file = some other input
input line = some input
write input line to the end of input file
```

Then I pick a language to work with, in this case Python. To start, rather than try to implement the whole program, I pick just the first line, and attempt to concretely encode it in Python.

```
$ cat append.py
input_file = input()
print(input_file)
```

Here, I made a number of decisions. First, I decided the input was going to come from stdin (for simplicity), and used Python's `input()` standard library function. I had to come up with a name for that value, `input_file`, and that name had to conform to Python's syntactic conventions. I also added a `print` statement not part of my original program model, but instead part of a temporary program model intended to debug my small program. Then if I try to run it:

```
$ echo "test.txt" | python append.py
Traceback (most recent call last):
  File "append.py", line 1, in <module>
    input_file = input()
  File "<string>", line 1, in <module>
NameError: name 'test' is not defined
```

Whoops, I mixed up `input()` and `raw_input()`. This wasn't an issue with my programming model&mdash;I'm still thinking about the program the same way&mdash;just with my encoding in Python. Fixing my mistake:

```
$ cat append.py
input_file = raw_input()
input_line = raw_input()
print(input_file, input_line)

$ echo "test.txt\ntest" | python append.py
('test.txt', 'test')
```

Next, I need to figure out how to append the line to the file. In my initial mental model, this was all encapsulated with "write input line to the end of input file," but now I need to turn that fuzzy idea into more concrete steps that I can easily encode in Python. Specifically, if I understand how a file system works, then I know I need to first open the file in append mode, write the string, and then close the file. After thinking about these details, my new mental model is:

```
input file = some other input
input line = some input
file = open the input file for appending
write input line to the end of input file
close file
```

This then translates into Python:

```
$ cat append.py
input_file = raw_input()
input_line = raw_input()
file = open(input_file, 'a')
file.write(input_line)
file.close()

$ echo "test.txt\ntest" | python append.py

$ cat test.txt
test
```

Success! Again, the purpose of this is to demonstrate the co-evolution of the syntactic and conceptual model of a program over time. Based on my experience programming as well as teaching others to program, I believe it exemplifies a common process underlying the way many people program.

## Axes of evolution

The example above demonstrates the gradual nature of the programming process, but it's not clear yet how we should be creating tools to match that process. To simplify the problem, we want to break down the evolution of a program along many smaller axes of evolution. Essentially, we ask: what kinds of information do people gradually learn and/or write down about their program? Then we can consider how programming languages can help optimize each axis individually.

**1. Concrete / abstract**<br />
In building programs, it's commonplace to start with an example of what you're trying to make, and then generalize (or "abstract") that example to cover a wider range of use cases. Abstraction is the backbone of programming languages, usually provided through functions and interfaces. For example, we can abstract our script above into a function:
```python
def append_line(input_file, input_line):
   # our code above

append_line('test.txt', 'test')
append_line('test.txt', 'test again')
```

However, the fuzzier your program model is initially, the harder it is to immediately jump to an abstract solution, so this evolution from concrete to abstract occurs frequently in today's programming languages (again, see "Create by Abstracting" in [Learnable Programming](http://worrydream.com/#!/LearnableProgramming)).

**2. Anonymous / named**<br />
In the beginning of the programming process during iteration/experimentation, we as programmers naturally want to optimize for the speed of writing code, not [reading code](https://talks.golang.org/2014/names.slide). One form of write-optimized code is short-named and anonymous values. For example, a shortened first pass at our script above might look like:
```python
s = raw_input()
f = open(s, 'a')
f.write(raw_input())
f.close()
```

Here, the variable names are less informative: `s` instead of `input_file`, `f` instead of `file`, and no name provided to the `input_line`. However, it takes less time to write, and if the script will never be read again, then why not? If we intend to use the script in a bigger codebase, then we might decide to incrementally change the names to be more informative for the sake of our code reviewers. This is another good example of gradual change that's easy and commonplace in today's programming languages.

**3. Imperative / declarative**<br />
For a multitude of reasons, straight-line, sequential imperative code appears to come more naturally to programmers than functional/declarative code in their conceptual program model. For example, a simple list transformation will likely use for loops:
```python
in_l = [1, 2, 3, 4]
out_l = []
for x in in_l:
  if x % 2 == 0:
    out_l.append(x * 2)
```

Whereas a more declarative version will abstract away the control flow into domain-specific primitives:
```python
in_l = [1, 2, 3, 4]
out_l = map(lambda x: x * 2, filter(lambda x: x % 2 == 0, in_l))
```

The distinction between the two is not just stylistic&mdash;declarative code is usually much more easily analyzed for structure, e.g. a `map` is trivially parallelizable whereas a general `for` loop less so. This transformation occurs most often in languages which support mixed imperative/functional code (at the very least closures).

**4. Dynamically typed / statically typed**<br />
The rise of dynamically typed languages in the last two decades (Python, Javascript, R, Lua, ...) should suffice as evidence that people find dynamic typing useful, regardless of [which side of the debate](http://danluu.com/empirical-pl/) you take. While there are many advantages of dynamic typing (heterogeneous data structures, free duck typing, ...), the simplest one is that of productivity by omission: the types of variables aren't required to be known at compile time, so the programmer doesn't have to expend mental energy to write them down.

However, types are still immensely useful tools for ensuring correctness and performance, so a programmer may well want to gradually add type annotations to an untyped program as she becomes convinced that a variable should be of a certain type. This is a relatively nascent idea called gradual typing that's caught on in [Python](https://docs.python.org/3/library/typing.html), [Javascript](http://www.typescriptlang.org/),
[Julia](https://docs.julialang.org/en/stable/manual/types/#man-types-1), [Clojure](https://clojure.github.io/core.typed/), [Racket](https://docs.racket-lang.org/ts-guide/),
[Ruby](https://github.com/soutaro/steep), [Hack](http://hacklang.org/), and others. For example, our program above could look like:
```python
input_file: String = raw_input()
input_line: String = raw_input()
file: File = open(input_file, 'a')
file.write(input_line)
file.close()
```

**5. Dynamically deallocated / statically deallocated**<br />
You can view memory management, or lifetimes, through a similar lens as types. In 2018, all programming languages should be [memory safe](http://willcrichton.net/notes/rust-memory-safety/), with the only question being whether memory deallocation is determined at compile time (i.e. like Rust, with a borrow checker) or at run time (i.e. like every other language, with a garbage collector). Garbage collection is unquestionably a productivity boost for programmers, as it's natural that our initial program model shouldn't have to consider exactly how long each value should live before deallocation.

However, as before, having fine-grained control over value lifetimes is still useful both for correctness and performance. Ownership and borrowing like in Rust can help structure a system to [avoid data races](https://blog.rust-lang.org/2015/04/10/Fearless-Concurrency.html) in concurrent programming, as well as avoid the use of a costly garbage collector at runtime. Deterministic destruction can be useful for avoiding mistakes with things like mutexes. Continuing our typed example, it could look like:
```python
input_file: String = raw_input()
input_line: String = raw_input()
file: mut File = open(&input_file, 'a')
file.write(&input_line)
file.close()
```

Unlike gradual typing, to my knowledge, there is little work on gradual memory management (except [this whitepaper](https://drive.google.com/file/d/0B_4wx_3dTGICWG1Ddk81Rnh0YzA/view)).

**6. General-purpose / domain-specific**<br />
When beginning to write a program, the programmer wants to have every feature in her language of choice available for use in the implementation in order to maximize the speed of prototyping and the productivity of the creative process. This is not usually on the minds of most as they develop software, except perhaps from a code style perspective ("what subset of Python should I be using?").

However, the emerging wave of high-performance domain-specific languages like [TensorFlow](https://www.tensorflow.org/), [Halide](http://halide-lang.org/), [Ebb](http://ebblang.org/), and [Weld](https://www.weld.rs/), have identified that if the programmer only uses a small subset of general-purpose programs, e.g. differentiable pure functions on tensors, then an optimizer can produce substantially more efficient code or automatically perform backpropagation. From a gradual perspective, this suggests a possible future workflow where as the programmer gradually shrinks the subset of the language she uses in a particular part of her program, the compiler is able to provide more features or more optimized generated code.

## A vision for gradual programming

The axes identified are not novel in the sense that, for example, static vs. dynamic typing is a well-worn trade-off. However, what I am demonstrating is that these are not one-time decisions that never change over the course of a program. Instead, all of these axes likely a) change over the evolution of an individual program, and b) change in a fine-grained manner, e.g. typed and untyped code should be mixed in the same system. This is anathema to the all-or-nothing approach that most languages take today: everything should be typed, or nothing should be typed. Everything is garbage collected, or nothing is garbage collected. That requires programmers to face absurd tradeoffs, like changing entire language ecosystems just to get the benefits of static typing.

In that light, advancing gradual programming entails the following research process:
1. Identify parts of the programming process that change gradually over time, but currently require undue overhead or switching languages to adapt.
2. Develop language mechanisms that enable programmers to gradually move along a particular axis within a homogeneous programming environment.
3. Empirically validate against real programmers whether the proposed mechanisms match the hypothesized programming process in practice.

Each of these steps needs further investigation. I have provided an initial breakdown of my perspective on the important incremental parts of the programming process, but I have inevitably omitted many others. Several of the axes mentioned (memory management, language specialization) lack any documented attempts to systematize their treatment at the language level. I think that work on [extensible compilation](http://willcrichton.net/notes/extensible-compilation/) will help speed development of language extensions on these fronts.

Even for more well-trodden frontiers like gradual typing, papers as recent as 2016 were asking ["is sound gradual typing dead?"](https://www2.ccs.neu.edu/racket/pubs/popl16-tfgnvf.pdf) (it's [alive and well](http://www.cs.cornell.edu/~ross/publications/nomalive/nomalive-oopsla17.pdf), thank you very much). CircleCI [dropped Clojure's gradual typing](https://circleci.com/blog/why-were-no-longer-using-core-typed/) after two years of use, while TypeScript is [beloved by many](https://insights.stackoverflow.com/survey/2018#most-loved-dreaded-and-wanted). Although the theory is well understood and the performance increasingly so, little advice or knowledge exists on how programmers interact with gradual types. Are they easy to program? Is a partially typed program more confusing than fully typed/untyped? Can IDEs solve any such issues? And so on.

Another big question in gradual programming is inference vs. annotation. As our compilers get smarter, it becomes easier for information like types, lifetimes, and so on to be inferred by the compiler if not explicitly annotated by the programmer. However, inference engines are rarely perfect, and when they don't work, every inference-based language feature (to my knowledge) will require an explicit annotation from the user, as opposed to inserting the appropriate dynamic checks. In the limit, I envision gradual systems have three modes of operation: for any particular kind of program information, e.g. a type, it is either explicitly annotated, inferred, or deferred to runtime. This is in itself an interesting HCI question--how can people most effectively program in a system where an omitted annotation may or may not be inferred? How does that impact usability, performance, and correctness? This will likely be another important avenue of research for gradual programming.

Overall, I'm very excited by the promise of gradual programming techniques. As they catch on, I believe programmers of all skill levels will benefit from languages which better match the way they think.

Please direct comments and criqitues to my [inbox](mailto:wcrichto@cs.stanford.edu) or [Hacker News](https://news.ycombinator.com/item?id=16725577).

[^0]: See Graydon Hoare's ["What's next?"](https://graydon2.dreamwidth.org/253769.html) and Stephen Diehl's ["Near Future of Programming Languages"](http://dev.stephendiehl.com/nearfuture.pdf) for further discussion on this topic.

[^1]: The "human" part of this may seem obvious, but there is a tradeoff in designing a language intended for consumption by computers vs. by people. Languages written by humans have the problem of being in both camps, although there are languages (e.g. LLVM) which are, for the most part, exclusively for machines.

[^2]: I would prefer "incremental" programming, but [incremental computation](https://en.wikipedia.org/wiki/Incremental_computing) already has a different, well-defined meaning, and the PL community has coalesced on "gradual" as the appropriate term.

[^3]: To my knowledge, the only prior use of the term "gradual programming" is in [this position paper](https://pdfs.semanticscholar.org/c4cc/7f05e105d188433b1a72ec4507a3b1b5273b.pdf), and they have a somewhat similar motivation but substantively different perspective on the solution. Also note the last author, Jeremy Siek, is one of the inventors of gradual typing.
