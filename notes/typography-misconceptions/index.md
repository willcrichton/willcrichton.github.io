---
title: Typography Misconceptions
description: Kerning is not letterspacing, title figures are not text figures, italic is not oblique, and display font is not fancy font.
date: February 10, 2024
author: Will Crichton
---

<style>
  @font-face {
    font-family: "Linux Libertine";
    src: url("/assets/fonts/LinLibertine_R.woff2");
  }

  @font-face {
    font-family: "Linux Libertine";
    font-style: italic;
    src: url("/assets/fonts/LinLibertine_RI.woff2");
  }

  @font-face {
    font-family: "Linux Libertine Display";    
    src: url("/assets/fonts/LinLibertine_DR.woff2");
  }

  body { 
    font-family: "Linux Libertine", serif;
    font-variant-numeric: oldstyle-nums;
  }

  figure {
    max-width: 100%;
    overflow-x: auto;
  }

  .fonttable {
    border: none;
    margin: 0 auto;
    border-collapse: separate; 
    border-spacing: 0 1em;    
  }

  .fonttable td {
    border: none;
    vertical-align: middle;
  }

  .fonttable td:last-child {
    padding-left: 80px;
  }

  @media only screen and (max-width: 600px) {
    .fonttable td:last-child {
      padding-left: 40px;
    }
  }

  .fontsample {
    font-size: 32pt;
    line-height: 1em;    
  }

  .sc {
    font-variant-caps: all-small-caps;
  }

  .slash {
    position: relative;
    top: 0.05em;
    left: 0.03em;
  }

  abbr {
    font-variant-caps: all-small-caps;
    letter-spacing: 0.05em;
  }

  .display {
    font-family: "Linux Libertine Display", serif;
  }

  .spacer {
    width: 0.1em;
    display: inline-block;
  }
</style>

Like most people, I have an intuitive conception of typography from my experience with reading and writing. But in my quest to [rethink](https://arxiv.org/abs/2310.04368) [document](https://nota-lang.org/) [technologies](https://willcrichton.net/notes/portable-epubs/), I've been learning more about the different layers of document design. I just finished reading Robert Bringhurst's excellent book, [_The Elements of Typographic Style_](https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style). I wanted to share a few of my biggest misconceptions that were clarified by the book.

## Kerning is not letterspacing

I used to believe that _kerning_ meant <q>the spacing between letters.</q> That is incorrect &ndash; _letterspacing_ is the spacing between letters. (...Of course.)

<figure>
  <table class="fonttable">
    <tr>
      <td><div class="fontsample">LETTERSPACING</div></td>
      <td>Normal letter spacing</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="letter-spacing: 0.16em">LETTERSPACING</div></td>
      <td><span class="sc">m<span class="slash">/</span>6</span> letter spacing</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="letter-spacing: 0.25em">LETTERSPACING</div></td>
      <td><span class="sc">m<span class="slash">/</span>4</span> letter spacing</td>
    </tr>
  </table>
</figure>

Bringhurst recommends letterspacing for full-caps titles, like above, as well as for small-caps abbreviations like <abbr>HTML</abbr> or <abbr>CSS</abbr>. By contrast, kerning is more specific: it refers to special cases where pairs of adjacent characters are pushed towards each other.

<figure>
  <table class="fonttable">
    <tr>
      <td><div class="fontsample">Wa</div></td>
      <td><div class="fontsample">To</div></td>
      <td><div class="fontsample">Av</div></td>
      <td><div class="fontsample">y.</div></td>
      <td>Kerning enabled</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="font-kerning: none">Wa</div></td>
      <td><div class="fontsample" style="font-kerning: none">To</div></td>
      <td><div class="fontsample" style="font-kerning: none">Av</div></td>
      <td><div class="fontsample" style="font-kerning: none">y.</div></td>
      <td>Kerning disabled</td>
    </tr>
  </table>
</figure>

Observe that with kerning disabled, you could draw a vertical line in the middle of each pair without intersecting either letter. Also note that kerning is distinct from <i>ligatures</i>, where sequences of characters are replaced by an entirely bespoke glyph.

<figure>
  <table class="fonttable">
    <tr>
      <td><div class="fontsample">ff</div></td>
      <td><div class="fontsample">tt</div></td>
      <td><div class="fontsample">Qu</div></td>
      <td>Ligatures enabled</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="font-variant-ligatures: none">ff</div></td>
      <td><div class="fontsample" style="font-variant-ligatures: none">tt</div></td>
      <td><div class="fontsample" style="font-variant-ligatures: none">Qu</div></td>     
      <td>Ligatures disabled</td>
    </tr>
  </table>
</figure>

If you dig around your font face, you can find some fun ligatures!

<table class="fonttable">
  <tr>
    <td><div class="fontsample" style="font-variant-ligatures: common-ligatures discretionary-ligatures contextual historical-ligatures">tz</div></td>
    <td><div class="fontsample" style="font-variant-ligatures: common-ligatures discretionary-ligatures contextual historical-ligatures">ct</div></td>
    <td><div class="fontsample" style="font-variant-ligatures: common-ligatures discretionary-ligatures contextual historical-ligatures">st</div></td>
    <td>All ligatures enabled</td>
  </tr>
  <tr>
    <td><div class="fontsample">tz</div></td>
    <td><div class="fontsample">ct</div></td>
    <td><div class="fontsample">st</div></td>
    <td>Normal ligatures enabled</td>
  </tr>
</table>



## Title figures are not text figures

I used to think of numerals as not having a case like letters. That is incorrect &ndash; numerals (or <i>figures</i> in typography-speak) can be lower-case (<q>text figures</q>) or upper-case (<q>title figures</q>).

<figure>
  <table class="fonttable">
    <tr>
      <td><div class="fontsample">The 1970s are 20<sup>th</sup> century.</div></td>
      <td>Text figures</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="font-variant-numeric: normal">The 1970s are 20<sup>th</sup> century.</div></td>
      <td>Title figures</td>
    </tr>
  </table>
</figure>

The vast majority of modern fonts will render title figures by default, so I suspect most people (myself included) assumed that title figures were the canonical way of displaying numerals. The only common exception I know is the font <a href="https://en.wikipedia.org/wiki/Georgia_(typeface)">Georgia</a>, and I always assumed its numerals were a stylistic flourish.

Bringhurst considers this a tragedy, since he recommends using text figures in body text. The aesthetic argument is that lower-case numerals fit more naturally in a flow of lower-case letters. Or as Bringhurst puts it (pp 47):

> [Text figures] are basic parts of typographic speech, and they are a sign of civilization: a sign that dollars are not really twice as important as ideas, and numbers are not afraid to consort on an equal footing with words.

Part of the confusion is that unlike letters, the Unicode does not contain separate characters for upper-case and lower-case numerals. Fonts represent text and title figures as different variants of the same character. If you want to try using text figures on your web page, you can use the [`font-variant-numeric`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric) property with the value `oldstyle-nums` (a loaded term that Bringhurst also disdains).


## Italic is not oblique

I used to think of italic as the <q>slanted style</q> of a font. That is&hellip; not wholly incorrect, but it misses some subtleties. In the common case, sans serif fonts and capital letters have an <em>oblique</em> style where the standard letterforms are slanted to the right. Oblique is distinct from italic, which is designed to mimic cursive writing and can therefore substantially change certain letterforms.

<figure>
  <table class="fonttable">
    <tr>
      <td><div class="fontsample">fast yeti</div></td>
      <td><div class="fontsample" style="font-style: italic">fast yeti</div></td>
      <td>Serif</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="font-variant: all-small-caps">fast yeti</div></td>
      <td><div class="fontsample" style="font-variant: all-small-caps; font-style: italic">fast yeti</div></td>
      <td>Small caps serif</td>
    </tr>
    <tr>
      <td><div class="fontsample" style="font-family: Arial, sans-serif; font-size: 30pt">fast yeti</div></td>
      <td><div class="fontsample" style="font-family: Arial, sans-serif; font-size: 30pt; font-style: italic">fast yeti</div></td>
      <td>Sans serif</td>
    </tr>  
  </table>
</figure>

Observe that <q>fa</q> looks quite different in the italics serif than the normal serif. In the other fonts and variants, the oblique <q>fa</q> is just a slanted version of the original. Most font faces only provide either oblique or italic style. See the [Oblique type](https://en.wikipedia.org/wiki/Oblique_type) Wikipedia page for an example of a font that contains both.


## Display font is not fancy font

I used to think that display fonts were the <q>fancy fonts</q>, that is, unusual-looking fonts intended for stylistic flourish. I thought this because many font websites like [Google Fonts](https://fonts.google.com/?classification=Display) categorize eccentric fonts under <q>Display</q>. But really, display just means <q>appropriate for headings and not body text.</q>

In particular, a single font family can include both standard and display variants. If you want to show a font at a large size (e.g., for headings or logos), then you should use the display variant. 

<figure>
  <div class="fontsample" style="font-size: 128pt; text-align: center; margin-top: -0.1em; line-height: 1.3em">E<span class="spacer"></span><span class="display">E</span>&nbsp;x<span class="spacer"></span><span class="display">x</span>&nbsp;p<span class="spacer"></span><span class="display">p</span></div>  
  <div style="text-align: center"><i>Above:</i> Linux Libertine at 128pt. Left character is normal variant, right character is display variant.</div>
</figure>

Observe that the normal variant is thicker than the display variant. The normal variant is less elegant &mdash; notice the chunky serifs. The extra thickness is desirable at small font sizes like 18pt (i.e., body text) so the serifs remain legible, but it is undesirable at larger sizes.
