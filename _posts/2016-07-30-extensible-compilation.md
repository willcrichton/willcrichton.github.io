---
layout: post
title: 'Extensible Compilation: Goals and Related Work'
abstract: "We need programming languages that can evolve with us as our requirements and coding styles change. I look at prior work in components of such an extensible compiler: combining static and dynamic types, breaking the GC/systems divide, and lowering the barrier to DSLs. I consider how we can combine these features into a single language, and argue for a few design decisions to underpin this new language."
---

_Note: this post is part of an ongoing series on extensible compilation. See [Part 1: "A Coming Revolution in Metaprogramming"](http://notes.willcrichton.net/the-coming-age-of-the-polyglot-programmer/) and [Part 2: "Rust: The New LLVM"](http://notes.willcrichton.net/rust-the-new-llvm/)._

_Warning: this post contains strong opinions on programming languages. Viewer discretion is advised._

## Introduction

Software development, like progress, most often happens in small increments. I have never encountered a large piece of software that was written perfectly on the first try. And even if someone is capable of such a feat, the requirements will assuredly change the day after it's done. This means that we need tools and idioms for creating software that can evolve with the programmer as he understands more of the program he is writing.

This is a well-studied area of computer science which all developers have experienced in one form or another. For example, modularity is an important programming pattern for incremental progress. When you break up your code into components, it makes it easier to refactor individual pieces when the requirements change and to fix bugs when you mess up. It enables a team to work in parallel instead of individual developers contributing to a monolith. Over the last couple decades, we have developed countless kinds of development patterns like this for promoting good software.

However, as patterns and tools and ecosystems have sprung up in multitudes to ease the pains of software development, surprisingly little of the enormous progress made in programming languages/compiler development has found its way into the mainstream. Today, most developers use inflexible, unsafe languages with limited type systems. Closures have existed since 1975 but only got into Java and C++ this decade. Rust is the first major language to promote composition over inheritance with traits. Type inference is largely limited to ML/Haskell-style languages. Languages continue to proliferate today in increasing numbers to solve these issues, but they rarely find any real adoption [^1].

I believe that the next step in programming language development should be the creation of an extensible compiler, or a language/runtime that can change with the needs of its users instead of forcing them to conform to a particular paradigm [^2]. In this note, I'm going to look at three concrete examples of how language-level improvements can adopt the incremental software development philosophy: hybrid type systems, fusing high/low level runtime, and interoperability with domain-specific languages. I will evaluate prior work in each of these areas and conclude with a vision for how to combine these advances together into a single extensible compiler.

## 1. Hybrid type systems

Dynamic or static typing? This question has sparked decades of controversy and flame wars between language fanatics. For now, let's assume the position that they both have their place in the world. Clearly, many programmers find it more productive to prototype code and write small applications in dynamically-typed scripting languages like Python, Javascript, Ruby, Lua and so on. Static typing provides a myriad of benefits in both catching bugs at compile-time and generating more efficient code. So if they both have their benefits, why are we asked to choose? Because most languages traditionally pick one of these paradigms and refuse to budge. Types or bust.

However, a number of potentially practical solutions to the static/dynamic typing divide have emerged within the last decade and are slowly making their way into commonly used languages. These are largely based on [gradual typing](http://wphomes.soic.indiana.edu/jsiek/what-is-gradual-typing/), a novel type system created by Jeremy Siek and Walid Taha in 2006 that merges static and dynamic typing with optional type annotations. This has since been implemented in [TypeScript](http://siek.blogspot.com/2012/10/is-typescript-gradually-typed-part-1.html), [ActionScript](http://blogs.adobe.com/avikchaudhuri/2012/01/17/type-inference-for-actionscript/), [Racket](https://docs.racket-lang.org/ts-guide/), [Clojure](http://typedclojure.org/), and a few other languages. There are also proposals to introduce gradual typing in the form of type hints to [Python](https://www.python.org/dev/peps/pep-0484/). Here's an example of a generic logger in typed Python:

```python
from typing import TypeVar, Generic
from logging import Logger

T = TypeVar('T')

class LoggedVar(Generic[T]):
    def __init__(self, value: T, name: str, logger: Logger) -> None:
        self.name = name
        self.logger = logger
        self.value = value

    def set(self, new: T) -> None:
        self.log('Set ' + repr(self.value))
        self.value = new

    def get(self) -> T:
        self.log('Get ' + repr(self.value))
        return self.value

    def log(self, message: str) -> None:
        self.logger.info('{}: {}'.format(self.name, message))
```

Consider again the idea of incremental development: to develop software with hybrid typing, you can first quickly write your program using dynamic types to get maximum productivity, and then as performance becomes more important or the codebase grows large, gradually start to add type annotations to the most important interfaces until almost all the code becomes fully type-safe. The language grows with the developer in a smooth fashion.

However, the work here is far from finished. Many attempts at gradual typing have been "[disastrous](http://www.ccs.neu.edu/racket/pubs/popl16-tfgnvf.pdf)" for performance, and companies like CircleCI that tried ended up [dropping support for it](https://circleci.com/blog/why-were-no-longer-using-core-typed/). Because gradual typing is a new idea, we haven't figured out the best way to create a stable ecosystem of libraries that integrate into a hybrid typing system. I personally think that ["like" types](http://www.di.ens.fr/~zappa/projects/liketypes/paper.pdf) are a cool idea that might ameliorate some of these issues. Additionally, we need more work on gradual typing for languages with type inference. This was explored by [Siek 08](http://ecee.colorado.edu/~siek/dls08igtlc.pdf) and more recently in [ActionScript](http://www.cs.umd.edu/~avik/projects/iogti/paper.pdf), but we should explore hybrid typing in the context of languages like OCaml and Haskell instead of just as a bolt-on to dynamically typed languages.

## 2. Fusing high-level and systems languages

Many software systems rely on high-performance components. Numerical computing uses hand-tuned GPU routines for functions like multiplying matrices. High-frequency trading requires micro/nanosecond latency networking. Backend web development uses high performance databases and efficient file servers. However, in almost all of these cases, the majority of the system does not need to be written at the low-level. For example, most data scientists use tools like Matlab, R, or numpy which provide a high-level abstraction so you can translate mathematical formulae into code with relative ease while still getting high performance. These kinds of applications need the ability to customize the software stack at many layers and to have each layer interoperate with the rest.

Most popular languages that I'm aware of usually have some form of interop with C. Java has the [Java Native Interface](https://en.wikipedia.org/wiki/Java_Native_Interface) (JNI), Python has well documented [C extensions](https://docs.python.org/3/extending/extending.html), Haskell has [language-c](https://hackage.haskell.org/package/language-c), and so on. These kinds of interfaces usually run into two issues:

1. *Low-level interfaces are fragile and verbose.*{:class="hl"} When writing a C extension to Python, for example, the programmer has to do manual reference counting on any Python values used by the C code (more generally, it's a hard time to move beteween a language with runtime management of memory and a language with compile time management). Error information often gets propagated through null pointers. For example, this snippet from the [Python interface tutorial](https://docs.python.org/3/extending/extending.html") calls a function with an argument:
```c
PyObject *arglist;
...
arglist = Py_BuildValue("(l)", eventcode);
result = PyObject_CallObject(my_callback, arglist);
Py_DECREF(arglist);
if (result == NULL)
    return NULL; /* Pass error back */
/* Here maybe use the result */
Py_DECREF(result);
```

2. *Type information gets lost at the border.*{:class="hl"} The C/C++ type systems are not as expressive as those of higher-level languages, so a large amount of glue is required to convert values between the runtimes such that both can understand the other.

To date, the best attempt I've seen at integrating high-level and systems languages is Haskell's [language-c](https://hackage.haskell.org/package/language-c), although I haven't used it extensively so I can't comment on its virtues or vices. As detailed in my prior notes, I'm also working on [Lia](https://github.com/willcrichton/lia), a high-level language that compiles to Rust for this exact reason. Most of the work I've seen in these kinds of interfaces has been largely engineering, not research&mdash;if anyone has good references for work in these areas, please let me know and I can update this section.

## 3. Interoperability with Domain-Specific Languages

Sometimes the syntax and semantics provided to us by a general-purpose language just isn't right for the job at hand. In such a case, we again want our language to grow with us and to change as we see fit. Domain-specific languages (DSLs) are a great tool to concisely express software like user interfaces or data analyses. Web programmers routinely make use of DSLs: HTML for expressing webpage layouts and CSS for writing style rules on HTML documents. Java developers can use Groovy to define custom data/configuration formats. A large body of research in the last decade has focused on both creating DSLs like [Halide](http://halide-lang.org) and creating frameworks to create DSLs like [Delite](http://stanford-ppl.github.io/Delite/) and [Terra](http://terralang.org/).

However, many new DSLs fail to find traction because of insufficient interoperability with existing languages. DSLs need to be designed as embedded languages within existing ecosystems in order to be maximally usable. The solution is that our compilers must be more extensible at the parser and type level so as to be composable with other compilers. I discuss this point at length in [part 1](http://notes.willcrichton.net/the-coming-age-of-the-polyglot-programmer/) specifically with respect to Terra and [Wyvern](https://www.cs.cmu.edu/~aldrich/wyvern/), so I encourage you to read through the note for perspective.

## Combining Forces: An Example

The question now becomes: how can we design a language/compiler with all these features? What would that language even look like? As an example, I've created what I'll call an "artist's rendering" of how such an extensible language could be used to implement a webpage. This is ExtLang, an OCaml-y and by-default garbage collected language with a gradual type system.

{% raw %}
```raw
type Server {
  routes: Map<URL, Request ⟶ Response>;
  ...
}

public fn Server::route(
  self, route: URL, callback: Request ⟶ Response)
{
  self.routes[route] = callback;
  ...
}

private fn Server::copy_packets(self) {
  let n = self.packets.size();
  rust{
    let mut buff = Buffer::new({n})
    let mut offset = 0;
    for i in 0..{n} {
      let packet = self.packets[i].borrow_from_gc();
      memcpy(buff.ptr + offset, packet.ptr, packet.size());
      offset += packet.size();
    }
    ..
  }
}

fn main() {
  let server = Server::new();
  let db = Database::new(url{my-db.localhost:3000});
  let server_path = url{search-test};

  @server.route(url{{server_path}/search})
  fn search (req) {
    return html{
      <html>
        <head>
          <style> {css{
            body {
              background: {url{{server_path}/images/bg.jpg}}
            }
          }}
          </style>
        </head>
        <body>
          <h1>Search results:</h1>
          {format_results(sql(db){
            SELECT * FROM products
            WHERE title LIKE {req["searchQuery"]}
          })}
        </body>
      </html>
    }
  };

  server.serve(port=80)
}
```
{% endraw %}

Here, different languages are embedded via the `<lang_name>{}` notation, and each sub-language can have values from the base language. Notably, I use five different sub-languages here: Rust to handle low-level memory operations for transferring packets, HTML to define my webpage, CSS to style it, SQL to fetch results from a database, and URLs to have a URL interface that's not "stringly typed." This is clearly not a compiling example, but I think it's indicative of how we could combine the aforementioned extensions into a single language.

1. For hybrid typing, we see `req["searchQuery"]` used as a part of the SQL query. `req` could be like a Python dictionary in that a given key isn't guaranteed to exist, and its value are dynamically typed. This allows the programmer to use the search parameters quickly without having to put in error checking or type casting. However, the server object is statically typed, so assuming it would be given to the programmer as a library, it could run more efficiently than if the types were unknown.
2. For system/high-level interop, the server implementation shows how one could drop down from the garbage collected base language into a systems language with greater control over memory. However, only the relevant parts of the server are implemented this way, so the rest of the server implementation can be written productively at a higher level.
3. For DSL interop, because each language is written as an extension to the base language, it's dead simple to compose them with close to no glue.

## High-level Design

Implementing ExtLang to fulfill the above specification requires a couple of notable design decisions to become an extensible compiler. I'll walk through each and compare them to existing languages with similar capabilities.

1. *Extensible parsing.*{:class="hl"} The user should be able to add new productions to the language's grammar at compile time, similar to the work in [SugarJ](https://www.student.informatik.tu-darmstadt.de/~xx00seba/projects/sugarj/) and [Wyvern](https://www.cs.cmu.edu/~aldrich/papers/ecoop14-tsls.pdf). This extension would constitute the macro system for ExtLang, and each macro could either be simple substitution template macros or procedural macros. The procedural macros could choose to compile to ExtLang syntax or compile into the lower level systems language, similar to [Terra](http://terralang.org/).
2. *Gradual typing with inference.*{:class="hl"} The program could be typed with the following idea: for each variable, attempt to infer its type, and if that fails or if the variable can take on multiple types, then assign its type at runtime. During code generation, if the type of a variable is known, then make optimizations based on that information (e.g. if you know a variable is an integer and you use it in an arithmetic operation, then you don't need to generate instructions to check its type before doing the operation). This is most similar to ActionScript in the status quo.
3. *Compile to Rust.*{:class="hl"} I already laid out many of the benefits in my [controversial previous post](http://notes.willcrichton.net/rust-the-new-llvm/), but the gist is this: if the runtime for ExtLang is written in Rust, then it's a lot easier to have Rust extensions, similar to how CPython makes it easier to call out to C. However, because Rust's type system is far more expressive than that of C, it will be easier to translate between the two languages with minimal glue. By compiling to Rust, ExtLang can have seamless interoperability with a systems language [^3].

## Moving Forward

After two months of research, discussion, and thought, this is the last post in the series I'll publish before getting some real results. I wanted to write this to put my previous posts into context and attempt to start a real bibliography on the area. I hope to continue my work with [Lia](https://github.com/willcrichton/lia) and slowly evolve it into my vision for ExtLang.

That said, I will be taking a hiatus from language development for at least the next few months to start my Ph.D. on a collaboration with some [great](http://www.cs.cmu.edu/~kayvonf/) [folks](http://www.cs.cmu.edu/~apoms/) at CMU. I'm continuing [my senior thesis](http://willcrichton.net/thesis.pdf) in exploring interfaces/languages for large-scale visual data applications. Stay tuned for more on that soon!

As always, if you have any opinions or incredulous tirades, please direct them my way at [wcrichto@stanford.edu](mailto:wcrichto@stanford.edu) or post them in the comments.

## References

[^1]: This occurs for a multitude of reasons, each of which could be analyzed in its own note. Some languages are primarily research tools intended as short explorations for paper publication, so they become user unfriendly. Other languages focus hard on language-level features but leave tooling (e.g. IDEs, syntax highlighters, linters) to languish. And rarely do these new languages interoperate with any existing ecosystem, requiring its early adopters to rewrite a lot of existing software.

[^2]: A common refrain in PL-related threads on Hacker News is "languages/paradigms are just tools, pick the best one for the job!" The issue is, there's no easy way to mix and match programming languages in the same way one can do for physical tools. Try using Python, Haskell, and C++ in the same program.

[^3]: There are other good options for runtimes that I could choose as a compile target, such as the [JVM](https://en.wikipedia.org/wiki/Java_virtual_machine) or the [CLR](https://en.wikipedia.org/wiki/Common_Language_Runtime) (also see: [their differences](http://stackoverflow.com/questions/453610/javas-virtual-machine-and-clr)). In particular, it's tempting to build for the JVM because this gives you automatic access to the tools and libraries built for the many languages on the JVM. However, systems-level compatibility is an important design goal of ExtLang, and compiling to the JVM means going through the JNI which is too difficult to use in the seamless manner that I envision.
