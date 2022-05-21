const { ipcRenderer } = require("electron");

let logs = window.localStorage.getItem("logger") || "";
document.getElementById("logger").innerHTML = logs;

(async () => {
	const isOn = await ipcRenderer.invoke("isOn");

	document.getElementById("running").innerText = isOn == true ? "Running" : "Not Running";
	document.getElementById("running").style.color = isOn == true ? "lime" : "red";
})();

let botInfo = {};
let nodes = [];
let localHost = false;
let hosting = JSON.parse(window.localStorage.getItem("isHosted")) || false;
function resetLog() {
	let logsDiv = document.getElementById("logger");
	if (logsDiv.textContent) {
		logsDiv.textContent = "";
		DBT.notification({
			title: "Console was cleared!",
			body: "The console has successfully been reset!"
		});
		DBT.toast({ message: "Console has successfully been cleared." });
	}
}
(async () => {
	const data = await ipcRenderer.invoke("selected");

	if (!data?.name) {
		window.location.href = "choose-bot.html";
	}

	const namesToChange = [...document.getElementsByClassName("display-bot-name")];

	const config = require(data.path + "/data/config.json");
	botInfo = config;

	const nodesData = require(data.path + "/data/nodes.json");
	nodes = nodesData;

	namesToChange.forEach((x) => {
		x.innerHTML = data.name;
	});

	if (!hosting) {
		hosting = false;
		window.localStorage.setItem("isHosted", "false");

		document.getElementById("running").innerText = "Not Running";
		document.getElementById("running").style.color = "red";
	} else {
		hosting = true;
		window.localStorage.setItem("isHosted", "true");

		document.getElementById("running").innerText = "Running";
		document.getElementById("running").style.color = "lime";
	}
})();

function runBot() {
	if (hosting) return new Error("ERROR: The bot is being hosted 24/7!");

	ipcRenderer.invoke("runbot");
	document.getElementById("running").innerText = "Running";
	document.getElementById("running").style.color = "lime";
	document.getElementById("logger").innerHTML = "";
	console.log("Removed?");
	window.localStorage.removeItem("logger");
	data = "";

	localHost = true;
}

function stopBot() {
	if (hosting) return new Error("ERROR: The bot is being hosted 24/7!");

	ipcRenderer.invoke("stopbot");
	document.getElementById("running").innerText = "Not Running";
	document.getElementById("running").style.color = "red";

	localHost = false;
}

async function hostBot() {
	if (localHost) return new Error("ERROR: The bot is being hosted locally!");
	if (hosting) return new Error("ERROR: The bot is already hosted!");

	document.getElementById("logger").innerHTML = "";

	const fetched = await fetch("https://DBT-Server.kokistudio.repl.co/host-bot", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token: botInfo.token,
			id: botInfo.id,
			nodes,
			prefix: botInfo.prefix
		})
	});

	const jsonData = await fetched.json();
	if (jsonData?.expired) {
		hosting = false;
		window.localStorage.setItem("isHosted", "false");

		document.getElementById("running").innerText = "Not Running";
		document.getElementById("running").style.color = "red";

		new Error("ERROR: You are on a hosting cooldown!");
	} else {
		hosting = true;
		window.localStorage.setItem("isHosted", "true");

		document.getElementById("running").innerText = "Running";
		document.getElementById("running").style.color = "lime";
	}
}

async function getHostLogs() {
	fetch("https://DBT-Server.kokistudio.repl.co/get-logs", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token: botInfo.token,
			id: botInfo.id
		})
	})
		.then((res) => res.json())
		.then((logs) => {
			if (logs) {
				let toAdd = "";
				logs.forEach((text) => {
					const log = document.createElement("p");

					if (text.died) {
						new Error("ERROR: Your bot ran into an error while hosted. It has been stopped.");
						DBT.notification({
							title: "Hosting ran into an issue!",
							body: "The hosting ran into an issue!"
						});
						document.getElementById("running").innerText = "Not Running";
						document.getElementById("running").style.color = "lime";
						hosting = false;
						window.localStorage.setItem("isHosted", "false");
					}

					if (text.expired) {
						DBT.notification({
							title: "Hosting Expired!",
							body: "Your 24/7 hosting has expired! please wait an hour before you can host again!"
						});
					}

					if (text.error) {
						log.innerHTML = `<p><span style="color: red">[HOST_ERROR] -</span> ${text.msg}</p>`;
					} else {
						log.innerHTML = `<p><span style="color: #2ffa58">[HOST_CONSOLE] -</span> ${text.msg}</p>`;
					}
					toAdd += log.innerHTML;
					window.localStorage.setItem("logger", toAdd);
				});

				document.getElementById("logger").innerHTML = toAdd;
			}
		});
}

function stopHosting() {
	if (localHost) return new Error("ERROR: The bot is being hosted locally!");
	fetch("https://DBT-Server.kokistudio.repl.co/stop-bot", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token: botInfo.token,
			id: botInfo.id
		})
	});

	document.getElementById("running").innerText = "Not Running";
	document.getElementById("running").style.color = "red";

	hosting = false;
	window.localStorage.setItem("isHosted", "false");
}

var hostInterval;
setInterval(() => {
	if (hosting) {
		hostInterval = setInterval(getHostLogs, 3000);
	} else {
		clearInterval(hostInterval);
	}
}, 100);

ipcRenderer.on("log", (e, text) => {
	const log = document.createElement("p");
	log.innerHTML = `<span style="color: rgb(123, 108, 255)">[CONSOLE] -</span> ${text}`;

	document.getElementById("logger").appendChild(log);
	logs += `<p><span style="color: rgb(123, 108, 255)">[CONSOLE] -</span> ${text}</p>`;
	window.localStorage.setItem("logger", logs);
});

ipcRenderer.on("err", (e, text) => {
	const log = document.createElement("p");
	log.innerHTML = `<p><span style="color: red">[ERROR] -</span> ${text}`;

	logs += `<p><span style="color: red">[ERROR] -</span> ${text}</p>`;
	document.getElementById("logger").appendChild(log);
	window.localStorage.setItem("logger", logs);
});

ipcRenderer.on("exit", (e) => {
	document.getElementById("running").innerText = "Not Running";
	document.getElementById("running").style.color = "red";
});
