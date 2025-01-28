versionSTF = "1.0.0"
doThing = (file, onlog, onerror) => {
	onlog ??= console.log
	onerror ??= console.log

	// i heard highp breaks some shaders
	file = file.replaceAll(/\bhighp\b\s?/g, '')

	// we need to remove some unusual characters
	// openfl shaders hates them lol
	for (let i = 0; i < file.length; i++) if (file.charCodeAt(i) > 126) {
		file = file.substring(0, i) + file.substring(i + 1)
	}


var megafix = `// third argument fix
vec4 flixel_texture2D(sampler2D bitmap, vec2 coord, float bias) {
	vec4 color = texture2D(bitmap, coord, bias);
	if (!hasTransform && !openfl_HasColorTransform)
		return color;

	if (color.a == 0.0)
		return vec4(0.0, 0.0, 0.0, 0.0);

	if (openfl_HasColorTransform || hasColorTransform) {
		color = vec4 (color.rgb / color.a, color.a);
		vec4 mult = vec4 (openfl_ColorMultiplierv.rgb, 1.0);
		color = clamp (openfl_ColorOffsetv + (color * mult), 0.0, 1.0);

		if (color.a == 0.0)
			return vec4 (0.0, 0.0, 0.0, 0.0);

		return vec4 (color.rgb * color.a * openfl_Alphav, color.a * openfl_Alphav);
	}

	return color * openfl_Alphav;
}`

	// required to add
	var ignoreWatermark = true
	var ignorePragmaHeader = true

	// will be added if it was used it shader
	var ignoreIResolution = true
	var ignoreITime = true
	var ignoreIChannel0 = true
	var ignoreIChannel1 = true
	var ignoreIChannel2 = true
	var ignoreIChannel3 = true
	var ignoreRound = true
	var ignoreTexture = true
	var ignoreTextureThirdArgumentFix = true

	// additional shadertoy variables which is empty to not crash the shader & will be added if it was used it shader
	var ignoreITimeDelta = true
	var ignoreIFrameRate = true
	var ignoreIFrame = true
	var ignoreIMouse = true
	var ignoreIDate = true
	var ignoreIChannelTime = true
	var ignoreIChannelResolution = true

	// misc
	var ignoreShaderHeaderEnd = true
	var ignoreMain = true
	var fixedAlpha = false

	// hi NeeEoo
	// thx again, i remembered about this repo cuz of ur pr <3
	function funcArgsCount(args) {
		let total = 0
		let balance = 0

		for (let char of args) {
			if (char === ',' && balance === 0) total++
			else if (char === '(') balance++
			else if (char === ')') balance--
		}

		return total + 1
	}

	function fixAlphaChannel() {
		// /\bvoid\s+mainImage\s*\(\s*out\s+vec4\s+([_a-z]\w*)\s*,.*vec2\s+([_a-z]\w*)\s*\)/
		let mainImage = /\bvoid\s+mainImage\s*\(\s*out\s+vec4\s+([_a-z]\w*)\s*,.*vec2\s+([_a-z]\w*)\s*\)/
		let mainImage_match = file.match(mainImage)
		let fragColorName = mainImage_match?.[1] ?? 'fragColor'
		let fragCoordName = mainImage_match?.[2] ?? 'fragCoord'

		// Method 1: Gets alpha in used texture() method for rgb channels
		if (!fixedAlpha) {
			// /\bfragColor\b\s*=\s*vec4\s*\(\s*([_a-z]\w*)\s*,\s*([-0-9.]*)\s*\)/s
			let vec4Variable = new RegExp(`\\b${fragColorName}\\b\\s*=\\s*vec4\\s*\\(\\s*([_a-z]\\w*)\\s*,\\s*([-0-9.]*)\\s*\\)`, 's')
			let vec4Variable_match = file.match(vec4Variable)
			if (vec4Variable_match != null) {
				// /\bvoid\s+mainImage\s*\(\s*out\s+vec4\s+(?:[_a-z]\w*)\s*,\s*in\s+vec2\s+(?:[_a-z]\w*)\s*\)\s*{.*?vec3\s+c\s*=\s*texture\s*\(\s*([_a-z]\w*)\s*,\s*([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*)\s*\)/s
				let vec4Variable_fromTexture_match = file.match(new RegExp(`\\bvoid\\s+mainImage\\s*\\(\\s*out\\s+vec4\\s+(?:[_a-z]\\w*)\\s*,\\s*in\\s+vec2\\s+(?:[_a-z]\\w*)\\s*\\)\\s*{.*?vec3\\s+${vec4Variable_match[1]}\\s*=\\s*texture\\s*\\(\\s*([_a-z]\\w*)\\s*,\\s*([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*)\\s*\\)`, `s`))
				if (vec4Variable_fromTexture_match != null) {
					file = file.replace(vec4Variable, `${fragColorName} = vec4($1, texture(${vec4Variable_fromTexture_match[1]}, ${vec4Variable_fromTexture_match[2]}).a)`)
					fixedAlpha = true
				}
			}
		}

		// Method 2: Gets alpha from fragCoord and iResolution division for situations where fragColor is setted from vec4 with 4 entries
		if (!fixedAlpha) {
			// /\bfragColor\b\s*=\s*vec4\s*\(\s*([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*)\s*,([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*),([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*),\s*([\w\d_.]*)\s*\)/s
			let fourEntries = new RegExp(`\\b${fragColorName}\\b\\s*=\\s*vec4\\s*\\(\\s*([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*)\\s*,([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*),([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*),\\s*([\\w\\d_.]*)\\s*\\)`, 's')
			let prevLength = file.length
			file = file.replace(fourEntries, `${fragColorName} = vec4($1, $2, $3, texture(iChannel0, ${fragCoordName} / iResolution.xy).a)`)
			if (prevLength != file.length) fixedAlpha = true
		}

		// Method 3: Gets alpha from fragCoord and iResolution division for situations where fragColor is setted from vec4 with 2 entries
		if (!fixedAlpha) {
			// /\bfragColor\b\s*=\s*vec4\s*\(\s*([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*)\s*,\s*([\w\d_.]*)\s*\)/s
			let twoEntries = new RegExp(`\\b${fragColorName}\\b\\s*=\\s*vec4\\s*\\(\\s*([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*)\\s*,\\s*([\\w\\d_.]*)\\s*\\)`, 's')
			let prevLength = file.length
			file = file.replace(twoEntries, `${fragColorName} = vec4($1, texture(iChannel0, ${fragCoordName} / iResolution.xy).a)`)
			if (prevLength != file.length) fixedAlpha = true
		}
	}
	fixAlphaChannel()

	// required to add
	ignoreWatermark = /^.*\/\/.*https:\/\/github\.com\/TheLeerName\/ShadertoyToFlixel.*$/m.test(file)
	ignorePragmaHeader = file.includes("#pragma header")

	// will be added if it was used it shader
	ignoreIResolution = /^.*#define\s+iResolution\s+vec3\s*\(\s*openfl_TextureSize\s*,.*0.*\)\s*$/m.test(file) || !/\biResolution\b/.test(file)
	ignoreITime = /\buniform\s+float\s+iTime\b/.test(file) || !/\biTime\b/.test(file)
	ignoreIChannel0 = /^.*#define\s+iChannel0\s+bitmap\b\s*$/m.test(file) || !/\biChannel0\b/.test(file)
	ignoreIChannel1 = /\buniform\s+sampler2D\s+iChannel1\b/.test(file) || !/\biChannel1\b/.test(file)
	ignoreIChannel2 = /\buniform\s+sampler2D\s+iChannel2\b/.test(file) || !/\biChannel2\b/.test(file)
	ignoreIChannel3 = /\buniform\s+sampler2D\s+iChannel3\b/.test(file) || !/\biChannel3\b/.test(file)
	ignoreRound = /^.*#define\s+round\(\s*a\s*\)\s+floor\s*\(\s*a\s*\+.*\.5\)\s*$/m.test(file) || !/\bround\s*\(/.test(file)
	ignoreTexture = /^.*#define\s+texture\s+flixel_texture2D\b\s*$/m.test(file) || !/\btexture\b/.test(file)

	ignoreTextureThirdArgumentFix = ignoreTexture || /\bvec4\s+flixel_texture2D\s*\(\s*sampler2D\s+[^\s]*\s*,\s*vec2\s+[^\s]*\s*,\s*float\s+[^\s]*\s*\)/.test(file) || [...file.matchAll(/\btexture\s*\(([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*)\)/g)].find(match => { if(funcArgsCount(match[1]) >= 3) return true; }) == null
	// match[0] = texture(iChannel0, vec2(example(example(0.5)), 0.5), 0.0)
	// match[1] = iChannel0, vec2(example(example(0.5)), 0.5), 0.0

	// additional shadertoy variables which is empty to not crash the shader & will be added if it was used it shader
	ignoreITimeDelta = /\buniform\s+float\s+iTimeDelta\b/.test(file) || !/\biTimeDelta\b/.test(file)
	ignoreIFrameRate = /\buniform\s+float\s+iFrameRate\b/.test(file) || !/\biFrameRate\b/.test(file)
	ignoreIFrame = /\buniform\s+int\s+iFrame\b/.test(file) || !/\biFrame\b/.test(file)
	ignoreIMouse = /\buniform\s+vec4\s+iMouse\b/.test(file) || !/\biMouse\b/.test(file)
	ignoreIDate = /\buniform\s+vec4\s+iDate\b/.test(file) || !/\biDate\b/.test(file)
	ignoreIChannelTime = /^.*#define\s+iChannelTime\s+float\s*\[\s*4\s*\]\s*\(.*\)\s*$/m.test(file) || !/\biChannelTime\b/.test(file)
	ignoreIChannelResolution = /^.*#define\s+iChannelResolution\s+vec3\s*\[\s*4\s*\]\s*\(.*\)\s*$/m.test(file) || !/\biChannelResolution\b/.test(file)

	// misc
	ignoreShaderHeaderEnd = /^.*\/\/\s*end\s+of\s+ShadertoyToFlixel\s+header\b\s*$/m.test(file)
	ignoreMain = /\bvoid\s+main\s*\(\s*\)\s*{\s*mainImage\(\s*gl_FragColor\s*,\s*openfl_TextureCoordv\s*\*\s*openfl_TextureSize\s*\)\s*;\s*}/.test(file)

	var shaderHeader = ""

	// adds things in start of file
	if (!ignoreWatermark)
		shaderHeader += "// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel\n"

	if (shaderHeader.length > 0) shaderHeader += "\n"

	if (!ignorePragmaHeader) {
		shaderHeader += "#pragma header\n"
		onlog("Added #pragma header!")
	}

	if (shaderHeader.length > 0) shaderHeader += "\n"

	if (!ignoreIResolution) {
		shaderHeader += "#define iResolution vec3(openfl_TextureSize, 0.)\n"
		onlog("Added iResolution!")
	}
	if (!ignoreITime) {
		shaderHeader += "uniform float iTime;\n"
		onlog("Added iTime!")
	}
	if (!ignoreIChannel0) {
		shaderHeader += "#define iChannel0 bitmap\n"
		onlog("Added iChannel0!")
	}
	if (!ignoreIChannel1) {
		shaderHeader += "uniform sampler2D iChannel1;\n"
		onlog("Added iChannel1!")
	}
	if (!ignoreIChannel2) {
		shaderHeader += "uniform sampler2D iChannel2;\n"
		onlog("Added iChannel2!")
	}
	if (!ignoreIChannel3) {
		shaderHeader += "uniform sampler2D iChannel3;\n"
		onlog("Added iChannel3!")
	}
	if (!ignoreRound) {
		shaderHeader += "#define round(a) floor(a+.5)\n"
		onlog("Added round!")
	}
	if (!ignoreTexture) {
		shaderHeader += "#define texture flixel_texture2D\n"
		onlog("Added texture!")
	}
	if(!ignoreTextureThirdArgumentFix) {
		shaderHeader += `\n${megafix}\n`
		onlog("Added third argument fix!")
	}

	var shaderHeader_emptyVars = ""
	if (!ignoreITimeDelta) {
		shaderHeader_emptyVars += "uniform float iTimeDelta;\n"
		onlog("Added iTimeDelta!")
	}
	if (!ignoreIFrameRate) {
		shaderHeader_emptyVars += "uniform float iFrameRate;\n"
		onlog("Added iFrameRate!")
	}
	if (!ignoreIFrame) {
		shaderHeader_emptyVars += "uniform int iFrame;\n"
		onlog("Added iFrame!")
	}
	if (!ignoreIMouse) {
		shaderHeader_emptyVars += "uniform vec4 iMouse;\n"
		onlog("Added iMouse!")
	}
	if (!ignoreIDate) {
		shaderHeader_emptyVars += "uniform vec4 iDate;\n"
		onlog("Added iDate!")
	}
	if (!ignoreIChannelTime) {
		shaderHeader_emptyVars += "#define iChannelTime float[4](iTime, 0., 0., 0.)\n"
		onlog("Added iChannelTime!")
	}
	if (!ignoreIChannelResolution) {
		shaderHeader_emptyVars += "#define iChannelResolution vec3[4](iResolution, vec3(0.), vec3(0.), vec3(0.))\n"
		onlog("Added iChannelResolution!")
	}
	if (shaderHeader_emptyVars.length > 0) shaderHeader_emptyVars = `\n// variables which are empty, they need just to avoid crashing shader\n` + shaderHeader_emptyVars
	shaderHeader += shaderHeader_emptyVars // concating

	if (!ignoreShaderHeaderEnd) {
		shaderHeader += `\n// end of ShadertoyToFlixel header\n`
		onlog("Added end of shader comment header!")
	}

	if (shaderHeader.length > 0) shaderHeader += "\n"

	file = shaderHeader + file // concating again

	// add footer
	if (!ignoreMain) {
		file += "\n\nvoid main() {\n\tmainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);\n}"
		onlog("Added void main!")
	}

	if (!fixedAlpha) onerror("Can't fix alpha channel! Maybe it already working properly?")

	return file
}