doThing = (file) => {
	file = file.split("\n")

	var pragmaHeader = false
	var iTime = false
	var uv = false
	var fragCoord = false
	var iResolution = false

	var fixedAlpha = false
	var fixedMain = false

	for (let i = 0; i < file.length; i++) {
		if (!file[i].includes("#define")) {
			if (file[i].includes("mainImage")) {
				file[i] = file[i].replaceAll("mainImage", "main")
				console.log("[TRACE] Replaced mainImage to main in line " + i + "!")
			}
			if (file[i].includes("iChannel0")) {
				file[i] = file[i].replaceAll("iChannel0", "bitmap")
				console.log("[TRACE] Replaced iChannel0 to bitmap in line " + i + "!")
			}
			if (file[i].includes("texture")) {
				file[i] = file[i].replaceAll("texture", "flixel_texture2D")
				console.log("[TRACE] Replaced texture to flixel_texture2D in line " + i + "!")
			}
			if (file[i].includes("fragColor") && !file[i].includes('void main(')) {
				file[i] = file[i].replaceAll("fragColor", "gl_FragColor")
				console.log("[TRACE] Replaced fragColor to gl_FragColor in line " + i + "!")
			}
		}
		if (file[i].includes("#pragma header")) pragmaHeader = true
		if (file[i].includes("vec2 uv = ")) uv = true
		if (file[i].includes("vec2 fragCoord = ")) fragCoord = true
		if (file[i].includes("vec2 iResolution = ")) iResolution = true
		if (file[i].includes("uniform float iTime;")) iTime = true
		
		if (file[i].includes('void main(')) {
			var bracket = file[i].includes('{')
			file[i] = 'void main()'
			if (bracket) file[i] = file[i] + ' {'
			console.log("[TRACE] Fixed void main!")
			fixedMain = true
		}
		if (file[i].includes('gl_FragColor = vec4(') && file[i].includes(',')) {
			file[i] = file[i].substring(0, file[i].indexOf(",") + 1) + " uv);"
			console.log("[TRACE] Fixed alpha channel!")
			fixedAlpha = true
		}
	}

	var whatever = []
	whatever.push("// Automatically converted with ShadertoyToFlixel.js")
	whatever.push("")
	if (!pragmaHeader) {
		whatever.push("#pragma header")
		console.log("[TRACE] Added #pragma header!")
	}
	if (!uv) {
		whatever.push("vec2 uv = openfl_TextureCoordv.xy;")
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

	if (!fixedMain) console.log("[ERROR] Can't fix void mainImage!")
	if (!fixedAlpha) console.log("[ERROR] Can't fix alpha channel!")

	return file.join('\n')
}