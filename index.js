var coolButtonStart = document.getElementById('coolbuttonstart')
var coolButtonDownload = document.getElementById('coolbuttondownload')
var coolTextArea = document.getElementById('cooltextarea')
var logArea = document.getElementById('logarea')

coolTextArea.placeholder = 'Paste link to shader or move shader code from shadertoy here...\nOr drop text file in this text field...\n\nSupports shaders with only Image tab!\n(can be with Common too, just copy code from Common to Image)'

function log(text, link) {
	var el = document.createElement(link != null ? 'a' : 'h5')
	el.innerText = text
	if (link != null) el.href = link
	el.className = "logentry"
	logArea.appendChild(el)
	logArea.scrollTop = logArea.scrollHeight
	console.log(text + (link != null ? ' ' + link : ''))
	return el
}

function error(text) {
	var el = document.createElement('h5')
	el.innerText = text
	el.className = "logentry"
	el.style.color = '#c10000'
	el.style.backgroundColor = '#2d1414'
	logArea.appendChild(el)
	logArea.scrollTop = logArea.scrollHeight
	console.log('%c' + text, 'color:#c10000')
	return el
}

function clearLogs() {
	// idk it doesnt work with for(let entry of logArea.children)
	while(logArea.childNodes.length > 0)
		logArea.removeChild(logArea.firstChild)
}

log(`Running on ${versionSTF} version`)
log(`Good ${getdaypart()}, user!`)
log(`Click to see guide`, `https://i.imgur.com/LCGvaTd.png`)
log(`I'm happy to announce the shader editor, it will has shader preview and functions from this website :)\nStay tuned, release message will be here!`)


var shadertoyViewLink = "https://www.shadertoy.com/view/"
function checkForLink() {
	if (coolTextArea.value.startsWith(shadertoyViewLink)) {
		var prevCoolTextValue = coolTextArea.value
		var shaderID = coolTextArea.value.substring(shadertoyViewLink.length)
		coolTextArea.value = `Fetching ${shaderID}...`
		log(`Fetching ${shaderID}...`)

		// idk how to properly store api keys sorry
		fetch(`https://www.shadertoy.com/api/v1/shaders/${shaderID}?key=NdHlRm`)
		.then(r => r.json())
		.then(r => {
			for (let tab of r.Shader.renderpass) if (tab.type == "image") {
				coolTextArea.value = tab.code
				log(`Loaded ${tab.code.length} symbols`)
				return
			}
			coolTextArea.value = prevCoolTextValue
			throw `Can't find image`
		})
		.catch(e => {
			coolTextArea.value = prevCoolTextValue
			error(e)
		})
	}
}

coolTextArea.addEventListener('dragover', e => {
	e.stopPropagation()
	e.preventDefault()
	coolTextArea.style.filter = "invert(25%)"
})
coolTextArea.addEventListener('dragleave', e => {
	e.stopPropagation()
	e.preventDefault()
	coolTextArea.style.filter = "invert(0%)"
})
coolTextArea.addEventListener('drop', e => {
	e.stopPropagation()
	e.preventDefault()
	console.log()
	coolTextArea.style.filter = "invert(0%)"

	var files = e.dataTransfer.files
	if (files.length > 0) {
		log(`Getting data from "${files[0].name}"...`)
		var fr = new FileReader()
		fr.onload = function() {
			coolTextArea.value = fr.result
			checkForLink()
			log(`Loaded ${fr.result.length} symbols`)
		}
		fr.readAsText(files[0])
		return
	}
	log(`Getting data from dragged text...`)
	coolTextArea.value = e.dataTransfer.getData("text")
	checkForLink()
	log(`Loaded ${coolTextArea.value.length} symbols`)
})
coolTextArea.addEventListener('input', e => checkForLink())

coolButtonStart.onclick = function() {
	coolButtonStart.setAttribute('disabled', '')
	coolButtonStart.value = 'Converting...'
	log("Converting started!")

	coolTextArea.value = doThing(coolTextArea.value, log, error)
	coolButtonStart.value = 'Successfully converted!'
	log("Successfully converted!")
	coolTextArea.scrollTop = coolTextArea.scrollHeight

	setTimeout(() => {
		coolButtonStart.removeAttribute('disabled')
		coolButtonStart.value = 'Start converting'
	}, 2000)
}

coolButtonDownload.onclick = function() {
	download(coolTextArea.value, 'shader.frag', 'text/plain')
	log("Successfully saved!")
}

function getdaypart() {
	var hours = new Date().getHours()
	if (hours >= 18)
		return 'evening'
	else if (hours >= 6)
		return 'morning'
	else if (hours >= 11)
		return 'day'
	return 'night'
}

function download(content, filename, contentType) {
	if(!contentType) contentType = 'application/octet-stream'
	var url = window.URL.createObjectURL(new Blob([content], {'type':contentType}))
	var a = document.createElement('a')
	a.style.setProperty("display", "none")
	document.body.appendChild(a)
	a.href = url
	a.download = filename
	a.click()
	window.URL.revokeObjectURL(url)
	a.remove()
}