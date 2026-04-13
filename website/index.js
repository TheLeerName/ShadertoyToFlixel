var coolButtonStart = document.getElementById('coolbuttonstart')
var coolButtonDownload = document.getElementById('coolbuttondownload')
var coolTextArea = document.getElementById('cooltextarea')
var logArea = document.getElementById('logarea')

coolTextArea.placeholder = 'Here what you can do:\n\n- Drop text file here\n\n- Paste shader code from shadertoy shader Image tab here (can be with Common too, just add code to start)\n\n- Paste link here with shader code (can be shadertoy shader webpage link)'

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

log(`Running on ${STF.version} version`)
log(`Good ${getdaypart()}, user!`)
log(`Click to see guide`, `https://i.imgur.com/LCGvaTd.png`)

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
			log(`Loaded ${fr.result.length} symbols`)
		}
		fr.readAsText(files[0])
		return
	}
	log(`Getting data from dragged text...`)
	coolTextArea.value = e.dataTransfer.getData("text")
	log(`Loaded ${coolTextArea.value.length} symbols`)
})

coolButtonStart.onclick = function() {
	coolButtonStart.setAttribute('disabled', '')
	coolButtonStart.value = 'Converting...'
	log("Converting started!")

	coolTextArea.value = STF.convert(coolTextArea.value, log, error)
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
