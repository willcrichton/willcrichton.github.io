---
layout: post
title: Programming Languages as Boy Scouts
abstract: "Programming languages are often evaluated on their efficiency and type safety, but what about friendliness? I explore how human values can be applied to programming language development, specifically looking at the twelve points of the Boy Scout Law: trustworthy, loyal, helpful, friendly, courteous, kind, obedient, cheerful, thrifty, brave, clean, and reverent."
---

<div class="figure">
    <img src="http://i.imgur.com/2zJyDMM.jpg" />
</div>

_Warning: this post contains strong opinions on programming languages. Viewer discretion is advised._

## Introduction

In discussions of programming languages, we tend to focus on mathematical/logical objectives. This language is precise and modular, that language lacks formal semantics, this one strictly adheres to a paradigm, that one maps well to formulae. However, languages and their associated compilers are ultimately not abstract ideas but real tools used by people with more values than just mathematical purity. As an entertaining thought experiment, what if we ascribed the same values we expect from people on to programming languages?

For good values, we can look to the classic organization dedicated to instilling old fashioned American values into young men: the Boy Scouts of America [^1]. Specifically, all Boy Scouts are asked to follow the [Boy Scout Law](http://www.scouting.org/scoutsource/Venturing/About/welcome.aspx), a twelve point listing of values that all members ought uphold: "A Scout is trustworthy, loyal, helpful, friendly, courteous, kind, obedient, cheerful, thrifty, brave, clean, and reverent." In this note, I will explore how each of these values can be applied in the context of programming languages.

## Applying the Law

A brief preface: for brevity, I will lump together programming languages and compilers, referring to them interchangeably. My interpretation of broad human values like "friendliness" is obviously not authoritative, but just intended to spark further discussion on the topic.

1. *Trustworthy.*{:class="hl"} A trustworthy language is one you can believe will protect your secrets and not go behind your back to mess with your program semantics. Such a language should have [ASLR](http://security.stackexchange.com/questions/18556/how-do-aslr-and-dep-work) enabled and should have crypto libraries made by experts so users don't roll their own. You should be able to trust that your language will make reasonable decisions on your behalf. For example, a language should not [coerce your types](https://gist.github.com/MichalZalecki/c964192f830360ce6361) in [unreasonable ways](https://www.destroyallsoftware.com/talks/wat) when you're not looking&mdash;we ought not confused dynamic typing (checking types at runtime) with weak typing (coercing types instead of failing in the presence of type errors). Trust is an essential element of productivity. When a programmer does not trust his language, he is forced to program defensively and must battle both his own bugs as well as the compiler's. A trustworthy language permits the programmer to feel comfortable in his environment and to focus on the task at hand.

2. *Loyal.*{:class="hl"} A language is loyal when its design evolves with the preferences of its users, not its owners or [corporate overlords](https://www.oracle.com/index.html). One should feel comfortable that a language will not turn around and [get you sued](https://en.wikipedia.org/wiki/Oracle_America,_Inc._v._Google,_Inc.) for using its basic features.

3. *Helpful.*{:class="hl"} A language can be "helpful" in a myriad of ways, but one aspect often missing from newer languages is a means to help the programmer understand his errors. It should have a battle-tested debugger. You should not need an [additional piece of software](http://www.bdsoft.com/tools/stlfilt.html) to decipher your compiler's dense and enigmatic build output. For brownie points, your compiler should explain why the programmer has encountered an error, and for the gold medal it should propose a solution.

4. *Friendly.*{:class="hl"} For a language, it makes the most sense to interpret this as "open to newcomers," e.g. Python is simple to start with whereas Standard ML can be a [formidable foe](http://stackoverflow.com/questions/5134193/standard-ml-value-restriction-errors) when first learning functional languages. Having a REPL is a crucial part of a friendly language&mdash;it allows new programmers to play around with syntax and get a quick feel for a new language without having to wade through a hundred compiler errors or a monstrous IDE. As a corollary, dynamic languages often feel more friendly since they can be run in small pieces. They permit the programmer to make small errors which the user doesn't need to concern himself with until necessary.

5. *Courteous.*{:class="hl"} Any language should follow common courtesy: it should clean up after itself (compiler-managed memory) and talk respectfully to its elders (have FFI out to C).

6. *Kind.*{:class="hl"} For me, the distinguishing factor between kindness and other values like helpfulness and courtesy is intention. For a language to be kind, its designers need to be kind in turn. I have never met or heard of a language designer intentionally create a language harmful to its users or its community (although you have to watch people like [Ken Thompson](https://www.ece.cmu.edu/~ganger/712.fall02/papers/p761-thompson.pdf)), but one should always be careful, particularly with closed-source languages. Language designers should have a clear, open dialogue with their community so as to not have their intentions misconstrued or turned against them.

7. *Obedient.*{:class="hl"} Similar to being trustworthy, an obedient language will always do what it's told and no more. The language's libraries should be clearly named and documented. If a function has to fail, it should not do so silently, and the programmer should handle the error (error codes considered harmful). The language should be formally specified, and the compiler should adhere strictly to the specification, loudly telling the programmer where it does not.

8. *Cheerful.*{:class="hl"} This is perhaps the least applicable to programming languages, as there's a fine line between cheer and condescension. After all, nobody wants a compiler like this: ![](http://i.imgur.com/jP2TSVO.jpg){:style="max-height:200px;"}
   However, arguably to be cheerful it means one should at least be more upbeat. Doom and gloom and [vitriol](http://www.infoworld.com/article/2707285/is-linus-torvalds-too-abusive-on-the-linux-kernel-mailing-list.html) are not essential parts of a compiler (or any piece of software).

9. *Thrifty.*{:class="hl"} A language should do a lot with a little, or prefer a smaller number of powerful abstractions to a larger number of weaker ones. More concretely, do not make concepts first-class in the language unless they need to be, otherwise implement them in libraries. For example, Rust implements [iterators as traits](https://doc.rust-lang.org/book/iterators.html) and Clojure implements [gradual typing as a library](https://github.com/clojure/core.typed) (!). Similarly, a thrifty language should only pay for what it needs and prefer [zero-cost abstractions](https://blog.rust-lang.org/2015/05/11/traits.html) where possible. If your quick script takes 0.5 seconds to run but 3 seconds to start the garbage collector, then the language is not thrifty. If your build takes an hour to compile against a library from which you only need one or two functions (*cough* [OpenCV](http://opencv.org/)), then the language is not thrifty.

10. *Brave.*{:class="hl"} As a language designer, do not be afraid to be brave when creating a new language. Although I received [overwhelmingly positive feedback](https://www.reddit.com/r/programming/comments/4u5zpp/rust_the_new_llvm/d5n5kmx) on one of my [recent posts on language design](http://notes.willcrichton.net/rust-the-new-llvm/), there are many naysayers stuck to their paradigms and editors who will be washed away with the flow of time and progress. Make that new type system. Change up the syntax. Just do so while trying not to violate the other principles of good language design.

11. *Clean.*{:class="hl"} Just as people should look and smell clean, so should the syntax of a programming language. Although programmers often like to think in abstractions, the concrete syntax of a language really does matter. In most software development, code is meant to be read and not written, so the more legible your language, the easier it is to maintain. Remember that the language designers often dictate style used by the community. Avoid the majority of naming conventions brought from mathematics (e.g. one letter variable names) unless no one will read your code or it actually improves legibility. [Naming is important!](https://talks.golang.org/2014/names.slide#4)

12. *Reverent.*{:class="hl"} Whether you belong to the [Kingdom of Nouns](http://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html) or the Church of Lambda, be respectful of all faiths. Better yet, take the best of all worlds when designing your language (see: [my previous post](http://notes.willcrichton.net/extensible-compilation/)). Don't force users to pick one paradigm over the other, but rather be flexible enough to accommodate all walks of life.

## Conclusion

The inevitable counterpoint to this post is this: "but Will, I don't care if my language is friendly. I just need it to work. We should care about efficiency, not these abstract notions of human good." And this is a fair point! I wouldn't use a language that was trustworthy but didn't actually do anything. However, we shouldn't let goals like efficiency wash away all else in the discussion. If we promote programming languages that have values like those discussed above, we can create a better world both for existing programmers as well as those seeking to enter the craft. Language designers should remember that their end users are people, not robots [^2], and design accordingly.

Please direct your opinions to my email at [wcrichto@stanford.edu](mailto:wcrichto@stanford.edu) or [discuss this on Hacker News](https://news.ycombinator.com/item?id=12220463).

## References

[^1]: Yes, I know the Boy Scouts are not always [paragons of good values](https://www.aclu.org/blog/speak-freely/dont-clap-just-yet-boy-scouts), and yes, I know the Boy Scouts are [originally from Britain](https://en.wikipedia.org/wiki/Robert_Baden-Powell,_1st_Baron_Baden-Powell).

[^2]: Unless, of course, your language is [LLVM](http://llvm.org/).
