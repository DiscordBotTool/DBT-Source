const { ipcRenderer, ipcMain, ele } = require("electron");
const fse = require("fs-extra");
const fs = require("fs");

var alreadySelectedNode = [];
var selectedBot = {};
var rightClickedNode = null;
var toCopyNode = [];
var currentNode = null;
var insertTo = null;
var currentFormOpened = null;
var currentGroup = null;

var events;

var pos = {};
var tempNodes = [];

var commands;
var GetKeys = {};
function navbutClicked(identifier) {
	const div = document.getElementById(identifier);
	if (div.style.display == "block") {
		div.style.opacity = 0;
		div.style.display = "none";
	} else if (div.style.display == "none") {
		div.style.display = "block";
		div.style.opacity = 1;
	} else {
	}
}
const arr = [];
for (i = 0; i < arr.size; i++) {
	arr.filter((key) => {
		return arr[key.value].includes("${dbt.}");
	});
}
window.onkeydown = (e) => {
	GetKeys[e.key] = true;

	if (currentFormOpened) return;
	if (document.querySelector("#GetRawData").style.display === "block" || document.querySelector("#InsertRawData").style.display === "block") return;

	if (events) return;

	if (GetKeys["Delete"]) {
		deleteNode();
		delete GetKeys["Delete"];
	}

	if (GetKeys["Control"] && GetKeys["c"]) {
		copyNode();

		delete GetKeys["c"];
	}

	if (GetKeys["Control"] && GetKeys["v"]) {
		pasteNode();

		delete GetKeys["v"];
	}
	if (GetKeys["Control"] && GetKeys["f"]) {
		openFindMenu();
	}
};

window.onkeyup = (e) => {
	delete GetKeys[e.key];
};

let func_types = {
	Message: [],
	Variables: [],
	"User Data": [],
	Array: [],
	// Music: [],
	"User Action": [],
	"Bot Action": [],
	"Server Action": [],
	Channel: [],
	Threads: [],
	Reactions: [],
	"Message Rows": [],
	Control: [],
	Console: [],
	Asynchronous: [],
	"API Request": [],
	Mods: [],
	Function: []
};

let functions;
let mods;

const eventTypes = [];
(async () => {
	const botData = await ipcRenderer.invoke("selected");

	if (!botData.path) window.location.href = "choose-bot.html";
	selectedBot = botData;
	// changeRPC(`Editing ${botData.name}`, "https://i.imgur.com/ZbeAYUQ.png")
	const bot = require(`${selectedBot.path}/data/config.json`);

	functions = fse.readdirSync(`${selectedBot.path}/functions`).filter((x) => x.endsWith(".js"));
	mods = fse.readdirSync(`${selectedBot.path}/mods`).filter((x) => x.endsWith(".js"));

	for (const mod of mods) {
		functions.push(mod);
	}

	for (const func of functions) {
		let data;

		try {
			data = require(`${selectedBot.path}/functions/${func}`);
		} catch (e) {
			console.error(e);
			data = require(`${selectedBot.path}/mods/${func}`);
		}

		if (data.category == "Event") {
			eventTypes.push(data.name);
		} else {
			func_types[data.category].push(data.name);
		}

		const toAppend = document.createElement("div");
		toAppend.setAttribute("style", "display: none");
		toAppend.setAttribute("class", "response-box");
		toAppend.setAttribute("id", `${data.name} Response`);
		toAppend.innerHTML = `
        <form id="${data.name} Form">
                <h1><i class="fa-solid fa-comment-dots"></i> ${data.name}</h1>
                <hr style="margin-top: 10px;" />
                ${data.html('<button type="button" var-btn><i class="fa-solid fa-flask-round-potion"></i> Insert Variable</button>')}
                <hr style="margin-top: 30px; float: left;" />
                <div class="button-holder">
                    <button type="submit">Save</button>
                </div>
            </form>
            `;

		document.getElementById("responses").appendChild(toAppend);
		const form = document.getElementById(`${data.name} Form`);
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			for (const elem of e.target.elements) {
				if (elem.name.length > 0) {
					new SaveVariable(currentNode, elem.name, elem.value);
				}
			}

			closeResponse(`${data.name} Response`);
		});
	}

	for (const type of eventTypes) {
		const option = new Option(type, type);
		document.getElementById("event-types").appendChild(option);
	}

	for (const type of func_types.Message) {
		const option = new Option(type, type);
		document.getElementById("types").appendChild(option);
	}

	document.querySelectorAll("*[var-btn]").forEach((elem) => {
		elem.addEventListener("click", (e) => {
			const sibling = e.target.previousElementSibling;
			insertTo = sibling;

			openForm(`insert-variables`);
		});
	});
})();

function closeResponse(id) {
	const element = document.getElementById(id);

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
	currentFormOpened = null;
}

function openResponse(id, node, apply) {
	const element = document.getElementById(id);
	currentFormOpened = element;
	const idS = id.split(" ");
	idS.pop();

	element.style.display = "block";
	document.querySelector(".cover").style.display = "block";

	element.style.animationName = "responsesIn";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	const form = document.getElementById(`${idS.join(" ")} Form`);

	for (const elem of form.elements) {
		const variables = new Variables(node);
		if (variables[elem.name]) {
			if (apply) elem.value = variables[elem.name];
		} else {
			if (apply) elem.value = "";
		}

		if (id === "Command Response") {
			const Node = commands.find((cmd) => cmd.name === node);

			if (apply && elem.name === "commandName") elem.value = Node.command;
			try {
				if (apply && elem.name === "commandAliases") elem.value = Node.aliases.join(", ");
			} catch (e) {
				if (apply && elem.name === "commandAliases") elem.value = Node.aliases ?? "";
			}
		}

		if (id === "Slash Response") {
			const Node = commands.find((cmd) => cmd.name === node);

			if (apply && elem.name === "commandName") elem.value = Node.name;
			try {
				if (apply && elem.name === "args") elem.value = Node.aliases.join(", ");
			} catch (e) {
				if (apply && elem.name === "commandAliases") elem.value = Node.aliases ?? "";
			}
		}
	}

	setEvents(true);
	currentNode = node;
}

document.addEventListener("contextmenu", (e) => {
	if (e.target.closest(".NodeContainer")) {
		document.querySelector("[menu-node]").style.top = `${e.pageY + 10}px`;
		document.querySelector("[menu-node]").style.left = `${e.pageX + 10}px`;
		pos.x = e.pageX + 10;
		pos.y = e.pageY + 10;

		document.querySelector("[menu-node]").style.display = "block";
		document.querySelector("[menu]").style.display = "none";
		document.querySelector("[menu-group]").style.display = "none";

		rightClickedNode = e.target.closest(".NodeContainer");
	} else {
		document.querySelector("[menu]").style.top = `${e.pageY + 10}px`;
		document.querySelector("[menu]").style.left = `${e.pageX + 10}px`;
		pos.x = e.pageX + 10;
		pos.y = e.pageY + 10;
		document.querySelector("[menu]").style.display = "block";
		document.querySelector("[menu-node]").style.display = "none";
		document.querySelector("[menu-group]").style.display = "none";
	}
});

document.addEventListener("click", (e) => {
	if (document.querySelector("[menu]").style.display == "block") {
		document.querySelector("[menu]").style.display = "none";
	}

	if (document.querySelector("[menu-node]").style.display == "block") {
		document.querySelector("[menu-node]").style.display = "none";
	}
});

function openResponses() {
	document.querySelector("#new-response").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-response").style.animationName = "responsesIn";
	document.querySelector("#new-response").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function openCommands() {
	document.querySelector("#new-command").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-command").style.animationName = "responsesIn";
	document.querySelector("#new-command").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function openSlashCommands() {
	document.querySelector("#new-slash").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-slash").style.animationName = "responsesIn";
	document.querySelector("#new-slash").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function openEvents() {
	document.querySelector("#new-event").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-event").style.animationName = "responsesIn";
	document.querySelector("#new-event").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function openGroup() {
	document.querySelector("#new-group").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-group").style.animationName = "responsesIn";
	document.querySelector("#new-group").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function openGroupMenu(e) {
	if (document.querySelector("[menu-group]").style.display === "none") {
		document.querySelector("[menu-group]").style.top = `${e.pagex + 10}px`;

		const menuGroup = document.querySelector("[menu-group]");
		menuGroup.style.left = `${e.pageX + 10}px`;
		menuGroup.style.top = `${e.pageY + 10}px`;

		pos.x = e.pageX + 10;
		pos.y = e.pageY + 10;

		document.querySelector("[menu-group]").style.display = "block";

		currentGroup = e.target.closest(".group-menu").parentElement;
	} else {
		document.querySelector("[menu-group]").style.top = `${e.pagex + 10}px`;

		const menuGroup = document.querySelector("[menu-group]");
		menuGroup.style.left = `${e.pageX + 10}px`;
		menuGroup.style.top = `${e.pageY + 10}px`;

		pos.x = e.pageX + 10;
		pos.y = e.pageY + 10;

		document.querySelector("[menu-group]").style.display = "none";

		currentGroup = e.target.closest(".group-menu").parentElement;
	}
}

document.addEventListener("click", (e) => {
	if (document.querySelector("[menu-group]").readyToOff) {
		document.querySelector("[menu-group]").style.display = "none";
		document.querySelector("[menu-group]").readyToOff = false;
	}
	if (document.querySelector("[menu-group]").style.display == "block") {
		document.querySelector("[menu-group]").readyToOff = true;
	}
});

// function OpenForm(id) {
//     document.querySelector("#" + id).style.display = "block";
//     document.querySelector(".cover").style.display = "block";

//     document.querySelector("#" + id).style.animationName = "responsesIn";
//     document.querySelector("#" + id).style.animationDuration = "0.5s";

//     document.querySelector(".cover").style.animationName = "fadeIn";
//     document.querySelector(".cover").style.animationDuration = "0.5s";

//     setEvents(true);
// }

// function CloseForm() {
//     const element = document.querySelector("#new-note");

//     element.style.animationName = "responsesOut";
//     element.style.animationDuration = "0.5s";

//     document.querySelector(".cover").style.animationName = "fadeOut";
//     document.querySelector(".cover").style.animationDuration = "0.5s";

//     setTimeout(() => {
//         element.style.display = "none";
//         document.querySelector(".cover").style.display = "none";
//     }, 450);

//     setEvents(false);
// }

function openEdit(isGroup) {
	if (isGroup) {
		document.querySelector("#edit-group").style.display = "block";
		document.querySelector(".cover").style.display = "block";

		document.querySelector("#edit-group").style.animationName = "responsesIn";
		document.querySelector("#edit-group").style.animationDuration = "0.5s";

		document.querySelector(".cover").style.animationName = "fadeIn";
		document.querySelector(".cover").style.animationDuration = "0.5s";
	} else {
		document.querySelector("#edit-node").style.display = "block";
		document.querySelector(".cover").style.display = "block";

		document.querySelector("#edit-node").style.animationName = "responsesIn";
		document.querySelector("#edit-node").style.animationDuration = "0.5s";

		document.querySelector(".cover").style.animationName = "fadeIn";
		document.querySelector(".cover").style.animationDuration = "0.5s";
	}

	setEvents(true);
}

function openNote() {
	document.querySelector("#new-note").style.display = "block";
	document.querySelector(".cover").style.display = "block";

	document.querySelector("#new-note").style.animationName = "responsesIn";
	document.querySelector("#new-note").style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeIn";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setEvents(true);
}

function closeNote() {
	const element = document.querySelector("#new-note");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function closeEdit(isGroup) {
	if (isGroup) {
		const element = document.querySelector("#edit-group");

		element.style.animationName = "responsesOut";
		element.style.animationDuration = "0.5s";

		document.querySelector(".cover").style.animationName = "fadeOut";
		document.querySelector(".cover").style.animationDuration = "0.5s";

		setTimeout(() => {
			element.style.display = "none";
			document.querySelector(".cover").style.display = "none";
		}, 450);

		setEvents(false);
	} else {
		const element = document.querySelector("#edit-node");

		element.style.animationName = "responsesOut";
		element.style.animationDuration = "0.5s";

		document.querySelector(".cover").style.animationName = "fadeOut";
		document.querySelector(".cover").style.animationDuration = "0.5s";

		setTimeout(() => {
			element.style.display = "none";
			document.querySelector(".cover").style.display = "none";
		}, 450);

		setEvents(false);
	}
}

function closeRep() {
	const element = document.querySelector("#new-response");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function closeNewCmd() {
	const element = document.querySelector("#new-command");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function closeSlashCommands() {
	const element = document.querySelector("#new-slash");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function closeEvent() {
	const element = document.querySelector("#new-event");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function closeVars() {
	const element = document.querySelector("#insert-variables");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		openResponse(currentFormOpened.id, currentNode, false);
	}, 450);

	setEvents(false);
}

function closeGroup() {
	const element = document.querySelector("#new-group");

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function insertVar(elem) {
	const variable = elem.previousElementSibling.previousElementSibling.innerText;
	insertTo.value += variable;
	closeVars();
}

let SideOpenable = true;
function openSide(id) {
	const element = document.getElementById(id);

	if (element.style.display == "block" && SideOpenable == false) {
		element.style.animationName = "sideClose";
		element.style.animationDuration = "0.5s";

		setTimeout(() => {
			element.style.display = "none";
			SideOpenable = true;
		}, 450);
	} else if (SideOpenable == true) {
		element.style.display = "block";
		element.style.animationName = "sideOpen";
		element.style.animationDuration = "0.5s";

		setTimeout(() => {
			SideOpenable = false;
		}, 450);
	}
}

function deleteNode() {
	alreadySelectedNode.forEach((node) => {
		const index = commands.findIndex((x) => x.name === node.id);
		if (index < 0) return new Error(`Cannot delete node "${node.id}" because it cannot be found`);

		commands.splice(index, 1);
	});

	fs.writeJsonSync(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
	});

	window.location.reload(true);
}

function deleteGroup(el) {
	if (!currentGroup) return;
	currentGroup.remove();

	_nodes.splice(
		_nodes.findIndex((x) => x.name === currentGroup.id),
		1
	);

	fs.writeJsonSync(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
	});

	window.location.reload(true);
}

function copyNode() {
	alreadySelectedNode.forEach((node) => {
		const toCopy = commands.find((x) => x.name === node.id);
		const filteredData = commands.filter((x) => x.name.startsWith(toCopy.name));

		if (!toCopy) return new Error(`Cannot copy node "${node.id}" because it cannot be found`);

		const connectionsToCopy = {};

		for (const key of Object.keys(toCopy.connections)) {
			connectionsToCopy[key] = [];
		}

		let toDupe = {
			name: toCopy.name,
			inputs: toCopy.inputs,
			outputs: toCopy.outputs,
			connections: connectionsToCopy,
			category: toCopy.category,
			type: toCopy.type,
			variables: toCopy.variables,
			x: mouseX,
			y: mouseY
		};

		if (toCopy.command) {
			toDupe.command = toCopy.command;
		}

		toDupe.name = `${toDupe.name} (${filteredData.length})`;
		toCopyNode.push(toDupe);
	});
}

function pasteNode() {
	if (!toCopyNode) return;

	console.log(toCopyNode);
	toCopyNode.forEach((node) => {
		commands.push(node);
	});

	fs.writeJsonSync(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
	});

	window.location.reload(true);
}

const types = {
	Message: `<i class="fa fa-commenting" aria-hidden="true"></i>`,
	Variables: `<i class="fa-solid fa-flask-round-potion"></i>`,
	"User Data": `<i class="fa-solid fa-database"></i>`,
	Music: `<i class="fa-solid fa-compact-disc"></i>`,
	"User Action": `<i class="fa-solid fa-user"></i>`,
	"Bot Action": `<i class="fa-solid fa-robot"></i>`,
	"Server Action": `<i class="fa-solid fa-server"></i>`,
	Channel: `<i class="fa-solid fa-hashtag"></i>`,
	Threads: `<i class="fa-solid fa-hashtag"></i>`,
	Reactions: `<i class="fa-solid fa-face-awesome"></i>`,
	"Message Rows": `<i class="fa-solid fa-table-rows"></i>`,
	Control: `<i class="fa-solid fa-arrows-up-down-left-right"></i>`,
	"API Request": `<i class="fa-solid fa-code-pull-request"></i>`,
	Asynchronous: `<i class="fa-solid fa-rotate"></i>`,
	Mods: `<i class="fa-solid fa-screwdriver-wrench"></i>`,
	Command: `<i class="fa-solid fa-command"></i>`,
	Console: `<i class="fa-solid fa-terminal"></i>`,
	Event: `<i class="fa-solid fa-flag-pennant"></i>`,
	Function: `<i class="fa-solid fa-atom"></i>`,
	Array: `<i class="fa-solid fa-list-tree"></i>`,
	Slash: `<i class="fa-solid fa-slash-forward"></i>`
};

const responseForm = document.getElementById("responseForm");
document.getElementById("responseForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.responseName.value);

	if (index > -1) return new Error(`Node "${e.target.responseName.value}" already exists!`);

	const node = new NEditor.Node(`${types[e.target.responseCategory.value]} | ${e.target.responseName.value}`, e.target.responseName.value, e.target.responseCategory.value, e.target.responseType.value);
	tempNodes.push(node);

	node.setPosition(pos.x || 150, pos.y - 10 || 150);

	if (e.target.responseType.value != "Function") {
		node.addInput("Trigger");
	}

	for (const modFile of functions) {
		const mod = require(`${selectedBot.path}/functions/${modFile}`) || require(`${selectedBot.path}/mods/${modFile}`);

		if (!mod.outputs) continue;

		for (const output of mod.outputs) {
			if (mod.name === e.target.responseType.value) {
				node.addOutput(output);
			}
		}
	}

	let inputs = [];
	let outputs = [];

	for (const input of node.Inputs) {
		inputs.push(input.name);
	}

	for (const output of node.Outputs) {
		outputs.push(output.name);
	}

	new SaveNode(e.target.responseName.value, e.target.responseType.value, e.target.responseCategory.value, inputs, outputs);
	new SavePos(e.target.responseName.value, pos.x, pos.y);

	closeRep();
	setEvents(false);
});

const newCommandForm = document.getElementById("newCommandForm");

newCommandForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.commandName.value);

	if (index > -1) return new Error(`Command "${e.target.commandName.value}" already exists!`);

	const node = new NEditor.Node(`${types.Command} | ${e.target.commandName.value}`, e.target.commandName.value, "Command", "Command");

	node.setPosition(pos.x || 150, pos.y - 10 || 150);

	let output = node.addOutput("Responses");
	new SaveNode(e.target.commandName.value, "Command", "Command", [], [output.name], e.target.commandAliases.value);
	new SavePos(e.target.commandName.value, pos.x, pos.y);

	closeNewCmd();
	setEvents(false);
});

document.getElementById("Command Response").addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.commandName.value);

	if (index > -1) return new Error(`Command "${e.target.commandName.value}" already exists!`);

	new SaveCommand(currentNode, e.target.commandName.value, e.target.commandAliases.value);
	new SavePos(currentNode, pos.x, pos.y);

	closeResponse("Command Response");
	setEvents(false);

	setTimeout(() => {
		window.location.reload(true);
	}, 450);
});

document.getElementById("Slash Response").addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.commandName.value);

	if (index > -1) return new Error(`Command "${e.target.commandName.value}" already exists!`);

	const args = e.target.args.value.toLowerCase().split(",");
	const types = e.target.types.value.toUpperCase().split(",");

	for (let i = 0; i < args.length; i++) {
		args[i] = args[i].trimStart();
	}

	new SaveCommand(currentNode, e.target.commandName.value, args.join(", "));
	new SavePos(currentNode, pos.x, pos.y);

	for (const elem of e.target.elements) {
		if (elem.name.length > 0) {
			new SaveVariable(e.target.commandName.value, elem.name, elem.value);
		}
	}

	closeResponse("Slash Response");
	setEvents(false);

	setTimeout(() => {
		window.location.reload(true);
	}, 450);
});

document.getElementById("newSlashForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.commandName.value);

	if (index > -1) return new Error(`Command "${e.target.commandName.value}" already exists!`);

	const args = e.target.args.value.toLowerCase().split(",");
	const types = e.target.types.value.toUpperCase().split(",");

	for (let i = 0; i < args.length; i++) {
		args[i] = args[i].trimStart();
	}

	const node = new NEditor.Node(`<i class="fa-solid fa-slash-forward"></i> | ${e.target.commandName.value}`, e.target.commandName.value, "Slash", "Slash");

	node.setPosition(pos.x || 150, pos.y - 10 || 150);

	let output = node.addOutput("Responses");
	new SaveNode(e.target.commandName.value, "Slash", "Slash", [], [output.name], args.join(", "));
	new SavePos(e.target.commandName.value, pos.x, pos.y);

	closeSlashCommands();
	setEvents(false);

	setTimeout(() => {
		window.location.reload(true);
	}, 450);
});

const newEventForm = document.getElementById("newEventForm");
newEventForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const index = nodes.findIndex((x) => x == e.target.name.value);

	if (index > -1) return new Error(`Event "${e.target.name.value}" already exists!`);

	const node = new NEditor.Node(`${types.Event} | ${e.target.name.value}`, e.target.name.value, "Event", e.target.responseType.value);

	node.setPosition(pos.x || 150, pos.y - 10 || 150);

	let output = node.addOutput("Responses");
	new SaveNode(e.target.name.value, e.target.responseType.value, "Event", [], [output.name]);
	new SavePos(e.target.name.value, pos.x, pos.y);

	closeEvent();
	setEvents(false);
});

const category = document.getElementById("category");

for (const type of Object.keys(func_types)) {
	const option = new Option(type, type);
	category.appendChild(option);
}

function changeTypes(e) {
	document.getElementById("types").innerHTML = "";

	if (!func_types[e.value]) return;

	for (const type of func_types[e.value]) {
		const option = new Option(type, type);
		document.getElementById("types").appendChild(option);
	}
}

function selectNode(param) {
	if (param.ondrag) return;

	if (alreadySelectedNode && !GetKeys["Control"]) {
		alreadySelectedNode.forEach((node) => {
			node.style.border = "2px solid transparent";
		});
	}

	if (!GetKeys["Control"] && alreadySelectedNode[0] == param) {
		param.style.border = "2px solid transparent";
		alreadySelectedNode.splice(0, 1);
	} else if (GetKeys["Control"]) {
		if (alreadySelectedNode.indexOf(param) < 0) {
			alreadySelectedNode.push(param);
			param.style.border = "2px solid red";
		} else {
			alreadySelectedNode.splice(alreadySelectedNode.indexOf(param), 1);
			param.style.border = "2px solid transparent";
		}
	} else if (alreadySelectedNode != param) {
		alreadySelectedNode = [];
		if (alreadySelectedNode.indexOf(param) < 0) {
			alreadySelectedNode.push(param);
			param.style.border = "2px solid red";
		} else {
			alreadySelectedNode.splice(alreadySelectedNode.indexOf(param), 1);
			param.style.border = "2px solid transparent";
		}
	}
}

function setEvents(bool) {
	events = bool;
	if (!bool) {
		document.getElementById("responses").style.pointerEvents = "none";
	} else {
		document.getElementById("responses").style.pointerEvents = "all";
	}
}

function closeForm(id) {
	const element = document.getElementById(id);

	element.style.animationName = "responsesOut";
	element.style.animationDuration = "0.5s";

	document.querySelector(".cover").style.animationName = "fadeOut";
	document.querySelector(".cover").style.animationDuration = "0.5s";

	setTimeout(() => {
		element.style.display = "none";
		document.querySelector(".cover").style.display = "none";
	}, 450);

	setEvents(false);
}

function openForm(id) {
	const element = document.getElementById(id);

	if (id == "insert-variables") {
		document.getElementById("responses").scrollTop = 0;
	}

	element.style.display = "block";

	element.style.animationName = "responsesIn";
	element.style.animationDuration = "0.5s";
	element.style.display = "block";

	setEvents(true);
}

function openElement(query) {
	const element = document.querySelector(query);
	element.style.display = "block";
}
setInterval(() => {
	if (!currentFormOpened) {
		document.body.style.overflow = "auto";
	} else {
		document.body.style.overflow = "hidden";
	}
}, 100);

let boxFollow = [];
var x, y, h, w;

let isDown = false;

function groupDown(e) {
	x = e.clientX;
	y = e.clientY;

	h = e.target.parentElement.parentElement.clientHeight;
	w = e.target.parentElement.parentElement.clientWidth;

	isDown = true;
}

let currBox;

function groupResize(e) {
	if (!isDown) return;

	const mx = e.clientX;
	const my = e.clientY;

	const cx = mx - x;
	const cy = my - y;

	if (e.target.closest(".group")) {
		currBox = e.target.closest(".group");
		if (!e.target.closest(".group").boxFollow) {
			e.target.closest(".group").boxFollow = [];
		}
	}

	currBox.style.width = cx + w + "px";
	currBox.style.height = cy + h + "px";
	new SaveSize(currBox.id, cx + w, cy + h);

	checkNodeCollide(e);
	const allNodes = [...document.querySelectorAll(".NodeContainer")];
	allNodes.forEach((node) => {
		node.ref.updatePaths();
	});

	checkNodeCollide(e);
}

function groupMoveDown(e, elem) {
	checkNodeCollide(e);
	if (isDown) return;

	if (e.target.className != "group") return;

	groupEditor.beginNodeDrag(e.target, e.pageX, e.pageY);
}

document.addEventListener("mouseup", (e) => {
	isDown = false;
	// checkNodeCollide(e);
});

document.addEventListener("mousemove", (e) => {
	const elementToAdd = e.target.closest(".NodeContainer");

	if (isDown) {
		boxDrag = false;
		groupResize(e);
		checkNodeCollide(e);
	}

	if (!isDown) return;
});

function groupEditor() {
	this.offsetX = 0;
	this.offsetY = 0;
}

groupEditor.beginNodeDrag = function (n, x, y) {
	groupEditor.dragItem = n;
	this.offsetX = n.offsetLeft - x - 150;
	this.offsetY = n.offsetTop - y - 150;

	this._offsetX = n.offsetLeft - x;
	this._offsetY = n.offsetTop - y;

	window.addEventListener("mousemove", groupEditor.onNodeDragMouseMove);
	window.addEventListener("mouseup", groupEditor.onNodeDragMouseUp);
};

groupEditor.onNodeDragMouseUp = function (e) {
	e.stopPropagation();
	e.preventDefault();

	window.removeEventListener("mousemove", groupEditor.onNodeDragMouseMove);
	window.removeEventListener("mouseup", groupEditor.onNodeDragMouseUp);
};

groupEditor.onNodeDragMouseMove = function (e) {
	e.stopPropagation();
	e.preventDefault();

	groupEditor.dragItem.style.left = e.pageX + groupEditor.offsetX + "px";
	groupEditor.dragItem.style.top = e.pageY + groupEditor.offsetY + "px";

	const allNodes = [...document.querySelectorAll(".NodeContainer")];
	allNodes.forEach((node) => {
		node.ref.updatePaths();
	});

	new SavePos(groupEditor.dragItem.id, e.pageX + groupEditor.offsetX, e.pageY + groupEditor.offsetY);
};

function checkCollision(elm1, elm2) {
	var elm1Rect = elm1.getBoundingClientRect();
	var elm2Rect = elm2.getBoundingClientRect();

	return elm1Rect.right >= elm2Rect.left && elm1Rect.left <= elm2Rect.right && elm1Rect.bottom >= elm2Rect.top && elm1Rect.top <= elm2Rect.bottom;
}

let mouseX, mouseY;
window.addEventListener("mousemove", (e) => {
	mouseX = e.pageX + 10;
	mouseY = e.pageY + 10;
});

function checkNodeCollide(e) {
	const allNodes = [...document.querySelectorAll(".NodeContainer")];

	allNodes.forEach((node) => {
		if (!checkCollision(e.target, node)) {
			const data = commands.find((x) => x.name === e.target.id);

			if (data) {
				if (data.boxFollow.indexOf(node.id) > -1) {
					data.boxFollow.splice(data.boxFollow.indexOf(node.id), 1);

					new SaveFollow(data.name, data.boxFollow);

					const children = [...e.target.children];
					children.forEach((child) => {
						if (child.id === node.id) {
							// node.style.left = e.target.clientWidth + 20 + "px";
							// console.log(node.style.left);
							// node.style.top = data.y + 500 + "px";
							document.body.appendChild(node);
						}
					});
				}
			}
		}

		if (checkCollision(e.target, node)) {
			const data = commands.find((x) => x.name === e.target.id);
			if (data) {
				const index = data.boxFollow.findIndex((x) => x === node.id);
				if (index > -1) return;

				try {
					node.style.top = "150px";
					node.style.left = "150px";

					new SavePos(node.id, 150, 150);

					e.target.appendChild(node);
					commands[commands.indexOf(data)] = data;
				} catch (e) {}
			}
		}
	});
}

function checkNodeCollideEl(e) {
	const allNodes = [...document.querySelectorAll(".NodeContainer")];
	const allGroups = [...document.querySelectorAll(".group")];

	allGroups.forEach((currBox) => {
		allNodes.forEach((node) => {
			if (!checkCollision(currBox, node)) {
				const index = currBox?.boxFollow?.indexOf(node);

				const children = [...e.children];
				children.forEach((child) => {
					if (child.id === node.id) {
						child.style.left = mouseX + "px";
						child.style.top = mouseY + "px";

						document.body.appendChild(child);
					}
				});
			}

			if (checkCollision(e, node)) {
				const index = currBox?.boxFollow?.indexOf(node.id);
				if (index > -1) return;

				try {
					e.appendChild(node);
				} catch (e) {}
			}
		});
	});
}

document.getElementById("newGroupForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const name = e.target.name.value;
	const color = e.target.color.value;

	const index = nodes.findIndex((x) => x == name);
	if (index > -1) return new Error(`Node/Group "${name}" already exists!`);

	new SaveGroup(name, color);
	new SavePos(name, pos.x, pos.y);

	closeGroup();
	setEvents(false);

	window.location.reload(true);
});

document.getElementById("newNoteForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const name = e.target.name.value;
	const color = e.target.color.value;

	const index = nodes.findIndex((x) => x == name);
	if (index > -1) return new Error(`Node/Group "${name}" already exists!`);

	const node = new NEditor.Node(`${e.target.name.value}`, e.target.name.value, "Note", "Note");
	node.eHeader.style.backgroundColor = color;
	// node.addNote(e.target.description.value);
	node.addTypeRange("whsdfgasg", "asdfasddsaf", 1, 5);
	// new SaveGroup(name, color);
	// new SavePos(name, pos.x, pos.y);

	closeNote();
	setEvents(false);

	// window.location.reload(true);
});

document.getElementById("editNodeForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const name = e.target.name.value;

	const index = commands.findIndex((x) => x.name === rightClickedNode.id);
	if (commands.findIndex((x) => x.name === name) > -1) return new Error(`Node "${name}" already exists!`);
	if (commands[index].command) return new Error(`Cannot edit a command node`);

	commands[index].name = name;

	closeEdit(false);
	setEvents(false);

	fs.writeJsonSync(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
	});

	window.location.reload(true);
});

document.getElementById("editGroupForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const name = e.target.name.value;
	const color = e.target.color.value;

	if (!currentGroup) return;

	const index = commands.findIndex((x) => x.name === currentGroup.id);
	if (commands.findIndex((x) => x.name === name) > -1) return new Error(`Node "${name}" already exists!`);

	commands[index].name = name;
	commands[index].color = color;

	closeEdit(true);
	setEvents(false);

	fs.writeJsonSync(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
	});

	setTimeout(() => {
		window.location.reload(true);
	}, 450);
});

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
}

function update() {
	const groups = [...document.querySelectorAll(".group")];
	groups.forEach((group) => {
		// checkNodeCollideEl(group);
		const children = [...group.querySelectorAll(".NodeContainer")];
		let Data;

		children.forEach((child) => {
			const data = commands.findIndex((node) => node.name === group.id);

			const index = commands[data].boxFollow.findIndex((x) => x.startsWith(child.id));
			if (commands[data].name === "asdfasdf") {
			}
			if (index < 0) {
				commands[data].boxFollow.push(child.id);
			}

			Data = data;
		});

		if (commands[Data]?.boxFollow) {
			new SaveFollow(group.id, commands[Data].boxFollow);
		}
	});
}

function closeOrExpand(element) {
	if (!element.expanded) {
		element.style.height = "100px";
		element.style.minHeight = "100px";

		element.expanded = true;
	} else {
		element.style.height = "350px";
		element.style.minHeight = "350px";
	}
}

setInterval(update, 5000);

window.requestAnimationFrame(function Update(time) {
	const allNodes = [...document.querySelectorAll(".NodeContainer")];
	allNodes
		.filter((x) => x.parentElement.tagName === "BODY")
		.forEach((node) => {
			node.ref.updatePaths();

			const left = parseInt(node.style.left.replace("px", ""));
			const top = parseInt(node.style.top.replace("px", ""));

			if (left < 5) {
				node.style.left = "5px";
			}

			if (top < 51) {
				node.style.top = "51px";
			}
		});

	window.requestAnimationFrame(Update);
});

function AddOutput(nodeName, outputName) {
	if (outputName == "") return;
	new SaveOutput(nodeName, outputName);

	const tempNode = tempNodes.findIndex((node) => node.sName === nodeName);
	tempNodes[tempNode].addOutput(outputName);
}

function deleteOutput(nodeName, outputName) {
	if (outputName == "") return;
	new DeleteOutput(nodeName, outputName);

	const tempNode = tempNodes.findIndex((node) => node.sName === nodeName);
	console.log(tempNodes[tempNode]);
	tempNodes[tempNode].removeOutput(outputName);
}

function AddInput(nodeName, inputName) {
	if (inputName == "") return;
	new SaveInput(nodeName, inputName);

	const tempNode = tempNodes.findIndex((node) => node.sName === nodeName);
	tempNodes[tempNode].addInput(inputName);
}

function deleteInput(nodeName, inputName) {
	if (inputName == "") return;
	new DeleteInput(nodeName, inputName);

	const tempNode = tempNodes.findIndex((node) => node.sName === nodeName);
	tempNodes[tempNode].removeInput(inputName);
}

function getRawData(query) {
	const element = document.querySelector(query);
	const textarea = element.getElementsByTagName("textarea")[0];

	const datas = [];

	alreadySelectedNode.forEach((node) => {
		const Node = commands.find((_node) => _node.name === node.id);
		datas.push(Node);
	});

	textarea.innerText = JSON.stringify(datas);
}

function addJSONData() {
	const element = document.querySelector("#InsertRawData");
	const textarea = element.getElementsByTagName("textarea")[0];

	const json = JSON.parse(textarea.value);
	let counter = 0;

	if (Array.isArray(json)) {
		json.forEach((node) => {
			for (const connection of Object.keys(node.connections)) {
				node.connections[connection] = [];
			}

			counter++;
			node.name = node.name + ` RAW_${counter}`;
			commands.push(node);
		});
	} else {
		counter++;
		node.name + ` RAW_${counter}`;
		commands.push(json);
	}

	fs.writeJson(selectedBot.path + "/data/nodes.json", commands, (err) => {
		if (err) throw err;
		window.location.reload(true);
	});
}

setTimeout(() => {
	const allNodes = [...document.querySelectorAll(".NodeContainer")];
	allNodes.forEach((node) => {
		node.ref.updatePaths();
	});
}, 800);

function getPositionAtCenter(element) {
	const { top, left, width, height } = element.getBoundingClientRect();
	return {
		x: left + width / 2,
		y: top + height / 2
	};
}

function getDistanceBetweenElements(a, b) {
	const aPosition = getPositionAtCenter(a);
	const bPosition = getPositionAtCenter(b);

	return Math.hypot(aPosition.y - bPosition.y);
}
function openFindMenu() {}
