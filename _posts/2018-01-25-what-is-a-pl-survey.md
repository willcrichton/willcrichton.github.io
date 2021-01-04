---
layout: post
title: "What is a PL? Survey says: SQL yes, Excel maybe, HTML no"
abstract: Following up on the "What is a programming language?" survey, it appears there's a wide range of disagreement amongst my readers of what constitutes a programming language. I attempt to analyze possible sources of disagreement.
---

_This note is a follow-up to the survey in my previous note, [What is a programming language?](http://willcrichton.net/notes/what-is-a-programming-language)._

**IMPORTANT**: Before reading onwards (and biasing yourself), I encourage you to fill out the accompanying survey: [https://goo.gl/forms/CuZJEziNTIRU3Q4p1](https://goo.gl/forms/CuZJEziNTIRU3Q4p1){:target="blank"}

Previously, I asked: what is a programming language? I have my own crazy ideas, but I wanted to hear from you. And you overwhelmingly responded: `¯\_(ツ)_/¯`

![](/images/assets/what-is-a-pl.png)

The above graph was generated from [this survey](https://docs.google.com/forms/d/e/1FAIpQLSeH6Y1dcEBGAoLo5hUkQ5kSOMiFUnuicYfAwZJpGKjrZmxoWQ/viewform) (as of 2/21/18), where I asked readers "Yes/No/Abstain" to whether a number of tools should be considered programming languages. The values graphed are the percentage of people who think that the tool is a programming language (excluding "Abstain" results). The respondents largely consist of readers from Hacker News and Reddit. I will continue to update the graph as more readers respond to the survey.

As expected, a vast majority of respondents agree on the traditional PLs: C, Java, and Javascript. Past that, the results get more interesting!
* **Verilog**: most agree Verilog, the hardware description language, is a programming language, although it had one of the highest rates of abstention. Respondents likely agree that even though the output of the software is hardware, the process of generating the hardware is still programmatic.
* **SQL**: A comfortable majority agree that SQL is a PL, but many are presumably turned off by its lack of Turing-completeness. SQL after all does not have for loops and classes, but it does still have arithmetic expressions, functions, and variables.
* **C preprocessor**: I'm fascinated that more respondents consider the C preprocessor a PL than regular expressions. The C preprocessor is, essentially, a string replacement engine that's less featured than regex (see [Rust macros](https://doc.rust-lang.org/book/first-edition/macros.html) for a more regex-y style of macros), but that is only used for generating C code. So respondents appear to believe that the fact that the language is being used to generate code is the key factor making this a PL.
* **LaTeX**: The closest language to the border---respondents are split on whether the famous document specification language is a PL. LaTeX has variables, functions, and many other PL-like features ([LaTeX is Turing-complete!](https://www.sharelatex.com/blog/2012/04/24/latex-is-more-powerful-than-you-think.html)), yet because its output is a document and not general-purpose, I expect many don't consider it a language.
* **Regex**: surprisingly few respondents agree, see C preprocessor for comparison.
* **CSS**: Getting into the web languages, a minority of respondents consider CSS a programming language. After all, it is purely declarative (well, [almost](https://developer.mozilla.org/en-US/docs/Web/CSS/calc), and extensions often include [variables and mixins](http://sass-lang.com/guide)).
* **TensorFlow**: This one also surprised me. TensorFlow is a dataflow language that has [variables](https://www.tensorflow.org/api_docs/python/tf/placeholder), [loops](https://www.tensorflow.org/api_docs/python/tf/while_loop), a [compiler](https://www.tensorflow.org/performance/xla/), and more. Yet, presumably because it's a domain-specific language, and it doesn't have a standalone syntax (it's programmed usually via a Python API), most respondents don't consider it a programming language.
* **HTML**: Probably same reasons as CSS.
* **JSON**: JSON is a data specification language, which most people seem not to consider a programming language, like because there's no evaluation (expressions, statements, etc.).
* **Microsoft Word**: GUIs can't be programming languages!
* **Eclipse**: Definitely not code GUIs!

For an alternative perspective, I encourage you to read my [earlier post]([What is a programming language?](http://willcrichton.net/notes/what-is-a-programming-language)), wherein I make the claim that _all_ of the above are programming languages. That means when it comes to things like Eclipse, I am the 1%!

Discuss this on [Hacker News](https://news.ycombinator.com/item?id=16236950) or send me an email at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu).
