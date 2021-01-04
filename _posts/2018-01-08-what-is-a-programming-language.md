---
layout: post
title: What is a programming language?
abstract: What is or isn't a programming language is a surprisingly subjective question. In this note, I try to nail down the major factors (precision, composition, reuse) that make a language/model programmatic and clarify this definition vs. other related terminology likes libraries and data formats.
---

Consider the following tools, and for each one, ask yourself: is this a programming language?

<div class="row">
    <div class="col-md-4">
    <ul>
    <li>Java</li>
    <li>Eclipse</li>
    <li>Javascript</li>
    <li>CSS</li>
    <li>HTML</li>
    </ul>
    </div>
    <div class="col-md-4">
    <ul>
    <li>C</li>
    <li>C preprocessor</li>
    <li>JSON</li>
    <li>Verilog</li>
    <li>Regular expressions</li>
    </ul>
    </div>
    <div class="col-md-4">
    <ul>
    <li>LaTeX</li>
    <li>Microsoft Word</li>
    <li>SQL</li>
    <li>Excel</li>
    <li>TensorFlow</li>
    </ul>
    </div>
</div>

Before reading the rest of this post, please put your answers here and see how others have voted: [https://goo.gl/forms/CuZJEziNTIRU3Q4p1](https://goo.gl/forms/CuZJEziNTIRU3Q4p1){:target="blank"}

I posed this set of questions to the students taking my programming languages class ([CS 242](http://cs242.stanford.edu)) here at Stanford, and found an amusingly wide range of disagreement across the spectrum. For example, everyone agrees Java and C are languages, but less so about SQL and the C preprocessor. Most think JSON is not a programming language, and only the extremists consider Microsoft Word a PL. Why? What causes such a disparity in our collective understanding of what is or is not a programming language?

## Background

In developing the curriculum for CS 242, I found myself struggling to provide a clear picture of the fundamentals of programming languages. What are programming languages, and how should we teach them? I searched far and wide through textbooks, curricula, lectures, blog posts, and so on, but still never found (to my mind) a satisfactory overview, so I'd like to take a few notes to discuss programming language pedagogy and hear the perspectives of the community. In this note, I will discuss the most basic question of the field: what is a programming language?

Let us first look to the community. How have others tried to define "programming language"? I found that many of these definitions were either overly specific (excluding things that I would reasonably consider a programming language), or overly general (not useful in providing an understanding). A few examples:
> "A vocabulary and set of grammatical rules for instructing a computer to perform specific tasks."
> <br /> -- [Fundamental of Programming Languages](http://www.springer.com/us/book/9783642694080) (Ellis Horowitz)

> "A programming language is a notation for writing programs, which are specifications of a computation or algorithm."
> <br /> -- [Wikipedia](https://en.wikipedia.org/wiki/Programming_language)

> "Programming languages are the medium of expression in the art of computer programming."
> <br /> -- [Concepts in Programming Languages](https://www.amazon.com/Concepts-Programming-Languages-John-Mitchell/dp/0521780985) (John Mitchell)

> "A good programming language is a conceptual universe for thinking about programming."
> <br /> -- Alan Perlis

A number of definitions for both "programming language" and "program" (e.g. the Horowitz one above) often strike a far too imperative tone. A programming language can be declarative, specifying what should be computed, but not how, e.g. SQL and Prolog. This raises an interesting question--how declarative can a programming language be before it is not a programming language any longer? Most probably would not consider JSON a programming language, but what if we added arithmetic expressions to JSON? Regular expressions? Conditionals? Could we quantify the smallest delta from not-a-language to is-a-language?

Some definitions, like the Wikipedia one, aren't useful since they largely punt the problem to understanding what a computation or an algorithm is. Others, like the ones from Mitchell and Perlis[^1], are nice aphorisms but not something that helps me understand what a programming language is.

## Creating a definition

For lack of a better definition, it's time to devise our own. Most reductively, a programming language is a language for defining programs, requiring us to define both "program" and language". The latter is much simpler, so we can start there.

A language is a means of communicating ideas. Languages for programming are most often written, but that is by no means a requirement---a _visual_ language can use visual primitives for communication, an idea well understood in the worlds of art and marketing, but only recently catching hold in the programming community. To date, most visual programming languages are marketed for children (e.g. [Scratch](https://scratch.mit.edu/)), but I would argue that many GUIs for creating documents could be considered visual programming languages. LaTeX is arguably a programming language, so if I create a Word to LaTeX compiler, isn't Word now a programming language? When you use Eclipse to generate getters and setters for your Java classes, you're effectively using a point-and-click visual language of Java macros.

Regardless of being textual or visual, a programming language allows you to take the abstract idea of a program, however you define program, and communicate it to a person or a machine via _materialization_---the transformation of the idea into the concrete medium of the language. Human languages are often materialized acoustically (by talking), whereas programming languages are almost exclusively materialized by typing or clicking. Also, note that while we traditionally think of programming languages as a communication layer between humans and computers, they are equally (if not more importantly) means of communication between humans, a perspective little explored in the PL community (see: [Andy Ko's SPLASH keynote](https://www.youtube.com/watch?v=TjkzAls5fsI) and [Usability of Programming Languages SIG meeting at CHI'2016](https://docs.google.com/document/d/1-GUt5oVPpi7rlObbU1WbA5V1OQBX1iaghryLJ6-ND9o/edit)).

## What is a program?

Defining the term "program" is much more difficult. Again, most common definitions will use the term "series of instructions", but this is silly since languages don't need to specify instructions in a series (think [dataflow](https://en.wikipedia.org/wiki/Dataflow)), and often don't even have a notion of "instructions" if they are sufficiently declarative. A good way to start defining a fuzzy term is to draw from machine learning and classify terms by their features. What trends do we often see across tools we consider to be programming languages?

1. *Precision.*{:class="hl"} Programming languages attempt to avoid ambiguity, striving for the goal that given a program, there is precisely one meaningful interpretation of its semantics. This precision should exist at both the syntactic level (the grammar is unambiguous, syntax is strictly enforced---don't miss that semicolon!) and the semantic level (a given parse tree always produces the same program). There are few notions of "almost correct." This contrasts with human language, where both syntax ("bear" (animal) vs. "bear" (to carry)) and semantics ("He fed her (cat food)." vs. "He fed (her cat) food.") are frequently ambiguous.

2. *Composition.*{:class="hl"} Rather than define a large, fixed list of all the operations a program can perform, programming languages attempt to provide a small set of primitives which can infinitely compose to extend the expressive range of the language. This strikes more closely at the heart of PL research--what is the smallest set of primitives needed to express a particular class of computations (in particular, safely)? What if we got rid of for loops and instead used folds and maps? What if we got rid of breaks/returns and used exceptions?

3. *Reuse.*{:class="hl"} Nearly every language has some means of reusing code/memory/etc. either explicitly (with identifiers/variables) or implicitly (with code analysis). In a sense, this is the most fundamental operation of PL theory---the only primitives in the untyped lambda calculus are declaration and substitution of named values.

...And that's all I have. I feel like there should be more bullet points, but I haven't been able to think of any additional qualities which really apply to all programming languages.

However, in the spirit of being precise, I must clarify the distinction between programs being _abstract_ or _concrete_. In my preferred terminology, a programming _model_ is an abstract and (preferably) precise/composable specification of... things[^2]. A programming _language_ is a syntax for expressing programs in a given model. Again, a language is simply a means for communicating an idea, not the idea itself. Lastly, the term _program_ is ambiguous; it either refers to an instance of a model (abstractly) or a language (concretely). This distinction is worth identifying since the translation can be lossy---limitations of a language might preclude us from concretely expressing programs that we believe to be part of a language's programming model.

## Definition by contrast

If the features above provide positive information about what could be a programming language, then we also should provide negative examples---what _isn't_ a programming language?

1. *Libraries.*{:class="hl"} The line between a library and a language is blurry, particularly when discussing domain-specific languages (DSLs), and _particularly_ for embedded DSLs. See ["What isn't a high-performance DSL?"](http://composition.al/blog/2017/04/30/what-isnt-a-high-performance-dsl/){:target="blank"}. Consider a library for performing arithmetic in Python. If I write the program:
   ```python
   z = 1 + 2
   ```
   This is unambiguously a program in the Python programming language, right? Now let's say I define some helper functions:

    ```python
    def add(x, y):
        return x + y

    def mul(x, y):
        return x * y

    z = add(mul(3, 4), 2)
    ```
    I'm using Python features (functions), so this still feels like a Python program. If I exported the `add`  and `mul` functions, that would be a silly library. But what if we did this:
    ```python
    class Int:
        def __init__(self, n):
            self.n = n

        def run(self):
            return self.n

    class Add:
        def __init__(self, x, y):
            self.x, self.y = (x, y)

        def run(self):
            return self.x.run() + self.y.run()

    program = Add(Add(Int(3), Int(4)), Int(2))
    z = program.run()
    ```
    Hmm, that looks a lot like an interpreter to me, which smells like a programing language... and all I did was explicitly _stage_ the representation of the arithmetic program, i.e. allow the creation of the program to occur in a separate step from its execution[^3]. If you're not convinced, what if I replaced the `run` function with a JIT compiler that outputs optimized C code for the input arithmetic expression? What if I added [placeholders](https://www.tensorflow.org/api_docs/python/tf/placeholder){:target="blank"} along with my [constants](https://www.tensorflow.org/api_docs/python/tf/constant){:target="blank"} and then called it NumberFlow?

    What, then, distinguishes a library from a language? In [this post](http://tagide.com/blog/research/constraints/){:target="blank"}, Crista Lopes writes that languages are able to provide _constraints_, whereas "libraries cannot provide new inabilities." This is a useful perspective, but I think is overly assertive about the inability of libraries to enforce inabilities. In my mind, libraries usually enforce constraints at _runtime_, whereas programming languages more often enforce them at _compile time_[^4]. For example, concurrency libraries can provide the inability to have data races, but enforce this through runtime checks, not static analysis.

    Instead, I think the primary distinction is actually staging. An embedded language has some kind of program representation that is separated from its execution, enabling some form of analysis or compilation. This doesn't mean everything lazily computed is suddenly a language, but at least suggests that systems like [Spark](https://spark.apache.org){:target="blank"} or even [Rust's iterators](https://doc.rust-lang.org/std/iter/trait.Iterator.html){:target="blank"} could be considered a language unto themselves.

2. *Declarative languages.*{:class="hl"} Programmers have historically drawn a line where a programming language is sufficiently declarative, and called it something else. Notable labels include:

   1. Specification languages like [TLA+](https://en.wikipedia.org/wiki/TLA%2B) which describe the behavior of systems at a high level.
   2. Data languages/formats like YAML/JSON/Protobuf which do not describe actions, only data.
   3. Markup languages like HTML/CSS/Markdown, or data languages that describe visual layouts.

   Some would argue<sup>[[who?](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Words_to_watch#Unsupported_attributions){:target="blank"}]</sup> these are not programming languages, as a programming language requires some kind of evaluation, some semantics. There should be a class of programs which are reducible to others, in the way 1 + 1 steps to 2.

    That's a tenuous line of reasoning. HTML, for example, is not reducible, but still evaluated by a markup engine that converts it into a display. And there are infinite template engines that extend HTML with various programming language-y constructs, so the line blurs. These languages exhibit composition and precision, although arguably most data formats lack a mechanism for reuse. I would consider this a failing on the part of the languages though, not a reason to disqualify them as programming languages entirely---that's why endless variants of CSS exist primarily to add variables and mixins, but that doesn't mean CSS wasn't a programming language to begin with. Ultimately, while it's useful to distinguish the extent to which a language is declarative, I think wholly declarative languages are still programming languages.

## Conclusion

A programming language, then is a means of communicating programs in a programming model, usually in a textual or visual medium. A model is "programmatic" if it is precise, composable, and reusable. This is a liberal definition---I would consider every tool listed at the beginning of this note to be a programming language. Using such a broad definition has two benefits:

1. Broadening our perspective on what is a programming language allows us to consider how we can apply lessons from PL design to many different application areas, e.g. not just recognizing that we need variables in our data languages, but reusing time-tested techniques for implementing them correctly (like lexical scoping).

2. Conversely, a liberal definition encourages programming language research to diversify. Top PL conferences are strongly concentrated around theoretical topics with an emphasis on correctness and theorem proving, but expanding the set of topics considered legitimate PL research could spark greater cross-pollination with related academic communities.

That said, these definitions are simply my earnest attempt to provide some conceptual clarity into what it means to be a program, a language, or both. I would love to hear your perspective on either improving these definitions or replacing them entirely. Feel free to leave a comment on [Hacker News](https://news.ycombinator.com/item?id=16148820){:target="blank"} or email me at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu).

_Thanks to Katherine Ye for early feedback._

[^1]: To be fair, this is attempting to clarify a _good_ programming language, not define the term itself, but I thought it worth including.

[^2]: I wish I had something more erudite to say here, but a program can theoretically specify anything, so long as it does so (ideally) precisely and composably. "Things" are actions, ideas, data, and so on.

[^3]: The intrepid Python programmers may note that one could also stage the second example by extracting the Python syntax tree, so is it really that different in the abstract? See [typy](https://github.com/cyrus-/typy) for an extreme example of this.

[^4]: Dynamically-typed languages, then, are the libraries of programming languages.
