const { ipcRenderer } = require("electron");
const fs = require("fs-extra");
let prefix = document.getElementById("prefix");
let token = document.getElementById("token");
let id_ = document.getElementById("bot_id");
const SAVE_CHANGES = document.getElementById("saveChanges");
let botData;

function validate(ele) {
	let element = document.getElementById(ele);
	if (!element.value || element.value === "" || element.value.startsWith(` `)) {
		element.classList.toggle("unvalidated", true);
		element.classList.toggle("validated", false);
		SAVE_CHANGES.setAttribute("disabled", true);
		SAVE_CHANGES.style.backgroundColor = "#ff2e2e";
	} else if (element.value != ` ` && element.value != undefined) {
		element.classList.toggle("unvalidated", false);
		element.classList.toggle("validated", true);
	}
	console.log(`"${id_.style.borderColor}"`);
	if (id_.classList.contains("validated") && token.classList.contains("validated") && prefix.classList.contains("validated")) {
		SAVE_CHANGES.style.backgroundColor = "#46d11f";
		SAVE_CHANGES.removeAttribute(`disabled`);
	}
}
(async () => {
	let selectedBot = await ipcRenderer.invoke("selected");
	if (!selectedBot.path) window.location.href = "choose-bot.html";

	const configFile = require(`${selectedBot.path}/data/config.json`);
})();
SAVE_CHANGES.addEventListener("click", async (e) => {
	const selectedBot = await ipcRenderer.invoke("selected");
	const configFile = require(`${selectedBot.path}/data/config.json`);
	console.log(configFile);
	configFile.prefix = prefix.value;
	configFile.token = token.value;
	configFile.id = id.value;
	console.log("starting");
	fs.writeFileSync(`${selectedBot.path}/data/config.json`, JSON.stringify(configFile), (err) => {
		if (err) throw err;
		window.location.href = "index.html";
	});
});

function showToken(btn) {
	switch (token.type) {
		case "text":
			token.type = "password";
			btn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Show`;
			break;
		case "password":
			token.type = "text";
			btn.innerHTML = `<i class="fa-solid fa-eye"></i> Hide`;
			break;
	}
}
