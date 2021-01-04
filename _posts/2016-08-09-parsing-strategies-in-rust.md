---
layout: post
title: Parsing Strategies in Rust
abstract: "I briefly analyze two competing parsing frameworks in Rust: nom, a parser combinator, and LALRPOP, an LR(1) parser generator. I show that LALRPOP can more succinctly and efficiently express grammars for text-based formats."
---

_This is a quick note intended as a more longform response to the recent post ["Introduction to nom: a parsing framework written in Rust"](https://www.reddit.com/r/rust/comments/4wqi2j/introduction_to_nom_a_parsing_framework_written/)._

I've seen a lot of smart people ruminate on the virtues of parser combinators, but every time I look at one, the syntax just seems obtuse and archaic. This may be one of those times where I just don't like it because I'm not familiar with its syntax (see: Haskell), but I'm not convinced that it's a more suitable tool for most parsing jobs than parser generators like [LALRPOP](https://github.com/nikomatsakis/lalrpop/). In this note, I will compare nom and LALRPOP to understand when you want to use one or the other.

When I asked in the /r/rust thread about the differences between the two, bjzaba responded:
> nom seems to be more geared towards parsing binary formats. LALRPOP is more suited to programming languages, with the possibility of using custom lexers. They also let you specify languages in different ways - nom uses parser combinators, where as LALRPOP allows you to define LR(1) grammars. Both have their pros and cons. You can read more on Niko's original blog post about it: http://smallcultfollowing.com/babysteps/blog/2015/09/14/lalrpop/

And cmrx64 also pointed out that binary formats are not context free, with the presumption that parser combinators are better for context-sensitive strategies. However, the list of [parsers using nom](https://github.com/Geal/nom/issues/14) also includes a number of text file formats, which don't have the same strict read-in-byte-at-a-time requirements. So I asked two questions: which is better for text file (or human-readable) formats, and which is better for binary formats?

## Text file formats

To evaluate the former question, I took the linked [CSV parser](https://github.com/GuillaumeGomez/csv-parser) and wrote my own quick CSV parser in LALRPOP. The nom parser was 190 lines of code, too long to show in this note. The LALRPOP was 17 lines of code and ran nearly twice as fast in my simple benchmark. Here's my grammar:
```raw
grammar;

pub Csv: Vec<Vec<String>> = { Row+ };

Row: Vec<String> = {
    <r:Row> "," <i:Item> => {
        let mut r = r;
        r.push(i);
        r
    },
    Item => { vec![<>] }
};

Item: String = {
    r#"".*""# => String::from(<>),
    r#"[^,"]+"# => String::from(<>)
};
```

I ran both of these parsers on a 2MB CSV file, and the nom parser ran in 73ms whereas the LALRPOP parser ran in only 41ms. Given that it also took an order of magnitude less code, I would say LALRPOP wins this round. This isn't to say definitively LALRPOP is always a better tool for parsing text file formats, but rather just a counterpoint to show that it can be more efficient and succinct instead of using parser generators.

## Binary formats

The biggest mark against LALRPOP for binary formats is that it by default assumes that your terminals are strings, not numbers. By comparison, nom has a lot of utilities for easily munging bytes (see its [gif parser](https://github.com/Geal/gif.rs/blob/master/src/parser.rs)). One could theoretically parse raw bytes in LALRPOP by defining a custom tokenization of the input file into a format where each byte is its own token, but doing that transformation would take up a lot of unnecessary time and space.

However, it's not clear to me why a parser combinator works better for context-sensitive parsing. Although LALRPOP can only generate code for context-free grammars, you could manually apply rules from the grammar in a context-sensitive fashion (basically the same way you could in nom), so I'm not sure if this necessarily falls on the side of nom. I would love to hear from others' experiences as to whether a tool like LALRPOP could be useful for context-sensitive parsing.
