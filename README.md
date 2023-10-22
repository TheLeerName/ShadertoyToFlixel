# Shadertoy to Flixel
node.js script which converts fragment source (.frag) glsl shaders from [Shadertoy](https://www.shadertoy.com) to [Flixel](https://haxeflixel.com). Uses a cool lib [node-file-dialog](https://github.com/manorit2001/node-file-dialog), check it out!

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

## How to convert it again to shadertoy?
- remove `void main()` function *entirely*
- remove lines from `#pragma header` to `uniform vec4 iDate;`
- profit!!!!!

## What it exactly do?
- adding `#pragma header`
- adding variables from shadertoy like `iResolution` and `iTime`
- adding additional `flixel_texture2D` function with three arguments to use `bias` argument
- replacing alpha value (usually `1.0`) to alpha of sprite in `fragColor`
- adding `void main` with calling `void mainImage` function

### What you know about rolling down in the deep?
<img src="https://i.imgur.com/FIFZhPm.gif" width="10%"/>
