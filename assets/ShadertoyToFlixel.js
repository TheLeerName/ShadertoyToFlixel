const { trace } = require('console')
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
	var bbpanzuFix = [
		"// Automatically converted with ShadertoyToFlixel.js",
		"#pragma header",
		"",
		"vec2 uv = openfl_TextureCoordv.xy;",
		"vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;",
		"vec2 iResolution = openfl_TextureSize;",
		"uniform float iTime;",
		"#define iChannel0 bitmap",
		"#define texture flixel_texture2D",
		"#define fragColor gl_FragColor",
		"#define mainImage main",
		""
	]
	console.log("[TRACE] Adding flixel defines...")
	file = bbpanzuFix.concat(file)

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
	}
	if (!fixedMain) console.log("[ERROR] Can't fix void mainImage!")
	if (!fixedAlpha) console.log("[ERROR] Can't fix alpha channel!")

	return file.join('\n')
}