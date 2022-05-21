const { ipcRenderer } = require("electron");
const fs = require("fs-extra");
const folderPath = document.getElementById("folderPath");
const botName = document.getElementById("bot-name");
const bots = document.getElementById("bots");
const createBot2 = document.getElementById("createBot2");
let path;
let validDir;
let data;

async function getData() {
	const _data = await ipcRenderer.invoke("get-bots");
	data = _data || [];

	for (const bot of data) {
		if (data.findIndex((b) => b.name == bot.name) == 0) {
			bots.innerHTML += `<option value="${bot.name}">${bot.name}</option>`;
		} else {
			bots.innerHTML += `<option value="${bot.name}">${bot.name}</option>`;
		}
	}
}
getData();

(async () => {
	const botData = await ipcRenderer.invoke("selected");
	let options = [...bots.getElementsByTagName("option")];

	const i = options.findIndex((x) => x.value === botData.name);

	if (i != -1) {
		options[i].selected = "selected";
	}
})();

async function chooseDir() {
	const _path = await ipcRenderer.invoke("getFolder");
	path = _path;

	document.getElementById("folder-path").style.display = "block";
	if (path.startsWith(undefined || null || NaN)) {
		folderPath.innerText = "You must provide a valid directory";
		folderPath.classList.toggle("folderpath-error", true);
	}
	folderPath.innerText = _path;
	folderPath.classList.toggle("folderpath-error", false);
	validDir = true;
}

function createBot() {
	if (!validDir) {
		ipcRenderer.invoke("error", "ERROR: A valid directory is required");
		return;
	}

	if (botName.value <= 0) {
		ipcRenderer.invoke("error", "ERROR: Bot name is required!");
		return;
	}
	console.log(botName.value.replace(`/`, `\\`));
	ipcRenderer.invoke("create-bot", botName.value.replace(`/`, `\\`), path);
	window.location.href = "index.html";
}

function deleteBot() {
	ipcRenderer.invoke("delete");
	window.location.reload();
}

bots.addEventListener("change", (e) => {
	ipcRenderer.invoke("select", e.target.value);
});
