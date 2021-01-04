---
layout: post
title: The Inanity of Programming Language Benchmarks
abstract: >-
  Programming language performance benchmarks track the maximum performance of a program, when really we also care about how long it takes to get there.
---

Software is rarely static. Over time, requirements change, designs improve, features come and go, and the program must [gradually evolve](http://willcrichton.net/notes/gradual-programming/) as the world changes around it. A fundamental utility of a programming language is to provide tools that improve productivity when evolving software. From a correctness standpoint, this is a major use of static typing---refactors become way less scary when the compiler will let you know if you accidentally typo'd a variable name, or passed a bad parameter to a function, and so on.

To evaluate the utility of a programming language, then, it makes sense to think not in terms of absolutes, but deltas. For scripting languages, this doesn't make a difference since scripts usually start from zero anyway. That's why library support and fast iteration times are important for productivity in scripts. For [systems languages](http://willcrichton.net/notes/systems-programming/), the delta is more often against an existing system than starting from scratch.

However, programming language benchmarks take a static view of the world. They say, _given_ a target application, what is the fastest possible implementation of it in a programming language? Benchmarks are often debated on the axis of complexity: is the example too toy to mean anything, or indicative of real workloads? Instead, I want to contest the utility of benchmarks on the axis of time: **performance benchmarks should measure how long it takes to improve the performance of a program, not just the program's maximum performance.**

Now, that sounds a bit crazy---how can we possibly test that in a controlled way? And why would we have benchmarks that involve _humans_, I thought the point was to get rid of those? Yes, there are a lot of problems, and in general human-centric studies of programming language use still have a long way to go. But I want to share a cool example from a paper in my group at Stanford.

Halide is a programming language for [efficient image and tensor processing](http://halide-lang.org/). It's a neat research project (now a [production language](https://www.blog.google/products/pixel/pixel-visual-core-image-processing-and-machine-learning-pixel-2/)!) that defines a DSL for specifying computations on tensors, and then mapping those computations to hardware through "schedules." An example from their homepage:

```cpp
Func blur_3x3(Func input) {
  Func blur_x, blur_y;
  Var x, y, xi, yi;

  // The algorithm - no storage or order
  blur_x(x, y) = (input(x-1, y) + input(x, y) + input(x+1, y))/3;
  blur_y(x, y) = (blur_x(x, y-1) + blur_x(x, y) + blur_x(x, y+1))/3;

  // The schedule - defines order, locality; implies storage
  blur_y.tile(x, y, xi, yi, 256, 32)
        .vectorize(xi, 8).parallel(y);
  blur_x.compute_at(blur_y, x).vectorize(x, 8);

  return blur_y;
}
```

It turned out that writing schedules is hard, so my colleague Ravi set out to write an auto-scheduler, culminating in [Automatically Scheduling Halide Image Processing Pipelines](https://dl.acm.org/citation.cfm?id=2925952) (SIGGRAPH 2017). To evaluate whether his automatic scheduling algorithm was any good, he ran a study to compare it against the hand-crafted schedules of expert Halide users. Importantly, he measured not just the max speed of their best schedule, but how long it took them to get there. As you can see in the figure, he showed that the two expert programmers took hours to get close to the performance that he could get instantly.

![](/images/assets/pl-benchmarks.png)

The moral of the story is that I think this kind of combined benchmark/user-study could tell us a lot more about the utility of programming languages than just highly-optimized benchmarks. On one hand, I suspect that it probably takes a decent amount of effort to make a program written in a low-level language _that_ much faster than a high-level one with an optimized runtime. On the other hand, when performance _really_ matters, it will probably take less time to maximize the performance of a low-level program with strict control of the hardware than a high-level program at the mercy of a JIT.
