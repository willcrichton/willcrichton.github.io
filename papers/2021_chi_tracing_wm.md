---
layout: paper
title: "The Role of Working Memory in Program Tracing"
authors:
    - "Will Crichton, Stanford University"
    - "Maneesh Agrawala, Stanford University"
    - "Pat Hanrahan, Stanford University"
venue: |
    ACM Conference on Human Factors in Computing Systems, May 2021
    Proceedings of SIGCHI 2021
---

![]({{ "/papers/assets/2021_chi_banner.svg" | relative_url }}){: class="banner" height="400px"}

## Abstract

Program tracing, or mentally simulating a program on concrete inputs, is an important part of general program comprehension. Programs involve many kinds of virtual state that must be held in memory, such as variable/value pairs and a call stack. In this work, we examine the influence of short-term working memory (WM) on a person's ability to remember program state during tracing. We first confirm that previous findings in cognitive psychology transfer to the programming domain: people can keep about 7 variable/value pairs in WM, and people will accidentally swap associations between variables due to WM load. We use a restricted focus viewing interface to further analyze the strategies people use to trace through programs, and the relationship of tracing strategy to WM. Given a straight-line program, we find half of our participants traced a program from the top-down line-by-line (linearly), and the other half start at the bottom and trace upward based on data dependencies (on-demand). Participants with an on-demand strategy made more WM errors while tracing straight-line code than with a linear strategy, but the two strategies contained an equal number of WM errors when tracing code with functions. We conclude with the implications of these findings for the design of programming tools: first, programs should be analyzed to identify and refactor human-memory-intensive sections of code. Second, programming environments should interactively visualize variable metadata to reduce WM load in accordance with a person's tracing strategy. Third, tools for program comprehension should enable externalizing program state while tracing.

## Paper

[Download Paper]() (XX MB)