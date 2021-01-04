---
layout: post
title: "The Future of Notebooks: Lessons from JupyterCon"
abstract: "At JupyterCon, I learned three things: reactive notebooks are the future, Jupyter is the new Bash, and data science is a gateway drug."
---

Over the last two days at [JupyterCon](https://conferences.oreilly.com/jupyter/jup-ny), I saw a lot of exciting ideas about the future of Jupyter notebooks. I've already written about my own ideas---[Jupyter for debugging](http://willcrichton.net/notes/programming-in-the-debugger/), [Jupyter for prototyping interactions](http://willcrichton.net/notes/rapid-prototyping-data-science-jupyter/)---but in this note, I want to highlight the major trends I saw in the JupyterCon presentations.

## 1. Reactive notebooks

In the talk ["I don't like notebooks"](https://docs.google.com/presentation/d/1n2RlMdmv1p25Xy5thJUhkKGvjtV-dkAIsUXP-AL4ffI/edit#slide=id.g37ce315c78_0_27), Joel Grus' number one (or at least first) complaint about Jupyter is that "notebooks have tons and tons of hidden state that's easy to screw up and difficult to reason about." Although Jupyter displays cells in a linear order, they can be executed, edited, and re-executed in any order.

![](/images/assets/jupytercon1.png)

Two subsequent talks, ["Supporting reproducibility in Jupyter through dataflow notebooks"](https://conferences.oreilly.com/jupyter/jup-ny/public/schedule/detail/68448) and ["Explorations in reproducible analysis with Nodebook"](https://conferences.oreilly.com/jupyter/jup-ny/public/schedule/detail/68344), explored new systems that address this problem by turning Jupyter into a reactive programming environment. In reactive programming, the runtime tracks dependencies between cells and knows to re-run a cell when its dependencies change.

The two systems, [dfkernel](https://github.com/dataflownb/dfkernel/) and [Nodebook](https://github.com/stitchfix/nodebook), have different mechanisms for tracking updates. Both only track variables in the global scope. Dfkernel conservatively invalidates all global variables used in a particular cell. Nodebook computes the hash of the serialization of every global variable on every cell execution, and compares the hashes to the previous hashes to determine invalidation. Nodebook additionally enforces the constraint that cells can only have data dependencies on prior cells.

While neither seems like a fully optimal solution, it does seem like reactive notebooks are growing in popularity. [Observable's](https://beta.observablehq.com/) Javascript notebooks also adopt this idea.

## 2. Jupyter is the new Bash

While Jupyter notebooks have traditionally been a humans-only entrypoint into a program, researchers and companies alike are increasingly using notebooks for automation. In ["Scheduled notebooks: A means for manageable and traceable code execution"](https://conferences.oreilly.com/jupyter/jup-ny/public/schedule/detail/68348), a Netflix engineer described how they have replaced Bash scripts with Jupyter notebooks for ETL pipelines and cron jobs.

![](/images/assets/jupytercon2.png)

The basic idea is that you write a parameterized Jupyter notebook, essentially a notebook with parameters that get pasted into a new block at the top of the notebook. A system called [Papermill](https://github.com/nteract/papermill) metaprograms a bespoke notebook with provided parameters pasted in, and then executes the notebook with zero user interaction required. For Netflix, the benefit of this approach is to simplify the development and debugging of these scripts. If a particular job breaks, it's trivial to pop open the offending notebook in the normal Jupyter environment, and it has all the data built in that it needs to execute until hitting the error.

A more experimental approach to this is [Script of Scripts](https://conferences.oreilly.com/jupyter/jup-ny/public/schedule/detail/68339), a Jupyter kernel that allows users to bridge between multiple programming languages (e.g. Python, Bash, and R) in a single Jupyter notebook.

![](/images/assets/jupytercon3.png)

The SoS system integrates into traditional cluster schedulers like slurm, enabling their group at University of Texas to write Jupyter notebooks instead of Bash scripts to create bioinformatics pipelines.

## 3. Data science as a gateway drug in education

On the education side of things, Jupyter is quickly gaining adoption in universities around America, particularly for data science courses. Conversely, data science is increasingly becoming students' first exposure to programming and computer science, not just a supplement to a CS curriculum. Most notable is UC Berkeley's [Data 8](http://data8.org/) program, which is projected to reach 50% of the university's undergraduates within the next few years.

The neat part about Data 8 is that it starts with a core class, but branches into many sister classes that incorporate data science principles to investigate domains like medicine, geography, and sports. Their pedagogy is to develop a series of independent modules on topics like hypothesis testing, text processing, etc. such that courses can incorporate modules as necessary for their domain.

I think this is a reasonable reaction to the utterly contrived assignments in many first-year programming courses---it's way more motivating to gain insight in domains I actually care about as opposed to writing a routine to sort a list or search a tree.

Other cool things I saw but haven't covered: [JupyterLab](https://github.com/jupyterlab/jupyterlab) (web-based window manager and IDE), [JupyterHub](https://github.com/jupyterhub/jupyterhub) (multi-user server for Jupyter), [Binder](https://mybinder.org/) (hosted notebooks), [nbinteract](https://www.nbinteract.com/) (convert interactive notebooks into web pages), [Quilt](https://quiltdata.com/) (data versioning), and [Xeus](http://quantstack.net/xeus.html) (C++ kernel in Jupyter).
