---
layout: post
title: Learning Through Goals in Computer Science
abstract: Starting with my experiences as a young, naïve game developer, I argue the importance of learning programming and its tools through the lens of goals, methods, and metrics.
---

<center>
<img src="http://i.imgur.com/v81zeot.jpg" />
</center>

## Hello, Gaben

At the tender age of 17, like many boys of the time I aspired to be a professional game developer. For the last three years, I had spent innumerable hours playing and scripting a game called [Garry's Mod](http://www.garrysmod.com/), through which I learned the fundamentals of scripting languages, software design, and programming in Lua. But eventually, I hit a wall. I watched as other developers in the community made amazing tools using their 1337 hacker knowledge of C++ (which was a complete enigma to me at the time), and I felt like I just didn't know how to progress. No one at school or amongst my friends was even remotely interested in what I was doing, so I needed to look elsewhere for help.

Naturally, as anyone would do in this situation, I emailed Gabe Newell, the CEO of [Valve](http://valvesoftware.com/). Having played practically all of their games (Half Life, Portal, Team Fortress 2, etc.), I idolized that company. Although I knew next to nothing about real game development, I had heard enough to know that Valve stood at the shining pinnacle of game companies, towering over the scummy studios like EA and Ubisoft. Gabe was the company's most public figure, and his name often invoked in hopeful discussions on the coming of Half-Life 3. So I figured, hey, if I wanted to be a game dev, who better to know than him? I wrote:

> Hey Gabe, I'm Will Crichton, 17, and an up-and-coming scripter. I've seen and heard much of your generosity and willingness to actually interact with the community around Valve, so I ask not for a free mousepad or autograph but for some advice.
>
> Since a wee age, Valve's games heavily influenced my entertainment tastes. I initially got into PC gaming playing CS:S, which later evolved into TF2, and then transitioned into my involvement with Garry's Mod. Over the past few years, I've come to know the Source engine that we all hold so close to our hearts very well, releasing various Lua-based addons for the community.
>
> So, my question is this: can you provide any recommendations for an upcoming developer? How I can get involved in the industry on a professional level, or even how I could land a job  working with Valve? Should I study hard to learn C++ and OpenGL or something, attend a major video game development seminar, major in game design versus computer science?
>
> Thanks,
> Will Crichton

Now, in the inevitable conclusion to this tragic story, he never replied back. Gabe was probably too busy making billions of dollars to talk to a 17-year-old. However, not all hope was lost. My interests shifted into web development and later computer systems once I started at CMU. I even learned C++ along the way! But this email highlights something of fundamental importance in learning about computer science (or learning in general): setting the right goals. As I was learning about game development, I never had a goal like "learn X tool" or "learn Y language." My goals were "make games that other people enjoy" or "get a job at Valve working on the stuff I love." Even if this led me to do outlandish things like emailing Gabe and expecting a response, I was always seeking knowledge with a purpose.

## Goal setting

Personally, my success in programming has been entirely driven by treating the act of learning to program as purely a means to some greater end. An anecdote for concreteness: I tried to pick up programming when I was 13, because I heard programming was cool and I had written some HTML code before. My goal then was to learn Python. I didn't really know what Python was or why it was useful, but someone told me it wasn't too hard so that became my goal: learn Python. And sure enough, by slogging through a few tutorials, I learned some Python. I could write a simple script to parse text files or check if a number was prime. But  eventually, I just dropped the whole project entirely. I wasn't interested enough in the abstract idea of "learning Python" to keep up, so I left it for greener pastures.

When I actually learned programming, it was mere coincidence. At 15, I started playing Garry's Mod, and after playing long enough there were certain aspects of the game I wanted to change&mdash;I wanted to add an item, change a setting, modify an entire map. Here the goal was to play Garry's Mod in a way that was maximally fun. And so I incrementally started to accomplish these goals. I learned the syntax of Lua so as to change some config scripts. I browsed through a few tutorials to pick up the basic semantics, enough to rewrite copy+pasted code into something I could call my own. As my programs started to grow, this forced me to learn about classes, modules, and encapsulation to manage the emergent complexity (although I wouldn't have used any of those words to describe it at the time). And the key part: I loved every second of it. Even when I was down in the trenches debugging some stupid libraries, I saw the light at the end of the tunnel. I wasn't passionate about programming, I was passionate about what programming enabled me to do. When I re-learned some of these concepts formally in undergrad, it made perfect sense because I had seen why it was useful. I didn't accept on face that encapsulation is a good software practice, but I had lived it.

To some extent, you may think, "This is obvious. Of course people learn better by doing instead of by reading textbooks." But the lesson here is deeper than that. Even if you're learning by doing, it still matters what you're doing it for. The single biggest mistake that I've seen time and time again in programmers, whether novices or senior developers, is learning tools _for the sake of learning the tool_. Consider how effective one can learn in the following scenarios:

* I've seen lots of people using React, I'm going to sit down and learn React this weekend.
* I've heard that people who learn Java can get jobs, so I'm going to take a Java class this semester.
* My friend uses a lot of monads in his code, so I'm going to rewrite my code using those.

Now consider these same hypotheticals in a different context:

* I'm trying to build this JS app for my client, but I keep forgetting to update the HTML when I change certain parts of my state. I've heard React can fix that, let me take a look.
* I talked with a recruiter from a trading firm that says they need Java devs with a finance background, so I'm going to take a Java class this semester to complement my finance major.
* My code is getting ugly because I have to keep nesting these matches on option types. I wonder if there's a way around that?

When the tool/language/library that you're learning is a means to an end, you will know not just how to use it but also when and why. A common refrain in programming circles is "use the right tools for the job," and a natural corollary is "learn tools for a job, not for the tools." As a caveat, I recognize there are some who learn tools just for the intrinsic enjoyment of learning them or to broaden their horizons, and that's totally ok. My goal of this post is just to remind you to be cautious when learning, and reflect on why you're doing so.

Internalizing this idea is only the first step towards being a better goal-setter. We've separated out methods (or means) from the goals (or ends) they accomplish. The missing piece of the puzzle is metrics, or answering two questions: 1) given a method, how effectively is it accomplishing my goal, and 2) given a goal, how desirable is that goal? For example, 17 year old me really wanted to become a game developer. This is a simple goal to evaluate in terms of its methods: after using a particular method, can I get a job at a game company? Does it substantially increase my probability of doing so? My method was to write Lua scripts for a game, which provides good hands-on experience and gets me in touch with community members who could later land me a job. By the methods metric, it's a pretty good one. However, the goal itself turned out to be a suboptimal one. I didn't _really_ want to be a game developer, I just liked it as a hobby. Here, the goal metric was: "can this goal bring me routine happiness?" And I realized the answer was no. I couldn't work on games every single day and be happy, so I found other programming pursuits.

So remember: separate out the method from the goal. Avoid learning tools for the sake of learning them. And come up with concrete metrics for evaluating both your methods and your goals.