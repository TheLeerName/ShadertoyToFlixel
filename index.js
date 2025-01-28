var coolButtonStart = document.getElementById('coolbuttonstart');
var coolButtonDownload = document.getElementById('coolbuttondownload');
var coolTextArea = document.getElementById('cooltextarea');
var coolInputFile = document.getElementById('coolinputfile');
var logArea = document.getElementById('logarea');

coolTextArea.placeholder = 'Paste shader code from shadertoy here...\nOr upload text file above\n\nSupports shaders with only Image tab!\n(can be with Common too, just copy code from Common to Image)';

function log(text, link) {
	var el = document.createElement(link != null ? 'a' : 'h5');
	el.innerText = text;
	if (link != null) el.href = link;
	el.className = "logentry";
	logArea.appendChild(el);
	logArea.scrollTop = logArea.scrollHeight;
	console.log(text + (link != null ? ' ' + link : ''));
	return el;
}

function error(text) {
	var el = document.createElement('h5');
	el.innerText = text;
	el.className = "logentry";
	el.style.color = '#c10000';
	el.style.backgroundColor = '#2d1414';
	logArea.appendChild(el);
	logArea.scrollTop = logArea.scrollHeight;
	console.log('%c' + text, 'color:#c10000');
	return el;
}

function clearLogs() {
	// idk it doesnt work with for(let entry of logArea.children)
	while(logArea.childNodes.length > 0)
		logArea.removeChild(logArea.firstChild);
}

log(`Good ${getdaypart()}, user!`);
log(`Click to see guide`, `https://i.imgur.com/LCGvaTd.png`);
log(`I'm happy to announce the shader editor, it will has shader preview and functions from this website :)\nStay tuned, release message will be here!`);

coolInputFile.onchange = function() {
	log("Getting data from " + this.files[0].name + "...")
	var fr = new FileReader();
	fr.onload = function() {
		coolTextArea.value = fr.result;
	}
	fr.readAsText(this.files[0]);
}

coolButtonStart.onclick = function() {
	coolButtonStart.setAttribute('disabled', '');
	coolButtonStart.value = 'Converting...';
	log("Converting started!");

	coolTextArea.value = doThing(coolTextArea.value, log, error);
	coolButtonStart.value = 'Successfully converted!';
	log("Successfully converted!");
	coolTextArea.scrollTop = coolTextArea.scrollHeight;

	setTimeout(() => {
		coolButtonStart.removeAttribute('disabled');
		coolButtonStart.value = 'Start converting';
	}, 2000);
}

coolButtonDownload.onclick = function() {
	download(coolTextArea.value, 'shader.frag', 'text/plain');
	log("Successfully saved!");
}

function getdaypart() {
	var hours = new Date().getHours();
	if (hours >= 18)
		return 'evening';
	else if (hours >= 6)
		return 'morning';
	else if (hours >= 11)
		return 'day';
	return 'night';
}

function download(content, filename, contentType) {
	if(!contentType) contentType = 'application/octet-stream';
	var url = window.URL.createObjectURL(new Blob([content], {'type':contentType}));
	var a = document.createElement('a');
	a.style.setProperty("display", "none");
	document.body.appendChild(a);
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
	a.remove();
}