const FS_ = require("fs-extra");
let botData = {};

_nodes = null;

let inputsToCheck = [];
let __nodes = [];

const _types = {
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
	Slash: `<i class="fa-solid fa-slash-forward"></i>`,
};

(async () => {
	const { ipcRenderer } = require("electron");
	const data = await ipcRenderer.invoke("selected");

	if (!data) window.location.href = "choose-bot.html";

	botData = data;
	_nodes = require(`${botData.path}/data/nodes.json`);
	commands = _nodes;

	for (const node of _nodes) {
		if (node.group) {
			const group = document
				.getElementById("groupTemplate")
				.content.cloneNode(true);

			group.querySelector(".group").id = node.name;
			group.querySelector(".group-name").innerText = node.name;
			group.querySelector(".group").boxFollow = node.boxFollow;
			group.boxFollow = node.boxFollow;

			group.querySelector(".group").style.width = node.width + "px";
			group.querySelector(".group").style.height = node.height + "px";

			group.querySelector(".group").style.left = node.x + "px";
			group.querySelector(".group").style.top = node.y + "px";

			group.querySelector(".group").style.position = "absolute";

			const convertedColor = hexToRgb(node.color);

			group.querySelector(
				".group"
			).style.backgroundColor = `rgba(${convertedColor.r}, ${convertedColor.g}, ${convertedColor.b}, 0.32)`;
			group.querySelector(
				".group"
			).style.border = `3.5px solid ${node.color}`;

			document.body.appendChild(group);
			const appendedGroup = document.getElementById(node.name);

			const allNodes = [...document.querySelectorAll(".NodeContainer")];
			allNodes.forEach(Node => {
				if (checkCollision(appendedGroup, Node)) {
					const index = node.boxFollow?.indexOf(Node.id);

					for (const id of node.boxFollow) {
						if (Node.id === id) {
							appendedGroup.appendChild(Node);
						}
					}
				}
			});
			continue;
		}

		nodes.push(node.name);

		let newNode = new NEditor.Node(
			`${_types[node.category]} | ${node.name}`,
			node.name,
			node.category,
			node.type
		);
		newNode.setPosition(node.x, node.y);
		tempNodes.push(newNode);

		__nodes.push({
			node,
			newNode,
		});

		for (const con of Object.keys(node.connections)) {
			for (const inf in node.connections[con]) {
				const index = _nodes.findIndex(
					x => x.name === node.connections[con][inf].node
				);

				if (index < 0) {
					console.log(con);
					_nodes[_nodes.indexOf(node)].connections[con].splice(
						inf,
						1
					);

					FS_.writeJsonSync(
						`${botData.path}/data/nodes.json`,
						_nodes,
						err => {
							if (err) throw err;
						}
					);
				}
			}
		}

		for (let i = 0; i < node.inputs.length; i++) {
			let input = newNode.addInput(node.inputs[i]);
			inputsToCheck.push({
				name: node.name,
				input: input,
			});
		}
	}

	for (const node of __nodes) {
		for (let i = 0; i < node.node.outputs.length; i++) {
			let newNode = node.newNode;

			let output = newNode.addOutput(node.node.outputs[i]);

			for (const outputCon of Object.keys(node.node.connections)) {
				for (const input of inputsToCheck) {
					for (const connection of node.node.connections[outputCon]) {
						if (
							connection.trigger.name == input.input.name &&
							connection.node == input.name
						) {
							if (outputCon == output.name) {
								output.connectTo(input.input);
							}
						}
					}
				}
			}
		}
	}

	for (const node of _nodes) {
		if (node.group && node.boxFollow.length > 0) {
			const element = document.getElementById(node.name);

			const allNodes = [...document.querySelectorAll(".NodeContainer")];
			allNodes.forEach(Node => {
				for (const _Node of node.boxFollow) {
					if (Node.id === _Node) {
						element.appendChild(Node);
						Node.ref.updatePaths();
					}
				}
			});

			// checkNodeCollideEl(element);

			continue;
		}
	}
})();

class SaveNode {
	constructor(nodeName, type, category, inputs, outputs, aliases) {
		aliases = aliases || null;

		const index = nodeData.findIndex(x => x.name === nodeName);

		const toPaste = {
			name: nodeData[index].name,
			inputs: inputs,
			outputs: outputs,
			connections: {},
			category: category,
			type: type,
			x: 150,
			y: 150,
		};

		for (const output of outputs) {
			toPaste.connections[output] = [];
		}

		if (type == "Command") {
			toPaste.command = nodeName.toLowerCase();
		} else {
			toPaste.variables = {};
		}

		if (aliases) {
			toPaste.aliases = [...aliases.split(",")];
		}

		_nodes.push(toPaste);

		console.log(_nodes);
		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SavePos {
	constructor(name, posX, posY) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].x = posX;
			_nodes[index].y = posY;
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SaveOutput {
	constructor(name, output) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].outputs.push(output);
			_nodes[index].connections[output] = [];
		}
		setInterval(() => {}, 500);
	}
}

class DeleteOutput {
	constructor(name, output) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			delete _nodes[index].connections[output];
			_nodes[index].outputs.splice(
				_nodes[index].outputs.indexOf(output),
				1
			);
		}

		FS_.writeJson(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SaveInput {
	constructor(name, input) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].inputs.push(input);
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class DeleteInput {
	constructor(name, input) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].inputs.splice(_nodes[index].inputs.indexOf(input), 1);
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SaveConnection {
	constructor(name, outputName, parentName, NConnector) {
		const index = _nodes.findIndex(x => x.name === name);

		// for (const node of _nodes) {
		//     if (node.group) continue;
		//     for (const con of Object.keys(node.connections)) {
		//         for (const i in node.connections[con]) {
		//             // if (node.connections[con][i].node === parentName) {
		//             //     _nodes[_nodes.indexOf(node)].connections[con].splice(i, 1);
		//             // }
		//         }
		//     }
		// }

		if (index > -1) {
			const conIndex = _nodes[index].connections[outputName].findIndex(
				x => x.node === parentName
			);

			if (conIndex > -1) {
				_nodes[index].connections[outputName][conIndex] = {
					node: parentName,
					trigger: {
						name: NConnector.name,
						parent: NConnector.nName,
					},
				};
			} else {
				_nodes[index].connections[outputName].push({
					node: parentName,
					trigger: {
						name: NConnector.name,
						parent: NConnector.nName,
					},
				});
			}

			FS_.writeJsonSync(
				`${botData.path}/data/nodes.json`,
				_nodes,
				err => {
					if (err) throw err;
				}
			);
		}
	}
}

class RemoveConnection {
	constructor(parentName) {
		let index;

		for (const node of _nodes) {
			if (node.group) continue;

			for (const con of Object.keys(node.connections)) {
				for (const i in node.connections[con]) {
					if (node.connections[con][i].node === parentName) {
						_nodes[_nodes.indexOf(node)].connections[con].splice(
							i,
							1
						);
					}
				}
			}
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SaveVariable {
	constructor(nodeName, variable, value) {
		const index = _nodes.findIndex(x => x.name === nodeName);
		console.log(variable, nodeName, value);
		if (index > -1) {
			console.log("Saved " + variable + " as " + value);
			_nodes[index].variables[variable] = value;

			FS_.writeJsonSync(
				`${botData.path}/data/nodes.json`,
				_nodes,
				err => {
					if (err) throw err;
				}
			);
		}
	}
}

class SaveCommand {
	constructor(nodeName, commandName, commandAliases) {
		const index = _nodes.findIndex(x => x.name === nodeName);

		if (index > -1) {
			_nodes[index].command = commandName;
			_nodes[index].name = commandName;
			_nodes[index].aliases = [...commandAliases.split(",")];

			console.log(_nodes[index]);

			FS_.writeJsonSync(
				`${botData.path}/data/nodes.json`,
				_nodes,
				err => {
					if (err) throw err;
				}
			);
		}
	}
}

class Variables {
	constructor(nodeName, variable, value) {
		const index = _nodes.findIndex(x => x.name === nodeName);

		if (index > -1) {
			return _nodes[index].variables;
		}
	}
}

function saveEverything() {
	FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
		if (err) throw err;
	});

	window.location.reload(true);
}

class SaveGroup {
	constructor(groupName, groupColor) {
		const toPaste = {
			group: true,
			color: groupColor,
			name: groupName,
			x: 150,
			y: 150,
			boxFollow: [],
			width: 300,
			height: 300,
		};

		_nodes.push(toPaste);

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

// class Save {
//     constructor(groupName, groupColor) {
//         const toPaste = {
//             group: true,
//             color: groupColor,
//             name: groupName,
//             x: 150,
//             y: 150,
//             boxFollow: [],
//             width: 300,
//             height: 300,
//         };

//         _nodes.push(toPaste);

//         FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
//             if (err) throw err;
//         });
//     }
// }

class SaveSize {
	constructor(name, width, height) {
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].width = width;
			_nodes[index].height = height;
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

class SaveFollow {
	constructor(name, boxFollow) {
		if (!boxFollow) return;
		const index = _nodes.findIndex(x => x.name === name);

		if (index > -1) {
			_nodes[index].boxFollow = boxFollow;
		}

		FS_.writeJsonSync(`${botData.path}/data/nodes.json`, _nodes, err => {
			if (err) throw err;
		});
	}
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}
