doThing = (file, onlog, onerror) => {
	onlog ??= console.log;
	onerror ??= console.log;

	// i heard it breaks some shaders
	file = file.replaceAll('highp ', '')
	file = file.replaceAll('highp', '')
	
	var doAlphaChannel = file.includes('uv')

	// we need to remove some unusual characters
	// openfl shaders hates them lol
	for (let i = 0; i < file.length; i++) if (file.charCodeAt(i) > 126) {
		file = file.substring(0, i) + file.substring(i + 1)
	}

	file = file.split("\n")

var megafix = `// third argument fix
vec4 flixel_texture2D(sampler2D bitmap, vec2 coord, float bias) {
	vec4 color = texture2D(bitmap, coord, bias);
	if (!hasTransform)
	{
		return color;
	}
	if (color.a == 0.0)
	{
		return vec4(0.0, 0.0, 0.0, 0.0);
	}
	if (!hasColorTransform)
	{
		return color * openfl_Alphav;
	}
	color = vec4(color.rgb / color.a, color.a);
	mat4 colorMultiplier = mat4(0);
	colorMultiplier[0][0] = openfl_ColorMultiplierv.x;
	colorMultiplier[1][1] = openfl_ColorMultiplierv.y;
	colorMultiplier[2][2] = openfl_ColorMultiplierv.z;
	colorMultiplier[3][3] = openfl_ColorMultiplierv.w;
	color = clamp(openfl_ColorOffsetv + (color * colorMultiplier), 0.0, 1.0);
	if (color.a > 0.0)
	{
		return vec4(color.rgb * color.a * openfl_Alphav, color.a * openfl_Alphav);
	}
	return vec4(0.0, 0.0, 0.0, 0.0);
}`

	var watermark = false
	var pragmaHeader = false
	var texture = false
	var round = false

	// shadertoy variables (not all for now!!!)
	var iResolution = false
	var iTime = false
	var iChannel0 = false
	var iChannel1 = false
	var iChannel2 = false
	var iChannel3 = false
	var notupdatingvars = false

	var main = false

	var fixedAlpha = false

	// IF SOMEONE KNOW HOW FIX THING PLS LET ME KNOW
	//file = fixIdiotThirdArgumentTexture(file)
	function fixIdiotThirdArgumentTexture(file) {
		file = file.join('\n')
		file = file.replaceAll('flixel_texture2D', 'texture')
		file = file.replaceAll('texture2D', 'texture')
		// regex is fun
		file = file.replaceAll(
			/texture\s*\(\s*([A-Za-z0-9/*.+-]+)*\s*,\s*([A-Za-z0-9/*.+-]+)*\s*,\s*([A-Za-z0-9/*.+-]+)*\s*\)/g,
			'texture($1, $2)'
		)
		return file.split('\n')
	}

	// not used
	//file = fixTextureSize(file)
	function fixTextureSize(file) {
		file = file.join('\n')
		file = file.replaceAll(
			/textureSize\s*\(\s*iChannel0\s*,\s*[A-Za-z0-9/*.+-]+\s*\)/g,
			'iResolution.xy'
		)
		file = file.replaceAll('iChannelResolution[0]', 'iResolution.xy')
		return file.split('\n')
	}

	for (let i = 0; i < file.length; i++) {
		var tocheck = formatToCheck(file[i])

		if (file[i].includes("// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel")) watermark = true
		if (file[i].includes("#pragma header")) pragmaHeader = true
		if (file[i].includes("#define texture flixel_texture2D")) texture = true
		if (file[i].includes("#define round(a) floor(a + 0.5)")) round = true
		if (file[i].includes("#define iResolution vec3(openfl_TextureSize, 0.)")) iResolution = true
		if (file[i].includes("uniform float iTime;")) iTime = true
		if (file[i].includes("#define iChannel0 bitmap")) iChannel0 = true
		if (file[i].includes("uniform sampler2D iChannel1;")) iChannel1 = true
		if (file[i].includes("uniform sampler2D iChannel2;")) iChannel2 = true
		if (file[i].includes("uniform sampler2D iChannel3;")) iChannel3 = true
		if (file[i].includes("uniform float iTimeDelta;")) notupdatingvars = true

		if (file[i].includes("void main()")) main = true
	}

	for (let i = 0; i < file.length; i++) {
		var tocheck = formatToCheck(file[i])
		if (doAlphaChannel && tocheck.includes('fragColor=vec4('))
			file = fixAlphaChannel(file, i)
		if (file[i].includes('void main()'))
			file = convertVoidMainToShadertoy(file, i)
	}

	function convertVoidMainToShadertoy(file, i) {
		if (!formatToCheck(file[i + 1]).includes('mainImage(gl_FragColor,openfl_TextureCoordv*openfl_TextureSize);')) {
			file[i] = file[i].replaceAll('void main()', 'void mainImage(out vec4 fragColor, in vec2 fragCoord)')
			file = file.join('\n').replaceAll('gl_FragColor', 'fragColor').split('\n')
		}
		return file
	}

	function fixAlphaChannel(file, i) {
		// doing vars
		var str = file.join('\n')
		var alphaStr = str
		alphaStr = alphaStr.substring(alphaStr.lastIndexOf(file[i]))
		alphaStr = alphaStr.substring(0, alphaStr.indexOf(");"))

		// finding uv name
		var uvName = "uv"
		if (alphaStr.includes("texture(")) {
			var uvName_last = uvName
			uvName = alphaStr.substring(alphaStr.indexOf("texture("))
			uvName = uvName.substring(uvName.indexOf(",") + 1).trim()
			uvName = uvName.substring(0, uvName.indexOf(")"))
			if (uvName.includes(" ")) uvName = uvName.replaceAll(" ", "")
			if (uvName_last != uvName) onlog("Found new uv name! (" + uvName + ")")
		}

		// finding and replacing alpha value
		var shutup = false
		if (alphaStr.includes("texture(iChannel0, " + uvName + ").a")) {
			alphaStr = alphaStr.replaceAll("texture(iChannel0, " + uvName + ").a", "1.0")
			shutup = true
		}
		var alphaValue = formatToCheck(alphaStr.substring(alphaStr.lastIndexOf(',') + 1))
		alphaStr = alphaStr.substring(0, alphaStr.lastIndexOf(',')) + alphaStr.substring(alphaStr.lastIndexOf(',')).replaceAll(alphaValue, "texture(iChannel0, " + uvName + ").a")

		// adding new alpha value to shader
		var prefix = str.substring(0, str.lastIndexOf(file[i]))
		var suffix = str.substring(str.lastIndexOf(file[i])).substring(str.substring(str.lastIndexOf(file[i])).indexOf(");"))
		str = prefix + alphaStr + suffix

		if (!shutup) onlog("Fixed alpha channel!")
		fixedAlpha = true

		return str.split('\n')
	}

	function formatToCheck(line) {
		// `vec2 uv ;` => `vec2uv;`
		return line.trim().replaceAll(" ", "").replaceAll("\t", "").replaceAll("\r", "")
	}

	var whatever = []

	// adds things in start of file
	if (!watermark) {
		whatever.push("// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel")
	}

	if (whatever.length > 0) whatever.push("")

	if (!pragmaHeader) {
		whatever.push("#pragma header")
		onlog("Added #pragma header!")
	}

	if (whatever.length > 0) whatever.push("")

	if (!round) {
		whatever.push("#define round(a) floor(a + 0.5)")
		onlog("Added round!")
	}
	if (!iResolution) {
		whatever.push("#define iResolution vec3(openfl_TextureSize, 0.)")
		onlog("Added iResolution!")
	}
	if (!iTime) {
		whatever.push("uniform float iTime;")
		onlog("Added iTime!")
	}
	if (!iChannel0) {
		whatever.push("#define iChannel0 bitmap")
		onlog("Added iChannel0!")
	}
	if (!iChannel1) {
		whatever.push("uniform sampler2D iChannel1;")
		onlog("Added iChannel1!")
	}
	if (!iChannel2) {
		whatever.push("uniform sampler2D iChannel2;")
		onlog("Added iChannel2!")
	}
	if (!iChannel3) {
		whatever.push("uniform sampler2D iChannel3;")
		onlog("Added iChannel3!")
	}
	if (!texture) {
		whatever.push("#define texture flixel_texture2D")
		whatever.push("")
		whatever.push(megafix)
		onlog("Added texture!")
	}
	if (!notupdatingvars) {
		whatever.push("")
		whatever.push("// variables which is empty, they need just to avoid crashing shader")
		whatever.push("uniform float iTimeDelta;")
		whatever.push("uniform float iFrameRate;")
		whatever.push("uniform int iFrame;")
		whatever.push("#define iChannelTime float[4](iTime, 0., 0., 0.)")
		whatever.push("#define iChannelResolution vec3[4](iResolution, vec3(0.), vec3(0.), vec3(0.))")
		whatever.push("uniform vec4 iMouse;")
		whatever.push("uniform vec4 iDate;")
	}

	if (whatever.length > 0) whatever.push("")

	file = whatever.concat(file)

	// adds things in end of file
	if (!main) {
		file.push("")
		file.push("void main() {")
		file.push("\tmainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);")
		file.push("}")
		onlog("Added void main!")
	}

	if (!fixedAlpha) onerror("Can't fix alpha channel! Maybe it already working properly?")

	return file.join('\n')
}
