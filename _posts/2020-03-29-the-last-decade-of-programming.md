---
layout: post
title: The Last Decade of Programming, According to Google Trends
abstract: >-
    I explore programming trends through Google searches, like jQuery vs. React, Hadoop vs. Spark, RPi vs. Arduino, and more.
---

Has programming really changed in the last decade? One way to answer this is by looking at Google searches. Changes in search queries is hopefully a meaningful proxy for the underlying popularity (but not necessarily influence!) of a tool. For example, using Google's [Trends](https://trends.google.com/trends/?geo=US) tool, we can look at how frontend web development has changed by comparing frameworks ([query](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=jquery,react,backbone,angular,vue)):

![](/images/assets/trends-1.png)

A few notes on how to interpret this graph.
* The x-axis is time, going from 2004 to present (unless where specified).
* The y-axis is "interest". According to Google, this "represents search interest relative to the highest point on the chart for the given region and time. A value of 100 is the peak popularity for the term. A value of 50 means that the term is half as popular. A score of 0 means there was not enough data for this term."
* Each color is a different keyword. For example, jQuery is blue in the graph above.
* The searches are restricted to whatever Google classifies as the "Programming" category.

The graph above indicates that jQuery was hugely dominant in frontend web development for a long time, but has slowly died off with the rise of other frameworks. We can see the relative proportions today by zooming in to the last two years:

![](/images/assets/trends-2.png)

Neat, right? Try doing some searches yourself! Here's the first example again if you want to play around using my configuration: [https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=jquery,react,backbone,angular,vue](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=jquery,react,backbone,angular,vue)

Let's dive into some other application areas.

## Web servers

[Ruby on Rails, Django, Flask, and Node.js:](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0505cl,%2Fm%2F06y_qx,%2Fm%2F0dgs72v,%2Fm%2F0bbxf89)

![](/images/assets/trends-3.png)

Rails is dominant for a while. Django and Flask still far from the mainstream, apparently, although "Node.js" is a little general as a query.

## High-performance web

[WebGL, WebAssembly, Emscripten, node.js](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0505cl,%2Fm%2F06y_qx,%2Fm%2F0dgs72v,%2Fm%2F0bbxf89):

![](/images/assets/trends-4.png)

A uniquely last-decade trend. WebGL, Emscripten, and Asm.js kicked off the high-performance web trend, and WebAssembly has started to pick up steam.

## Mobile apps

[Android, iOS, and iPad](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F02wxtgw,%2Fm%2F03wbl14,%2Fg%2F11ggsjzp49):

![](/images/assets/trends-5.png)

Android and iOS are still neck-and-neck, although popularity has dimmed over the last decade.

## Game engines

[Adobe Flash, Unity, and Unreal Engine](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F058b6,%2Fm%2F0dmyvh,%2Fm%2F025wnp):

![](/images/assets/trends-6.png)

Flash has been slain at the hands of Steve Jobs. He published his famous ["Thoughts on Flash"](https://en.wikipedia.org/wiki/Thoughts_on_Flash) letter almost exactly a decade ago. Unity and Unreal have filled the void (or maybe Roblox and Minecraft have?).

## Data science

[Jupyter, numpy, and pandas](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fg%2F11c1q0p940,%2Fm%2F021plb,%2Fm%2F0rphppq)

![](/images/assets/trends-7.png)

Another last-decade trend is the overall rise of the data scientist. Correspondingly, their faithful tools have gained popularity: Jupyter, numpy, and pandas all rose with numpy at the top.

## Data visualization

[D3.js, Matplotlib, ggplot2](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0k2kwt4,%2Fm%2F08b9rm,%2Fm%2F0gythct)

![](/images/assets/trends-8.png)

The inscrutable Matplotlib leads the data visualization trend, but maybe it just generates more search traffic because it's hard to use?

## Cloud computing

[Google Cloud, AWS, Azure](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0105pbj4,%2Fm%2F05nrgx,%2Fm%2F04y7lrx)

![](/images/assets/trends-9.png)

While it feels ubiquitous today, even cloud computing is really a last-decade trend. Amazon and Microsoft battle for first, while Google struggles below.

## Big data

[Hadoop, Spark, Kafka](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0fdjtq,%2Fm%2F0ndhxqz,%2Fm%2F0zmynvd)

![](/images/assets/trends-10.png)

Hadoop passes the baton to Spark as it becomes the leading big data processor.

## Machine learning

[TensorFlow, Pytorch, Caffe, scikit-learn](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fg%2F11bwp1s2k3,%2Fg%2F11gd3905v1,%2Fg%2F11g6ym8nbt)

![](/images/assets/trends-11.png)

Machine learning frameworks are on the rise with the popularity of deep learning, with TensorFlow at the top, but falling precipitously. Scikit-learn was doing machine learning before it was cool.

## Embedded computing

[Raspberry Pi, Arduino](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F0gmg36g,%2Fm%2F0djmwv)

![](/images/assets/trends-12.png)

The embedded computing platforms Raspberry Pi and Arduino both hit the big time at the beginning of the decade. Did you know that the Pi is the third best-selling general-purpose computing platform [of all time](https://magpi.raspberrypi.org/articles/raspberry-pi-sales)?

## Education

[Scratch, Lego Mindstorms, Alice](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F028167f,%2Fm%2F01c7gw,Alice)

![](/images/assets/trends-13.png)

The pre-college programming education landscape hasn't changed significantly in terms of tools specialized to education (e.g. the shift to Python isn't represnted here). Well, one notable change though...

![](/images/assets/trends-14.png)

## Version control

[Git, Subversion, Mercurial, Perforce](https://trends.google.com/trends/explore?cat=31&date=all&geo=US&q=%2Fm%2F05vqwg,%2Fm%2F012ct9,%2Fm%2F08441_,%2Fm%2F08w6d6)

![](/images/assets/trends-15.png)

Git won.

## Addendum: Programming Languages

Since there are existing metrics for tracking programming language popularity, we can look to those to see how PLs changed over the decade. The [PYPL](http://pypl.github.io/PYPL.html) measures search interest for language tutorials. For example, the top 6 PLs by popularity:

![](/images/assets/trends-16.png)

Note that the graph uses a log-scale on the y-axis. The most notable trend here: Python grew from 3% of total search volume to 30% of total search volume. It wins the language of the decade award, hands down!

A few more comparisons:

**Systems languages**

![](/images/assets/trends-17.png)

C/C++ still hold dominant. Go moderately more popular than Rust.

**Scripting languages**

![](/images/assets/trends-18.png)

Ruby and Visual Basic in decline, Javascript roughly constant, Python to the top.

**Scientific computing languages**

![](/images/assets/trends-19.png)

Matlab starts to die, R gets more popular but seems to plateau.

**Java-like languages**

![](/images/assets/trends-20.png)

Look at the elbow on the Swift line!
