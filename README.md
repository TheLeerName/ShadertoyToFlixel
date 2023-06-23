# Shadertoy to Flixel
node.js script which converts fragment source (.frag) glsl shaders from [shadertoy.com](https://www.shadertoy.com) to [flixel](https://haxeflixel.com). Uses a cool lib [node-file-dialog](https://github.com/manorit2001/node-file-dialog), check it out!

# [Report errors here!](https://github.com/TheLeerName/ShadertoyToFlixel/issues/new)

# [WEB VERSION](https://theleername.github.io/ShadertoyToFlixel/)

## Supports shaders with
- #version 100 / 110 / 120 / 130
- no sound channels
- only 2D (i think)

### Converted shader supports Windows, Android, Linux (?)
pls message me if it work on some other platforms!!!!!

## How to use?
- install [node.js](https://nodejs.org)
- open `run.bat`
- now do what windows say
- i left night vision shader for you to test this script (its not mine ofc)! [NightVisionFilter.frag](https://github.com/TheLeerName/ShadertoyToFlixel/blob/main/NightVisionFilter.frag)

## What it exactly do?
- adding `#pragma header`
- adding `fragCoord` and `iResolution`
- adding `iTime`
- replacing `texture`/`texture2D` to `flixel_texture2D`
- replacing `round` to `floor`
- replacing `iChannel0` to `bitmap`
- replacing `fragColor` to `gl_FragColor`
- replacing alpha value (usually `1.0`) to alpha of sprite in `gl_FragColor`
- removing arguments from `void mainImage` and replacing it with `void main`

### What you know about rolling down in the deep?
<img src="https://i.imgur.com/FIFZhPm.gif" width="10%"/>
