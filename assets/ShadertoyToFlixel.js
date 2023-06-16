doThing = (file) => {
	file = file.split("\n")

	var watermark = false
	var pragmaHeader = false
	var iTime = false
	var uv = false
	var fragCoord = false
	var iResolution = false

	var fixedAlpha = false
	var fixedMain = false

	for (let i = 0; i < file.length; i++) {
		var tocheck = file[i].trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
		if (!tocheck.includes("#define")) {
			if (tocheck.includes("mainImage")) {
				file[i] = file[i].replaceAll("mainImage", "main")
				console.log("[TRACE] Replaced mainImage to main in line " + i + "!")
			}
			if (tocheck.includes("iChannel0")) {
				file[i] = file[i].replaceAll("iChannel0", "bitmap")
				console.log("[TRACE] Replaced iChannel0 to bitmap in line " + i + "!")
			}
			if (tocheck.includes("texture(")) {
				file[i] = file[i].replaceAll("flixel_texture2D(", "texture(")
				file[i] = file[i].replaceAll("texture(", "flixel_texture2D(")
				console.log("[TRACE] Replaced texture to flixel_texture2D in line " + i + "!")
			}
			if (tocheck.includes("texture2D(")) {
				file[i] = file[i].replaceAll("flixel_texture2D(", "texture2D(")
				file[i] = file[i].replaceAll("texture2D(", "flixel_texture2D(")
				console.log("[TRACE] Replaced texture2D to flixel_texture2D in line " + i + "!")
			}
			if (tocheck.includes("fragColor") && !tocheck.includes('void main(')) {
				file[i] = file[i].replaceAll("fragColor", "gl_FragColor")
				console.log("[TRACE] Replaced fragColor to gl_FragColor in line " + i + "!")
			}
		}
		if (file[i].includes("// Automatically converted with ShadertoyToFlixel.js")) watermark = true
		if (file[i].includes("#pragma header")) pragmaHeader = true
		if (tocheck.includes("vec2uv=")) uv = true
		if (tocheck.includes("vec2fragCoord=")) fragCoord = true
		if (tocheck.includes("vec2iResolution=")) iResolution = true
		if (file[i].includes("uniform float iTime;")) iTime = true
	}
	
	for (let i = 0; i < file.length; i++) {
		var tocheck = file[i].trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
		if (file[i].includes('void main('))
			file = fixVoidMain(file, i)
		if (tocheck.includes('gl_FragColor=vec4('))
			file = fixAlphaChannel(file, i);
	}
	
	function fixVoidMain(file, i)
	{
		var bracket = file[i].includes('{')
		file[i] = 'void main()'
		if (bracket) file[i] = file[i] + ' {'

		console.log("[TRACE] Fixed void main!")
		fixedMain = true

		return file
	}

	function fixAlphaChannel(file, i) {
		// doing vars
		var str = file.join('\n')
		var alphaStr = str
		alphaStr = alphaStr.substring(alphaStr.lastIndexOf(file[i]))
		alphaStr = alphaStr.substring(0, alphaStr.lastIndexOf(");"))
		
		// finding uv name
		var uvName = "uv"
		if (alphaStr.includes("flixel_texture2D(")) {
			uvName = alphaStr.substring(alphaStr.indexOf("flixel_texture2D("))
			uvName = uvName.substring(uvName.indexOf(",") + 1).trim()
			uvName = uvName.substring(0, uvName.indexOf(")"))
			if (uvName.includes(" ")) uvName = uvName.replaceAll(" ", "")
			console.log("[TRACE] Found new uv name! (" + uvName + ")")
		}

		// finding and replacing alpha value
		var alphaValue = alphaStr.substring(alphaStr.lastIndexOf(',') + 1).trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
		alphaStr = alphaStr.substring(0, alphaStr.lastIndexOf(',')) + alphaStr.substring(alphaStr.lastIndexOf(',')).replaceAll(alphaValue, "flixel_texture2D(bitmap, " + uvName + ").a")

		// adding new alpha value to shader
		var prefix = str.substring(0, str.lastIndexOf(file[i]))
		var suffix = str.substring(str.lastIndexOf(file[i])).substring(str.substring(str.lastIndexOf(file[i])).lastIndexOf(");"))
		str = prefix + alphaStr + suffix

		console.log("[TRACE] Fixed alpha channel!")
		fixedAlpha = true

		return str.split('\n')
	}

	var whatever = []
	if (!watermark) {
		whatever.push("// Automatically converted with ShadertoyToFlixel.js")
		whatever.push("")
	}
	if (!pragmaHeader) {
		whatever.push("#pragma header")
		console.log("[TRACE] Added #pragma header!")
	}
	if (!uv) {
		whatever.push("vec2 uv = openfl_TextureCoordv;")
		console.log("[TRACE] Added vec2 uv!")
	}
	if (!fragCoord) {
		whatever.push("vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;")
		console.log("[TRACE] Added vec2 fragCoord!")
	}
	if (!iResolution) {
		whatever.push("vec2 iResolution = openfl_TextureSize;")
		console.log("[TRACE] Added vec2 iResolution!")
	}
	if (!iTime) {
		whatever.push("uniform float iTime;")
		console.log("[TRACE] Added uniform float iTime!")
	}
	whatever.push("")

	file = whatever.concat(file)

	if (!fixedMain) console.log("[ERROR] Can't fix void main!")
	if (!fixedAlpha) console.log("[ERROR] Can't fix alpha channel!")

	return file.join('\n')
}