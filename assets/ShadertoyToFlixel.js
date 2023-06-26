doThing = (file) => {
	file = file.split("\n")

	var watermark = false
	var pragmaHeader = false

	// shadertoy variables (not all for now!!!)
	var iResolution = false
	var iTime = false
	var iChannel0 = false
	var iChannel1 = false
	var iChannel2 = false
	var iChannel3 = false

	var main = false

	var fixedAlpha = false

	for (let i = 0; i < file.length; i++) {
		var tocheck = file[i].trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "") // `vec2 uv ;` => `vec2uv;`
		if (tocheck.includes("texture2D(")) {
			file[i] = file[i].replaceAll("flixel_texture2D(", "texture2D(")
			file[i] = file[i].replaceAll("texture2D(", "flixel_texture2D(")
			console.log("[TRACE] Replaced texture to flixel_texture2D in line " + i + "!")
		}
		if (tocheck.includes("texture(")) {
			file[i] = file[i].replaceAll("flixel_texture2D(", "texture(")
			file[i] = file[i].replaceAll("texture(", "flixel_texture2D(")
			console.log("[TRACE] Replaced texture to flixel_texture2D in line " + i + "!")
		}
		if (tocheck.includes("round(")) {
			file[i] = file[i].replaceAll("round(", "floor(")
			console.log("[TRACE] Replaced round to floor in line " + i + "! (floor only in #version 130 and later)")
		}

		if (tocheck.startsWith("#undef")) {
			file.splice(i, 1)
			i--
		}

		if (file[i].includes("// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel") || file[i].includes("// Automatically converted with ShadertoyToFlixel.js")) watermark = true
		if (file[i].includes("#pragma header")) pragmaHeader = true
		if (file[i].includes("#define iResolution openfl_TextureSize")) iResolution = true
		if (file[i].includes("uniform float iTime;")) iTime = true
		if (file[i].includes("#define iChannel0 bitmap")) iChannel0 = true
		if (file[i].includes("uniform sampler2D iChannel1;")) iChannel1 = true
		if (file[i].includes("uniform sampler2D iChannel2;")) iChannel2 = true
		if (file[i].includes("uniform sampler2D iChannel3;")) iChannel3 = true
		
		if (file[i].includes("void main()")) main = true

		if (tocheck.includes("textureSize(bitmap,0)")) {
			file[i] = file[i].replaceAll("textureSize(bitmap, 0)", "iResolution.xy")
			file[i] = file[i].replaceAll("textureSize(bitmap,0)", "iResolution.xy")
			console.log("[TRACE] Replaced textureSize(bitmap, 0) to iResolution.xy in line " + i + "!  (textureSize only in #version 130 and later)")
		}
		if (tocheck.includes("iChannelResolution[0]")) {
			file[i] = file[i].replaceAll("iChannelResolution[0]", "iResolution")
			console.log("[TRACE] Replaced iChannelResolution[0] to iResolution in line " + i + "!")
		}
	}

	for (let i = 0; i < file.length; i++) {
		var tocheck = file[i].trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
		if (tocheck.includes('gl_FragColor=vec4('))
			file = fixAlphaChannel(file, i)
	}

	function fixAlphaChannel(file, i) {
		// doing vars
		var str = file.join('\n')
		var alphaStr = str
		alphaStr = alphaStr.substring(alphaStr.lastIndexOf(file[i]))
		alphaStr = alphaStr.substring(0, alphaStr.indexOf(");"))

		// finding uv name
		var uvName = "uv"
		if (alphaStr.includes("flixel_texture2D(")) {
			var uvName_last = uvName
			uvName = alphaStr.substring(alphaStr.indexOf("flixel_texture2D("))
			uvName = uvName.substring(uvName.indexOf(",") + 1).trim()
			uvName = uvName.substring(0, uvName.indexOf(")"))
			if (uvName.includes(" ")) uvName = uvName.replaceAll(" ", "")
			if (uvName_last != uvName) console.log("[TRACE] Found new uv name! (" + uvName + ")")
		}

		// finding and replacing alpha value
		var shutup = false
		if (alphaStr.includes("flixel_texture2D(bitmap, " + uvName + ").a")) {
			alphaStr = alphaStr.replaceAll("flixel_texture2D(bitmap, " + uvName + ").a", "1.0")
			shutup = true
		}
		var alphaValue = alphaStr.substring(alphaStr.lastIndexOf(',') + 1).trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
		alphaStr = alphaStr.substring(0, alphaStr.lastIndexOf(',')) + alphaStr.substring(alphaStr.lastIndexOf(',')).replaceAll(alphaValue, "flixel_texture2D(bitmap, " + uvName + ").a")

		// adding new alpha value to shader
		var prefix = str.substring(0, str.lastIndexOf(file[i]))
		var suffix = str.substring(str.lastIndexOf(file[i])).substring(str.substring(str.lastIndexOf(file[i])).indexOf(");"))
		str = prefix + alphaStr + suffix

		if (!shutup) console.log("[TRACE] Fixed alpha channel!")
		fixedAlpha = true

		return str.split('\n')
	}
	var whatever = []

	// adds things in start of file
	if (!watermark) {
		whatever.push("// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel")
	}

	if (whatever.length > 0) whatever.push("")

	if (!pragmaHeader) {
		whatever.push("#pragma header")
		console.log("[TRACE] Added #pragma header!")
	}

	if (whatever.length > 0) whatever.push("")

	if (!iResolution) {
		whatever.push("#define iResolution openfl_TextureSize")
		console.log("[TRACE] Added iResolution!")
	}
	if (!iTime) {
		whatever.push("uniform float iTime;")
		console.log("[TRACE] Added iTime!")
	}
	if (!iChannel0) {
		whatever.push("#define iChannel0 bitmap")
		console.log("[TRACE] Added iChannel0!")
	}
	if (!iChannel1) {
		whatever.push("uniform sampler2D iChannel1;")
		console.log("[TRACE] Added iChannel1!")
	}
	if (!iChannel2) {
		whatever.push("uniform sampler2D iChannel2;")
		console.log("[TRACE] Added iChannel2!")
	}
	if (!iChannel3) {
		whatever.push("uniform sampler2D iChannel3;")
		console.log("[TRACE] Added iChannel3!")
	}

	if (whatever.length > 0) whatever.push("")

	file = whatever.concat(file)

	// adds things in end of file
	if (!main) {
		file.push("")
		file.push("void main() {")
		file.push("\tmainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);")
		file.push("}")
		console.log("[TRACE] Added void main!")
	}

	if (!fixedAlpha) console.log("[ERROR] Can't fix alpha channel! Maybe it already working properly?")

	return file.join('\n')
}