---
layout: post
title: Programming in the Debugger
abstract: Jupyter presents a unique programming style where the programmer can change her code while it's running, reducing the cost of mistakes and improving the interactivity of the programming process. I discuss the benefits and limitations of this approach along with the related work.
---

For the last year, I've been creating a lot of programs for data manipulation (specifically [video analysis](https://github.com/scanner-research/scanner/)), and while the heavy lifting is usually in C or Rust, the lighter-weight metadata processing is all Python. As with many in the data science field, I've fallen in love with [Jupyter notebooks](http://jupyter.org/), the code editing and output visualization environment. Jupyter's most-touted feature is the ability to intertwine code, narrative, and visualization. Write code to create a graph and display it inline. Create literate documents with Markdown headers. And this is great! I love the ability to create living documents that change when your data does, like the one below I've been developing.

![](/images/assets/debug-jupyter1.png)

However, after using Jupyter for a while, I've noticed that it has changed my programming process in a way more fundamental than simply inlining visualization of results. Specifically, *Jupyter enables programmers to edit their program while it is running.*{:class="hl"} Here's a quick example. Let's say I have some expensive computation (detect faces in a video) and I want to post-process the results (draw boxes on the faces). Normally, the development process would be, I write a first draft of the program:

```python
## face.py

# Takes 1 minute
video = load_video()

# Takes 20 minutes
all_faces = detect_faces(video)

# Takes 1 minute
for (frame, frame_faces) in zip(video.frames(), all_faces):
    cv2.imwrite('frame{}.jpg', draw_faces(frame, frame_faces))
```

If I run this program (`python face.py`), it would probably run to completion, except... oh no! A bug: I forgot to format the `'frame{}.jpg'` string (note: not a bug a type system would have found, this isn't just a dynamic typing issue). But I had to wait 22 minutes to discover this bug, and now when I fix it, I have to re-run my program and wait another 22 minutes to confirm that it works. Why? Even though the bug was in the post-processing, I have to re-run the core computation, since my program exited upon completion, releasing its contents from memory. I should be able to just change the bug, and verify my change in only a minute. How can we do that?

Consider the same workflow, but running in Jupyter. First, I would define a separate code cell to run each part of the pipeline:

![](/images/assets/debug-jupyter2.png)

I would execute each part of the pipeline:

![](/images/assets/debug-jupyter3.png)

Then, after inspecting the output and noticing the error, change the last code cell, and _only re-run that cell_:

![](/images/assets/debug-jupyter4.png)

This works exactly as intended! We were able to edit our program _while it was running_, and then re-run only the part that needed fixing. In some sense, this is an obvious result---a REPL is designed to do exactly this, allow you to create new code while inside a long-running programming environment. But *the difference between Jupyter and a REPL is that Jupyter is persistent*{:class="hl"}. Code which I write in a REPL disappears along with my data when the REPL exits, but Jupyter notebooks hang around. Jupyter's structure of delimited code cells enables a programming style where each can be treated like an atomic unit, where if it completes, then its effects are persisted in memory for other code cells to process.

More generally, we can view this as a form of programming in the debugger. *Rather than separating code creation and code execution as different phases of the programming cycle, they become intertwined.*{:class="hl"} Jupyter performs the many functions of a debugger---inspecting the values of variables, setting breakpoints (ends of code cells), providing rich visualization of program intermediates (e.g. graphs)---except the programmer can react to program's execution by changing the code while it runs.

However, this style of programming with Jupyter has its limits. For example, *Jupyter penalizes abstraction by removing this interactive debuggability*{:class="hl"}. In the face detection example above, if we made our code generic over the input video:

```python
def detect_and_draw_faces(video)
    all_faces = detect_faces(video)
    for (frame, frame_faces) in zip(video.frames(), all_faces):
        cv2.imwrite('frame{}.jpg', draw_faces(frame, frame_faces))

video = load_video()
detect_and_draw_faces(video)
```

Because a single function cannot be split up over multiple code cells, we cannot break the execution of the function in the middle, change its code, and continue to run. Interactive editing and debugging is limited to top-level code. This is actually a really common problem for me, since I'll write straight-line code for a single instance of the pipeline (on a particular video, as originally), but then want to run it over many videos in batch. However, inevitably I missed some edge case not exposed by the example video, but I can no longer debug the issue in the same way.

Additionally, *this model of debugging/editing only works for code blocks that are pure*{:class="hl"}, i.e. don't rely on global state outside the block. For example, if I have a program like:

```python
x = 0

### new code block ###

x += 1
print('{}'.format(y))
```

Then if I fix the variable name error (`format(x)` instead of `y`) and re-run the code block, the value of `x` has changed, and my program output depends on the number of times I debugged the function. Not good! Essentially we need some kind of [reverse debugging](http://jakob.engbloms.se/archives/1554) (also time-traveling debugging), where we can rewind the state of the program back to a reasonable point before the error occured. This [has](https://morepypy.blogspot.com/2016/07/reverse-debugging-for-python.html) [been](https://everythingsysadmin.com/2014/04/time-travel-pdb.html) [done](http://www.imperial.ac.uk/media/imperial-college/faculty-of-engineering/computing/public/NiklasSteidl.pdf) for Python, but to my knowledge has never been integrated into Jupyter in a sensible way.

This idea has existed in many other forms, particularly in the web world where hot-swapping code is common. An ideal model is embodied in the [Elm Reactor](http://elm-lang.org/blog/time-travel-made-easy) time-traveling debugger for the [Elm](http://elm-lang.org/) programming language. If your language is pure and functionally reactive, then you almost get this mode of debugging for free (plus a little tooling). The interesting question, then, is if your language is impure, or if your language [gradually ensured](http://willcrichton.net/notes/gradual-programming/) purity, how far can we go with these edit/debug interactions? Could we integrate reverse debugging into Jupyter for Python? Could I edit a function in the middle of its execution? In what scenarios would such a programming style be most useful?

As always, let me know what you think. Either drop me a line at [wcrichto@cs.stanford.edu](mailto:wcrichto@cs.stanford.edu) or leave a comment on the [Hacker News thread](https://news.ycombinator.com/item?id=16897729).
