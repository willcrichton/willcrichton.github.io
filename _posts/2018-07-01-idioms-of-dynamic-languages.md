---
layout: post
title: Idioms of Dynamic Languages
abstract: Programmers think dynamic languages like Python are easier to use than static ones, but why? I look at uniquely dynamic programming idioms and their static alternatives, identifying a few broad trends that impact language usability.
---

Here's a fact: a lot of people use dynamic languages[^1]. The web world is the most prominent use case, having both frontend and backend often written in dynamic languages (Python, PHP, Ruby, Javascript), but these languages are also widespread in other fields like data science (Python, R, Matlab, Julia), game scripting (Lua), hardware (Perl), and more. Dynamic languages are increasingly used for introductory computer science education---Stanford's new [CS 106J](https://web.stanford.edu/class/cs106j/handouts/01-GeneralInformation.pdf) uses Javascript, Berkeley's [CS 61A](https://cs61a.org/) and CMU's [15-112](https://www.cs.cmu.edu/~112/) use Python, and Brown's [CSCI 0190](http://cs.brown.edu/courses/csci0190/2018/) uses Racket. Even the College Board is moving its new [AP CS Principles](https://apcentral.collegeboard.org/courses/ap-computer-science-principles/course) away from Java and towards dynamic languages.

Since dynamic languages are so popular, we ought to better understand what drives their adoption. This question is part of the classic static vs. dynamic typing debate, which has been discussed at length with [evidence](https://danluu.com/empirical-pl/) and [anecdotes](http://wiki.c2.com/?BenefitsOfDynamicTyping) (and arguably, no strong conclusion has been reached). While many factors influence the selection of a language for any given purpose, I think it's mostly uncontroversial to say: programmers like dynamic languages because they feel easy to learn and use in contrast to more safe, static languages (e.g. Java, C#, C++, OCaml, Rust, ...), particularly for small programs and prototypes.

If this is the case, then what makes dynamic languages _feel_ easy? Can we take what we learn in answering this question and improve the ergonomics of our static languages? For example, in 2018, I don't think there's as strong an argument for "you don't have to write out the types," since modern type inference eliminates most of the keystrokes required (even though many major languages still lack such facilities). Plus, saving a few keystrokes does not seem like a critical bottleneck in the programming process.

Instead, my running hypothesis is that *a major source of friction in statically typed languages is an impedance mismatch between a programmer's mental model of her program and the mental model imposed by the programming language*{:class="hl"}. Put another way, a programming language's type system encodes certain opinions about how a program _must_ be structured, and when those opinions differ from the programmer's, conflict ensues. Let's walk through a few examples to demonstrate this idea.

## 1. Dynamic heterogeneous data structures

In dynamic languages, it's common to have data structures like dictionaries that mix and match values of different types. This is particularly common when dealing with data types like JSON, or any data where it's hard to predict ahead of time what the data format will be.

```python
# Python
my_dict = {}
my_dict[100] = 0
my_dict[200] = 'Hello world!'
# No problem!
```

We can use two axes to describe the kinds of behavior occuring here and how it relates to static languages. The first is static vs. dynamic, or whether the size/shape of the data structure changes at runtime. For example, if we have:

```rust
// Rust
struct Person {
  name: String,
  age: i32
}

let will = Person { name: "Will".to_string(), age: 24 };
will.job = "Student"; // Not valid!
```

In a static language like Rust, a predefined struct is a static data structure, as we cannot add or remove keys at runtime. By contrast:

```rust
// Rust
let job_map: HashMap<String, String> = HashMap::new();
job_map.insert(will.name, "Student");
```

A map (or a set, vector, etc.) is a dynamic data structure, as you can add/remove key/value pairs at runtime. The other axis is homogeneous vs. heterogeneous, or whether a data structure can contain multiple values of different types. A struct can be heterogeneous, e.g. the `Person` above contains a string and a number, while the `HashMap` is homogeneous:

```rust
// Rust
let map = HashMap::new();
map.insert(100, 0);
map.insert(200, "Hello world"); // Error! Map value must be i32, not String
```

Depending on the language, there are multiple ways to implement the desired heterogeneity.

1. **[Subtype polymorphism](https://www.javaworld.com/article/2075223/core-java/reveal-the-magic-behind-subtype-polymorphism.html):** In a class-based language like Java, one can cast all the objects a superclass like `Object`:
   ```java
   // Java
   Map<Integer, Object> map = new HashMap<Integer, Object>();
   map.put(100, (Object) 0);
   map.put(200, (Object) 200);
   System.out.println((String) map.get(200));
   ```
**Pros**: little syntactic overhead, no restriction on sets of types that can be placed in the container.<br />
**Cons**: requires explicit typecasts in and out of the container, runtime errors possible.

2. **[Any types](https://doc.rust-lang.org/std/any/):** Static languages that support dynamic typing at runtime can use an Any type (or better yet, [Obj.magic](https://caml.inria.fr/pub/docs/manual-ocaml/libref/Obj.html)):
   ```rust
   // Rust
   let mut map: HashMap<i32, Box<Any>> = HashMap::new();
   map.insert(100, Box::new(0));
   map.insert(200, Box::new("Hello world".to_string()));

   match map[&200].downcast_ref::<String>() {
     Some(ref s) => println!("{}", s),
     None => panic!("Type error")
   };
   ```
Fairly similar to the `Object` approach in class-based languages, roughly same set of tradeoffs (although here, Rust uses an explicit error handling approach for cast errors instead of exceptions as in Java).

3. **[Trait polymorphism](https://doc.rust-lang.org/book/second-edition/ch17-02-trait-objects.html):** In a trait/typeclass-based language like Rust or Haskell, one can upcast to a trait:
   ```rust
   // Rust
   trait ToString { fn to_string(&self) -> String; }
   let map: HashMap<i32, Box<ToString>> = HashMap::new();
   map.insert(100, Box::new(0));
   map.insert(200, Box::new("Hello world"));
   println!("{}", map[&200].to_string());
   ```
**Pros**: type-safe, no runtime errors, little syntactic overhead.<br />
**Cons**: requires identifying the subset of functionality you need common to each type and aliasing to that trait (this is also true in subtyping systems that don't permit runtime downcasts).<br />
> Note: this idea is related to the idea of "existential types" in programming language theory.

4. **Sum types**: Sum types (or unions, enums, variants, etc.) allow the definition of types that could be one of many things. Sum types take many forms, with three primary tradeoffs:
   1. **Named vs. anonymous**: sum types in OCaml, Haskell, and Rust all have named branches. For example:
      ```rust
      // Rust
      enum MyValue {
        Int(i32),
        String(String)
      }

      let mut map: HashMap<i32, MyValue> = HashMap::new();
      map.insert(100, MyValue::Int(0));
      map.insert(200, MyValue::String("Hello world".into()));

      match map[&200] {
        MyValue::Int(ref n) => println!("{}", n),
        MyValue::String(ref s) => println!("{}", s)
      };
      ```
      Here, `MyValue` is the sum type name, and `Int`/`String` are the branch names. By contrast, languages like [Ceylon](https://ceylon-lang.org/documentation/tour/types/) have support for anonymous sum types:
      ```ceylon
      // Ceylon
      HashMap<Integer, Integer|String> map =
          HashMap { 100->0, 200->"Hello world" }
      ```
      Most languages that have fully-featured sum types tend to only have named sums, one benefit being that it allows branches with the same inner type to have different names, e.g. `Foo(i32), Bar(i32)`.
   2. **Declared vs. inferred**: some languages with sum types like Rust require an explicit declaration of the enum ahead of time, as in the previous example. Other languages, like Ceylon as well as OCaml's [polymorphic variants](https://stackoverflow.com/questions/1428743/ocaml-list-that-could-contain-two-types) allow the sum types to be inferred by the compiler.
      ```ocaml
      (* OCaml *)
      let l = [`Int 0, `String "Hello world"] ;;
      (* l inferred to have type [ `Int of int | `String of string ] *)
      ```
   3. **Matched vs. casted**: some languages like OCaml and Haskell allow potentially incorrect casts from a sum type to one of its branches:
      ```ocaml
      (* OCaml *)
      type foo = X of int | Y of string ;;
      let x = X 10 ;;
      let X y = x ;; (* This raises an exception if incorrect *)
      print_int y ;;
      ```
      By contrast, Rust require exhaustive matching:
      ```rust
      // Rust
      let MyValue::String(ref s) = map[&200]; // Invalid!
      ```

   There's a surprisingly large design space here, and the pros/cons relative to dynamic languages vary based on the particular choices a language makes. Casted, inferred, and anonymous sums arguably come quite close to equivalent dynamic code, although such a type system appears uncommon in practice.

Among these many cases, implementing a heterogeneous data structures in a static language generally gives rise to two kinds of conceptual impedance mismatch:
1. The programmer either cannot easily encode the desired heterogeneity in a particular static language, e.g. OCaml does not provide a simple solution for an `Any` type.
2. The programmer must decide too early (i.e. while initially describing the data structure) what kind of data types are allowed, e.g. in the enum case, or what functionality of the data types is allowed, e.g. in the traits case.

By contrast, using a dynamic language like Python, you do not have to think about whether your data structures are polymorphic or not--you simply _get it for free_, no opinions necessary.

## 2. Ad-hoc interfaces

When writing polymorphic functions, i.e. functions that could apply to many different types, it's common to specify a function over types that provide a specific set of functionality. For example:

```python
# Python
def print_list(l):
    formatted_elements = [str(x) for x in l]
    print('[{}]'.format(','.join(formatted_elements)))
```

This function is implicitly defined over all lists (or technically iterables) that contain elements which can be converted to a string, using `str`. (This idea is also called "duck typing", although I never found the term very informative.)

In a static language, all variables (including function arguments) must have known types at compile time. But what should the type of `l` be in the above example? How we write down that type depends on the facilities of the type system.

1. **Subtype polymorphism:** if a base class contains all the functionality necessary for a generic function, then the concrete input type can be the base class. In Java, the `Object` class has a `toString` method, so this could be defined as:
   ```java
   // Java
   static void printList(ArrayList<Object> l) {
     // l[0].toString() is valid
     ..
   }

   ArrayList<Object> l = new ArrayList<Object>();
   l.add((Object) 0);
   l.add((Object) "Hello world");
   printList(l);
   ```
**Pros:** low syntactic overhead, flexible (no fixed set of types at implementation time). <br />
**Cons:** any object must be an instance of a class which derives from the required base class, which gets awkward/unwieldy for ad-hoc combinations of different methods. Interface must be explicitly specified in a class definition/interface.

2. **Trait polymorphism:** this is basically the prime use case for traits, e.g. in Rust:
   ```rust
   // Rust
   trait ToString { fn to_string(&self) -> String; }

   fn print_list(l: Vec<impl ToString>) {
     // l[0].to_string() is valid
     ..
   }

   let l1: Vec<String> = vec!["Hello world"].to_string();
   print_list(l1);

   // impl ToString approach doesn't allow mixed-type containers
   let l2: Vec<Box<ToString>> = vec![Box::new("hi"), Box::new(0)];
   print_list(l2); // Error! Box<ToString> isn't impl ToString (confusingly?)

   fn print_list(l: Vec<Box<ToString>>) {
     // l[0].to_string() is valid
     ..
   }

   print_list(l2); // Now it works
   ```
**Pros:** zero syntactic/performance overhead in `impl Trait` case, logic is type-checked when implemented, not when used (e.g. a bug in `print_list` will be caught when the function is written).<br />
**Cons:** different syntaxes/APIs for homogeneous vs. heterogeneous data structures (i.e. static vs. dynamic dispatch). Interface must be explicitly specified in a trait.

3. **[Compile-time metaprogramming](http://www.cplusplus.com/doc/oldtutorial/templates/):** if a language supports staging like C++ with templates, then one can write:
   ```cpp
   // C++
   template<typename T>
   void print_list(std::vector<T> l) {
     // l[0].to_string() is POSSIBLY valid
   }

   class Foo {
   public:
     std::string to_string() { .. }
   }

   std::vector<Foo> l;
   l.push_back(Foo());
   print_list<Foo>(l);

   class Bar {
   public:
     // No to_string() method
   }

   std::vector<Bar> l;
   l.push_back(Bar());
   print_list<Bar>(l); // Error! to_string() method is not defined on Bar
   ```
**Pros:** no explicit interface must be defined (entirely ad-hoc).<br />
**Cons:** type-checking occurs when the API is used, not when it is defined (and compiler errors are forced to expose API implementation details). Does not allow polymorphic containers (`T` must be a concrete type like `Foo`, not like `impl ToString`). Also, template errors suck.

For static languages that support traits/typeclasses, the only overhead versus ad-hoc interfaces in dynamic languages is the verbosity of writing down the explicit interface and the type system complexity of parameterizing types by the interface. Not perfect, but not too bad. The bigger issue is that this mental model of the world naturally views the world compositionally, i.e. where any given type's methods are built from many smaller traits, as opposed to hierarchically, where a type's methods are derived from a class inheritance tree. If a programmer wants to write an ad-hoc interface in an object-oriented language, she must change her natural mental model of the program into the hierarchy required by the language, a clear conceptual impedance mismatch.


## 3. Reflection

A fairly unique feature of dynamic languages is that the entire language stack is usually available at runtime, e.g. it's trivially easy to parse/translate/execute new code at runtime as well as to inspect/analyze language constructs like class members (the latter process is generally called "reflection"). This contrasts with compiled languages like C which produce standalone binaries that run outside the context of the compiler's runtime.

In the Python ecosystem, for example, reflection is used to [serialize arbitrary objects](https://docs.python.org/3/library/pickle.html), [generate SQL tables from class definitions](https://docs.djangoproject.com/en/2.0/topics/db/models/), and [create comparison and equality checks](https://docs.python.org/3/library/dataclasses.html). Importantly, all of these tasks are accomplished by simple, intra-linguistic mechanisms, i.e. all you need is a Python interpreter to use these libraries. No additional parsers, AST libraries, etc. need to be downloaded or run external to the language runtime. For example, to print out all the methods of a class:

```python
# Python
class Foo:
    def bar(self): pass

print(inspect.getmembers(Foo(), predicate=inspect.ismethod))
# [('bar', <bound method Foo.bar of <__main__.Foo object at 0x10320f0b8>>)]
```

In static languages with limited or zero reflection, these tasks are instead performed by metaprogramming mechanisms. In Java for example, tools like IDEs are frequently used to code generate class definitions, getter/setter methods, and more. Other static languages use programmable macro systems to define a code generation pre-compilation step, e.g. the C preprocessor for C/C++, `macro_rules`/procedural macros for Rust, PPX for OCaml, and Template Haskell for Haskell. For example, to create a default method for turning an object into a string for debugging in Rust:

```rust
// Rust
#[derive(Debug)]
struct Foo {
  x: i32,
  y: String
}

// ^ this compiles into something like:
impl Debug for Foo {
  fn debug(&self) -> String {
    format!("({}, {})", self.x, self.y)
  }
}
```

You can implement a custom derive pass yourself, although the API is pretty rough ([see an example](https://github.com/dtolnay/syn/blob/master/examples/heapsize/heapsize_derive/src/lib.rs)) compared to Python's, and it's not accessible at runtime, only compile time. In particular, macro systems are of wildly varying quality and flexibility, with some static languages lacking any macro system or reflection entirely.

Here, the core impedance mismatch is that metaprogramming is fundamentally at odds with static typing. It's simply difficult to express reflective language constructs in a verifiably safe manner. Type-safe metaprogramming has been the subject of decades of research in the academic programming languages community (e.g. [MetaML](https://www.sciencedirect.com/science/article/pii/S0304397500000530), [Scala LMS](https://scala-lms.github.io/)), and no clear system has emerged as the "right way" to do it. Compiled languages (and subsequently most static languages) seem empirically averse to exposing any compiler internals like tokens, syntax trees, types, etc. to the language runtime, although the tide is slowly changing in that direction.

## 4. Exceptions

Exceptions are a mechanism that allow non-local control flow, jumping from an raised exception to the closest catch on the call stack. Exceptions are not unique to dynamic languages---bog-standard languages like Java, niche functional languages like OCaml, and even systems languages like C++ support exceptions.[^2]

Exceptions are still worth talking about because not all static languages have them, and it's important to understand how critical they are to the dynamic programming style. Generally speaking, much of the productivity gain of dynamic languages could boil down to "not forcing the programmer to think about an issue until it arises," or in the Python community, "it's better to ask forgiveness than permission." For example, in the following snippet:

```python
# Python
with open('test.txt') as f:
    s = f.read()
    print(10 / int(s))
```

If I execute this program, it could fail with:
1. A `FileNotFoundError` if `test.txt` doesn't exist,
2. A `ValueError` if the contents of `test.txt` can't be interpreted as an integer, or
3. A `ZeroDivisionError` if `int(s) == 0`.

However, assuming I set everything up correctly, I don't have to think about any of those edge cases until they occur. By contrast, a language like Rust chooses to encode many of these cases in the type system such that the programmer is forced to handle possible errors:

```rust
// Rust
let mut f = File::open("test.txt").expect("File not found");
let mut contents = String::new();
f.read_to_string(&mut contents).expect("Failed to read");
let n = contents.parse::<i32>().expect("Failed to become int");
println!("{}", n / 10)
```

All of those `expect` calls are saying "if this operation failed, then abort the program, otherwise get the function's output." (See [The Book](https://doc.rust-lang.org/book/second-edition/ch09-02-recoverable-errors-with-result.html) for more on error handling in Rust, and how this could be made more concise.) This sort of pattern is common in languages like Haskell (but with monads) and OCaml (although the exceptions vs. monads debate is more fiery there).

There's also the "error code" approach that C, Go, and sometimes Java adopt where calling a function returns both a possible pointer to the value and an error object, e.g.:

```go
// Go
func CopyFile(dstName, srcName string) (written int64, err error) {
    src, err := os.Open(srcName)
    if err != nil {
        return
    }

    dst, err := os.Create(dstName)
    if err != nil {
        return
    }

    written, err = io.Copy(dst, src)
    dst.Close()
    src.Close()
    return
}
```

While you could theoretically ignore the errors and program as if they didn't exist, this style of programming seems strictly worse compared to either exceptions or result types, since both approaches both require that an error be handled, not letting a user attempt to perform operations on an invalid handle to an object.

Exceptions are also a good example of how the dynamic feel of a language comes from not just making it _possible_ to express certain idioms in your type system, but _pervasively adopting_ these idioms across the standard libraries. Even if exceptions were added to Rust today, there's no chance that the standard library would be changed from result types to exceptions in cases of failure, which means that a new programmer in Rust would never feel the benefits of exceptions barring how they use them in their own code. When your type system permits different sets of opinions and the canonical APIs all have different opinions than you, there's simply no recourse.

## 5. Partial programs

During the process of developing a program, it's often in an incomplete or inconsistent state. A programmer naturally develops a program one piece at a time, leaving the other pieces as stubs or comments. For example, if I wrote a program to divide each element of a list by a number, that might start like:

```python
# Python
def divide_list(l, n):
    if n == 0:
        # do something?
        pass
    else:
        return [x / n for x in l]

print(divide_list([1, 2, 3], 2))
```

This works fine. I want to remember to hit the `n = 0` edge case later, but don't want to implement the error handling logic quite yet.  However, if I wrote the same program in a static language like Rust:

```rust
// Rust
fn divide_list(l: Vec<i32>, n: i32) -> Vec<i32> {
  if n == 0 {
    // do something?
  } else {
    return l.into_iter().map(|x| x / n).collect::<Vec<_>>();
  }
}
```

Then this fails with a compile error:
```
error[E0308]: mismatched types
 --> test.rs:2:13
  |
2 |     if n == 0 {
  |  _____________^
3 | |     // do something?
4 | |   } else {
  | |___^ expected struct `std::vec::Vec`, found ()
  |
  = note: expected type `std::vec::Vec<i32>`
             found type `()`
```

The issue here is that the compiler requires that all values have a provably consistent type at compile time. Here, if the first if branch doesn't also return a vector, then the type checker cannot say the function reliably returns a vector, a fair statement. However, this forces the programmer to add extra code to satisfy the type checker while iterating. In Rust, the simplest approach is to use the [`!` type](https://doc.rust-lang.org/book/second-edition/ch19-04-advanced-types.html#the--never-type-that-never-returns):

```rust
// Rust
fn divide_list(l: Vec<i32>, n: i32) -> Vec<i32> {
  if n == 0 {
    // do something?
    return panic!("Divide by zero");
  } else {
    return l.into_iter().map(|x| x / n).collect::<Vec<_>>();
  }
}
```

This is similar to how exceptions are type-checked in a language like OCaml, i.e. the language has a type which is considered a valid replacement (or subtype) for any other type.

More broadly, it is generally true that any static analysis tool, like a type checker (as in all static languages) or a borrow checker (as in Rust), requires a complete knowledge of types/lifetimes/etc. after analysis of a program, either via explicit annotation or inference[^3]. In Rust, if I write:

```rust
// Rust
fn main() {
  let v: Vec<_> = Vec::new();
}
```

Then this fails with the error:

```
error[E0282]: type annotations needed
 --> test.rs:2:19
  |
2 |   let v: Vec<_> = Vec::new();
  |       -           ^^^^^^^^^^ cannot infer type for `T`
  |       |
  |       consider giving `v` a type
  |
```

Most type checkers would not, for example, decide `T = Any` and then insert runtime type checks any time a value from `v` was used. This is again an example of requiring a programmer to make decisions about the types of variables before it is necessary due to restrictions of the type system. Partial programs are not easily amenable to static analysis.

## Discussion

Across these examples, the conceptual impedance mismatch generally appears in two ways:

1. *The programmer cannot naturally express a program construct that can be statically verified by the type system.*{:class="hl"} Heterogenous data structures in OCaml, ad-hoc interfaces in Java, reflection in C, exceptions in Rust, all of these are examples of programming constructs a programmer might naturally seek to best express a domain concept, but would lack in the target language.

2. *The programmer has a fuzzy idea about the structure of a program, but is forced to reify program details unrelated to her current focus.*{:class="hl"} Mandatory typing partial programs, required handling of edge cases instead of exceptions, both of these cases are examples of a program's static guarantees requiring more information from a programmer during the development phase than she wants to give at a particular point in time.

I'm not trying to pass a value judgment on whether these are trends are intrinsically good or bad. Forcing programmers to not only think about edge cases but clearly expose them in the type system is part of the Rust experience, dictated by a culture of safety (since, after all, [Rust is mostly safety](https://graydon2.dreamwidth.org/247406.html)). Dynamic languages are notoriously error-prone, difficult to refactor, etc. along with the the host of other pro-static-typing arguments.

However, I think we need a more nuanced understanding of both how programmers think about programming as well as how dynamic languages mesh with that process. This can lead us to a more sensible discussion about the tradeoffs between static and dynamic languages, and it can help us design better metrics for evaluating the human impact of language features and tooling.

But, of course, this is all just from my personal experience. Do you find dynamic languages more productive, and if so, why? Please send me mail at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu) or leave a comment on [Hacker News](https://news.ycombinator.com/item?id=17439635).

[^1]: I'm using "dynamic language" roughly as short-hand for "dynamically-typed language," but also to convey a more general sentiment about the feel of a language rather than simply a feature of the type system. A "static language" will be any language that's not a dynamic language.

[^2]: Although I'm to understand that exceptions in C++ are generally frowned upon?

[^3]: There's some cool research out there about languages, runtimes, and IDEs that support typed holes, e.g. see [Hazel](http://hazel.org/) and [Idris](http://docs.idris-lang.org/en/latest/tutorial/typesfuns.html#holes).
