const fs = require('fs')
const dialog = require('node-file-dialog').dialog
require('./ShadertoyToFlixel.js')

console.log(`\n  Welcome to Shadertoy to Flixel ${versionSTF}!`);
console.log("\n Choose shader fragment source for converting...\n");

dialog({type: 'open-file', extra: {ext: "*.frag", title: "Choose a shader fragment source file...", types: { "Shader file": '.frag'}}}).then(file => {
	if (!fs.existsSync(file[0])) return

	var data = doThing(fs.readFileSync(file[0]).toString())
	var output = 'flixel-' + file[0].substring(file[0].lastIndexOf("/") + 1)

	console.log("\n Choose save path...");
	dialog({type:'save-file', extra: {startfile: output, ext: "*.frag", title: "Save a converted file...", types: { "Shader file": '.frag'}}}).then(file => {
		fs.writeFileSync(file[0], data)
		console.log("\n  Fragment source saved to '" + file[0] + "'!")
	})
	.catch(err => {
		console.log("\n  Saving file cancelled by user.")
	})
})
.catch(err => {
	console.log(err)
	//console.log("\n  Opening file cancelled by user. ")
})