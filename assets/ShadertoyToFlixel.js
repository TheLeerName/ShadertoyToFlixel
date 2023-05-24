const fs = require('fs')
const dialog = require('node-file-dialog').dialog

/*dialog({type:'open-file'}).then(file => {
	doThing(file[0])
}).catch(err => {})*/
dialog({type: 'open-file', extra: {ext: "*.frag", title: "Choose a shader fragment source file...", types: { "Shader file": '.frag'}}}).then(file => {
	var data = doThing(file[0])
	var output = 'flixel-' + file[0].substring(file[0].lastIndexOf("/") + 1)
	dialog({type:'save-file', extra: {startfile: output, ext: "*.frag", title: "Save a converted file...", types: { "Shader file": '.frag'}}}).then(file => {
		console.log("[TRACE] Fragment source saved to '" + file[0] + "'!")
		fs.writeFileSync(file[0], data)
	})
	.catch(err => {})
})
.catch(err => {})

function doThing(file) {
	if (!fs.existsSync(file)) return
	//var file = fs.readFileSync(process.argv[2]).toString().split('\n')
	var output = file.substring(0, file.lastIndexOf("/") + 1) + 'flixel-' + file.substring(file.lastIndexOf("/") + 1)
	file = fs.readFileSync(file).toString().split("\n")

	file.splice(0, 0, "// Automatically converted with ShadertoyToFlixel.js")
	file.splice(1, 0, "")

	var pragmaHeader = false
	var iTime = false
	var uv = false
	var fragCoord = false
	var iResolution = false

	var fixedAlpha = false
	var fixedMain = false

	for (let i = 0; i < file.length; i++) {
		if (file[i].includes('void mainImage(')) {
			console.log("[TRACE] Fixing void mainImage...")
			file[i] = 'void mainImage()'
			fixedMain = true
		}
		if (file[i].includes('fragColor = vec4(')) {
			console.log("[TRACE] Fixing alpha channel...")
			file[i] = file[i].substring(0, file[i].indexOf(",") + 1) + " uv);"
			fixedAlpha = true
		}
		if (!file[i].includes("#define")) {
			if (file[i].includes("iChannel0")) {
				file[i] = file[i].replaceAll("iChannel0", "bitmap");
				console.log("[TRACE] Replaced iChannel0 to bitmap in line " + i + "!")
			}
			if (file[i].includes("texture")) {
				file[i] = file[i].replaceAll("texture", "flixel_texture2D");
				console.log("[TRACE] Replaced texture to flixel_texture2D in line " + i + "!")

			}
			if (file[i].includes("fragColor")) {
				file[i] = file[i].replaceAll("fragColor", "gl_FragColor");
				console.log("[TRACE] Replaced fragColor to gl_FragColor in line " + i + "!")

			}
			if (file[i].includes("mainImage")) {
				file[i] = file[i].replaceAll("mainImage", "main");
				console.log("[TRACE] Replaced mainImage to main in line " + i + "!")

			}
		}
		if (file[i].includes("#pragma header")) pragmaHeader = true;
		if (file[i].includes("vec2 uv = ")) uv = true;
		if (file[i].includes("vec2 fragCoord = ")) fragCoord = true;
		if (file[i].includes("vec2 iResolution = ")) iResolution = true;
		if (file[i].includes("uniform float iTime;")) iTime = true;
	}
	if (!pragmaHeader) {
		file.splice(2, 0, "#pragma header")
		console.log("[TRACE] Added #pragma header!")
	}
	if (!uv) {
		file.splice(3, 0, "vec2 uv = openfl_TextureCoordv.xy;")
		console.log("[TRACE] Added vec2 uv!")
	}
	if (!fragCoord) {
		file.splice(4, 0, "vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;")
		console.log("[TRACE] Added vec2 fragCoord!")
	}
	if (!iResolution) {
		file.splice(5, 0, "vec2 iResolution = openfl_TextureSize;")
		console.log("[TRACE] Added vec2 iResolution!")
	}
	if (!iTime) {
		file.splice(6, 0, "uniform float iTime;")
		console.log("[TRACE] Added uniform float iTime!")
	}
	file.splice(7, 0, "")

	if (!fixedMain) console.log("[ERROR] Can't fix void mainImage!")
	if (!fixedAlpha) console.log("[ERROR] Can't fix alpha channel!")

	return file.join('\n')
}