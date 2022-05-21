const FS = require("fs-extra");
const Plugin_Electron = require("electron");

var DBT = {
	toast: (options) => {
		new Toast(options);
	},
	error: (message) => {
		new Error(message);
	},
	notification: (options) => {
		Plugin_Electron.ipcRenderer.invoke("notif", JSON.stringify(options));
	},
	invoke: Plugin_Electron.ipcRenderer.invoke,
	navbar: {
		addButton: (name, onClick) => {
			const elem = document.createElement("a");
			elem.onclick = onClick;
			elem.innerHTML = `<h1 class="dropdown-button">${name}</h1>`;

			return document.getElementById("NavBar-Dropdown").appendChild(elem);
		}
	},
	contextMenu: {
		addButton: (name, onClick) => {
			const elem = document.createElement("h3");
			elem.onclick = onClick;
			elem.innerHTML = name;
			elem.setAttribute("menu-btn", "");

			return document.getElementById("right-context-menu").appendChild(elem);
		}
	},
	nodes: {
		rightClickedNode: null,
		selectedNodes: null,
		addButtonToMenu: (name, onClick) => {
			const elem = document.createElement("h3");
			elem.onclick = onClick;
			elem.setAttribute("menu-btn", "");
			elem.innerHTML = name;

			return document.getElementById("node-right-context-menu").appendChild(elem);
		}
	}
};

setInterval((rightClickedNode, alreadySelectedNode) => {
	if (!rightClickedNode) {
		DBT.nodes.rightClickedNode = rightClickedNode;
	} else {
		console.log("fk");
	}
	if (alreadySelectedNode) {
		DBT.nodes.selectedNodes = alreadySelectedNode;
	}
}, 100);

(async () => {
	const path = await require("electron").ipcRenderer.invoke("pluginPath");

	const __dir = FS.readdirSync(path + "/Plugins");

	__dir.forEach((dir) => {
		console.log(
			`%cLoaded:%c ${dir}`,
			`
            background-color: #19d429;
            border-radius: 5px;
            font-size: 25px;
            padding: 5px;
            `,
			`color: yellow; font-size: 25px;`
		);
		if (dir.endsWith(".dbt.css")) {
			const style = document.createElement("style");
			style.innerHTML = FS.readFileSync(`${path}/Plugins/${dir}`, { encoding: "utf-8" });

			document.getElementsByTagName("body")[0].appendChild(style);
		} else if (dir.endsWith(".dbt.js")) {
			const plugin = require(`${path}/Plugins/${dir}`);
			plugin.plugin(DBT);
		}
	});

	function update(time) {
		__dir.forEach((dir) => {
			if (dir.endsWith(".dbt.js")) {
				const plugin = require(`${path}/Plugins/${dir}`);
				plugin.eachFrame(DBT);
			}
		});

		window.requestAnimationFrame(update);
	}

	window.requestAnimationFrame(update);
})();
