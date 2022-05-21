const {
	app,
	BrowserWindow,
	ipcMain,
	dialog,
	Notification,
} = require("electron");
const fs = require("fs-extra");
const child_process = require("child_process");

const path = require("path");

const discordRPC = require("discord-rpc");

const RPC = new discordRPC.Client({ transport: "ipc" });
RPC.login({ clientId: "857711682498068520" });

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const playTime = new Date();

app.setPath(
	"userData",
	path.join(app.getPath("appData"), "Discord Bot Tool V2")
);
const userData = app.getPath("userData");
console.log(userData);
const exePath = app.getPath("exe");
let botFPath = exePath.split("/");
botFPath.pop();

let pluginPath = userData;

let window;
let botData = {};

const isDev = require("electron-is-dev");
let botFilePath = isDev ? __dirname : botFPath.join("/");

let data;

if (!fs.existsSync(`${pluginPath}/Plugins`)) {
	fs.mkdirSync(`${pluginPath}/Plugins`);
}
if (!fs.existsSync(`${userData}/bots.json`)) {
	fs.writeFile(`${userData}/bots.json`, JSON.stringify([]), err => {
		if (err) throw err;
		data = require(`${userData}/bots.json`);
	});
} else {
	data = require(`${userData}/bots.json`);
}

let isOn = false;
let functions = fs
	.readdirSync(`${botFilePath}/BotDir/functions`)
	.filter(x => x.endsWith(".js"));

app.on("ready", () => {
	window = new BrowserWindow({
		width: 1300,
		height: 800,
		minWidth: 900,
		minHeight: 700,
		autoHideMenuBar: true,
		icon: "./build/512x512.png",
		frame: false,
		thickFrame: true,
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (!fs.existsSync(`${userData}/bots.json`)) {
		fs.writeFile(`${userData}/bots.json`, JSON.stringify([]), err => {
			if (err) throw err;
		});

		data = require(`${userData}/bots.json`);
	}

	if (process.platform === "win32") {
		app.setAppUserModelId("Discord Bot Tool");
	}
	window.loadFile("./html/index.html");

	ipcMain.handle("minimize", e => {
		window.minimize();
	});
	ipcMain.handle("maximize", e => {
		if (window.isMaximized()) {
			window.restore();
		} else {
			window.maximize();
		}
	});

	ipcMain.handle("close", e => {
		window.close();
	});
});

ipcMain.handle("getFolder", async e => {
	const response = await dialog.showOpenDialog({
		properties: [`openDirectory`],
		buttonLabel: `Select a folder`,
	});

	return response.filePaths[0] + "/BotDir";
});

ipcMain.handle("create-bot", async (e, name, path) => {
	const index = data.findIndex(x => x.name == name);
	if (index > -1) {
		const options = {
			type: "error",
			buttons: ["OK"],
			defaultId: 1,
			title: "Error",
			message: `A bot with name "${name}" already exists!`,
			details: null,
		};

		dialog.showMessageBox(null, options);
		return;
	}
	fs.copySync(`${botFilePath}/BotDir`, path, { overwrite: true }, err => {
		if (err) throw err;
	});

	data.push({
		name: name,
		path: path,
	});

	fs.writeFile(`${userData}/bots.json`, JSON.stringify(data), err => {
		if (err) throw err;
	});
});
ipcMain.handle("error", async (e, message, details) => {
	details = details || null;

	const options = {
		type: "error",
		buttons: ["OK"],
		defaultId: 1,
		title: "Error",
		message: message,
		details: details,
	};

	dialog.showMessageBox(null, options);
});

ipcMain.handle("save-changes", async (e, prefix, token, id) => {
	const data = {
		prefix: prefix,
		token: token,
		id: id,
	};

	fs.writeFile(botData.path + "/data/config.json", data, err => {
		if (err) throw err;
	});
});

ipcMain.handle("get-bots", async e => {
	return data;
});

ipcMain.handle("select", async (e, name) => {
	const index = data.findIndex(x => x.name == name);
	botData = data[index];
});

ipcMain.handle("selected", async e => {
	return botData;
});
ipcMain.handle("rawr", e => {
	return userData;
});

ipcMain.handle("get-token", async (e, token) => {
	const botConfig = require(botData?.path + "/data/config.json");

	if (!botConfig) return "";

	return botConfig.token;
});

ipcMain.handle("get-id", async (e, token) => {
	const botConfig = require(botData?.path + "/data/config.json");

	if (!botConfig) return undefined;

	return botConfig.id ?? undefined;
});

var child;

ipcMain.handle("runbot", async e => {
	if (!isOn) {
		child = child_process.spawn(`node`, ["--no-deprecation", `bot.js`], {
			cwd: `${botData.path}`,
		});

		child.stdout.on("data", data => {
			window.webContents.send("log", data.toString());
		});

		child.stderr.on("data", data => {
			const [window] = BrowserWindow.getAllWindows();
			let currentURL = window.webContents.getURL();
			if (!window.isFocused() || !currentURL.includes("run-bot.html")) {
				new Notification({
					title: `Bot encoutered an error!`,
					body: `ERROR: ${data.toString()}`,
					icon: __dirname + "/build/icon.ico",
				}).show();
			}

			window.webContents.send("err", data.toString());
		});

		child.on("exit", (code, signal) => {
			window.webContents.send("exit");
		});

		isOn = true;
	}
});

ipcMain.handle("stopbot", async e => {
	if (isOn) {
		child.kill("SIGINT");
		window.webContents.send("exit");

		isOn = false;
	}
});

ipcMain.handle("isOn", async e => {
	return isOn;
});

ipcMain.handle("delete", async e => {
	if (!botData?.name) return;

	const index = data.findIndex(x => (x.name = botData.name));
	if (index < 0) return;

	data.splice(index, 1);

	fs.writeFile(`${userData}/bots.json`, JSON.stringify(data), err => {
		if (err) throw err;
	});

	botData = {};
});

ipcMain.handle("getPlaytime", async e => {
	return playTime;
});

ipcMain.handle("setRPC", async (e, message, imageURL) => {
	RPC.setActivity({
		largeImageKey: imageURL,
		largeImageText: "Discord Bot Tool V2.0.0",
		state: message,
		startTimestamp: playTime,
		buttons: [
			{
				label: "Download",
				url: "https://discordbottool.xyz",
			},
			{
				label: "Join Server",
				url: "https://discord.gg/PjcqB9T3n6",
			},
		],
	});
});

let rest;
ipcMain.handle("setBot", async (e, botID, token) => {
	if (!rest) rest = new REST().setToken(token);

	const data = await rest.get(Routes.user(botID));

	RPC.setActivity({
		largeImageKey: `https://cdn.discordapp.com/avatars/${botID}/${data.avatar}.png?size=1024`,
		largeImageText: `${botData.name}`,
		smallImageKey: "https://i.imgur.com/ZbeAYUQ.png",
		smallImageText: "Discord Bot Tool V2.0.0",
		state: `Editing ${botData.name}`,
		startTimestamp: playTime,
		buttons: [
			{
				label: "Download",
				url: "https://discordbottool.xyz",
			},
			{
				label: "Join Server",
				url: "https://discord.gg/PjcqB9T3n6",
			},
		],
	});
});
ipcMain.handle("getFilePath", async e => {
	const response = await dialog.showOpenDialog({
		properties: [`openFile`],
		buttonLabel: `Select a file`,
	});

	return response.filePaths[0];
});

ipcMain.handle("toast", (e, title, body) => {
	new Notification({
		title,
		body,
		icon: __dirname + "/build/icon.ico",
	}).show();
});

ipcMain.handle("notif", (e, body) => {
	new Notification(JSON.parse(body)).show();
});

ipcMain.handle("pluginPath", e => {
	return pluginPath;
});
