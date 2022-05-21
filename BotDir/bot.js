const config = require("./data/config.json");

const { execSync } = require("child_process");
const { join } = require("path");

if (!config.ranOnce) {
	process.on("uncaughtException", function (e) {
		console.log("[uncaughtException] app will be terminated: ", e.stack);
	});

	(async () => {
		const command = "npm install --save";

		console.log("[INSTALLER] - Please wait while the installer installs all modules... this may take some time");
		await execSync(command, {
			cwd: join(__dirname),
			stdio: [0, 1, 2]
		});

		config.ranOnce = true;

		fs.writeFile("./data/config.json", JSON.stringify(config, null, 4), (err) => {
			if (err) throw err;

			console.log(`[INSTALLER] - All modules have been installed. Please restart your bot to apply these changes`);
			process.kill(process.pid, "SIGINT");
		});
	})();
}

if (!config.ranLaunch) {
	process.on("uncaughtException", function (e) {
		console.log("[uncaughtException] app will be terminated: ", e.stack);
	});

	(async () => {
		const command = "npm install @discordjs/rest @discordjs/builders discord-api-types";

		console.log("[INSTALLER] - Please wait while the installer installs SLASH_COMMAND modules...");
		await execSync(command, {
			cwd: join(__dirname),
			stdio: [0, 1, 2]
		});

		config.ranLaunch = true;

		fs.writeFile("./data/config.json", JSON.stringify(config, null, 4), (err) => {
			if (err) throw err;

			console.log(`[INSTALLER] - SLASH_COMMAND Modules has been installed. Please restart your bot to apply these changes`);
			process.kill(process.pid, "SIGINT");
		});
	})();
}

const { REST } = require("@discordjs/rest");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes } = require("discord-api-types/v9");

const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({
	intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING", "GUILD_INVITES", "GUILD_WEBHOOKS", "GUILD_MESSAGE_REACTIONS"]
});
const commands = require("./data/nodes.json");

const functions = fs.readdirSync("./functions").filter((x) => x.endsWith(".js"));
const mods = fs.readdirSync("./mods").filter((x) => x.endsWith(".js"));

for (const file of mods) {
	functions.push(file);
}

client.login(config.token);

client.on("ready", () => {
	console.log(`${client.user.tag} is Online!`);
});

const DBT = {};

DBT.variables = {};

DBT.indexes = {};

DBT.bot = client;

DBT.nextResponse = (message, args, command, output) => {
	DBT.callOtherFunctions(command, message, args, command.connections[output]);
};

DBT.callEvent = (command, output, ...args) => {
	DBT.callEventFunctions(command, command.connections[output], ...args);
};
DBT.getFile = (fileName) => {
	let selectedBot = await ipcRenderer.invoke("selected");
	if(fs.existsSync(`${selectedBot}/data/files/${fileName}`)){
		return `${selectedBot}/data/files/${fileName}`
	}
};
DBT.parseVariables = (string) => {
	newVal = string.replace(/\${(.*?)}/g, (d) => {
		const match = d.slice(2, d.toString().length - 1);
		const splitted = match.split(".");
		splitted.shift();

		if (match.includes("dbt.")) {
			let vr;

			vr = DBT.variables[splitted.join(".")];

			return vr;
		}
	});

	return newVal;
};
DBT.parseFully = (string) => {
	const __match = string.match(/\${(.*?)}/g);
	let _match;

	__match.map((res) => {
		_match += res;
	});

	const match = _match.slice(2, _match.toString().length - 1);
	const splitted = match.split(".");
	splitted.shift();

	if (match.includes("dbt.")) {
		let vr;

		vr = DBT.variables[splitted.join(".")];
		return vr;
	}
};

DBT.saveVariable = (name, value) => {
	DBT.variables[name] = value;
};

DBT.called = {};

DBT.callOtherFunctions = (command, message, args, connections) => {
	for (const _f of functions) {
		const file = require(`./functions/${_f}`) || require(`./mods/${_f}`);

		for (const o in connections) {
			let node = commands.find((x) => x.name === connections[o]?.node);

			if (file.name == node?.type) {
				file.execute(DBT, node.variables, o, message, args, node);
			}
		}
	}
};

DBT.callEventFunctions = (command, connections, ...args) => {
	for (const _f of functions) {
		const file = require(`./functions/${_f}`) || require(`./mods/${_f}`);

		for (const o in connections) {
			let node = commands.find((x) => x.name === connections[o]?.node);

			if (file.name == node?.type) {
				args.push(["no args"]);
				args.push(node);
				file.execute(DBT, node.variables, o, ...args);
			}
		}
	}
};

DBT.requireModule = async function (name) {
	try {
		const path = "./node_modules/" + name;
		return require(path);
	} catch (e) {
		console.log(`[INSTALLER] - Installing ${name}`);

		try {
			const command = "npm install " + name + " --save";
			await execSync(command, {
				cwd: join(__dirname),
				stdio: [0, 1, 2]
			});

			console.log(`[INSTALLER] - ${name} Has been installed. You may have to restart your bot.`);

			const path = "./node_modules/" + name;
			return require(path);
		} catch (error) {
			console.log(error);
			console.log(`[INSTALLER] - an error occured while installing ${name}.`);
			return null;
		}
	}
};

for (const command of commands) {
	if (command.category != "Event") continue;

	for (const event of functions) {
		const file = require("./functions/" + event) || require("./mods/" + event);

		if (file.category == "Event" && file.name == command.type) {
			file.execute(DBT, command.variables, command);
		}
	}
}

(async () => {
	const req = {};
	req.requireModule = async function () {
		console.log(`[INSTALLER] - Updating Discord.JS...`);

		try {
			const command = "npm install " + "discord.js@latest" + " --save";

			await execSync(command, {
				cwd: join(__dirname),
				stdio: [0, 1, 2]
			});

			console.log(`[INSTALLER] - Discord.JS Has been updated. You may have to restart your bot to apply these changes.`);

			config.latest = true;

			fs.writeFile("./data/config.json", JSON.stringify(config, null, 4), (err) => {
				if (err) throw err;
			});

			return true;
		} catch (error) {
			console.log(error);
			console.log(`[INSTALLER] - an error occured while updating Discord.JS.`);
			return null;
		}
	};

	if (!config.latest) req.requireModule();
})();

const slashCommands = [];
const slashes = commands.filter((node) => node.type === "Slash");

slashes.forEach((slash) => {
	const data = {
		name: slash.name,
		description: slash.variables.desc,
		extraData: {
			guild: {
				id: slash.variables.guild.toLowerCase()
			}
		},
		options: [],
		execute: async (interaction) => {
			DBT.indexes[interaction.id] = 0;

			const { commandName } = interaction;
			let command = commands.filter((x) => x.type === "Slash").find((x) => x.name === commandName);

			if (!command) return;

			DBT.saveVariable("author.username", interaction.user.username);
			DBT.saveVariable("author.id", interaction.user.id);
			DBT.saveVariable("author.tag", interaction.user.tag);
			DBT.saveVariable("author.avatarURL", interaction.user.avatarURL({ dynamic: true }));
			DBT.saveVariable("authot.displayAvatar", interaction.user.displayAvatarURL({ format: "jpg" }));

			DBT.saveVariable("commandChannel.id", interaction.channel.id);
			DBT.saveVariable("commandChannel.name", interaction.channel.name);
			DBT.saveVariable("commandChannel.pos", interaction.channel.position);
			DBT.saveVariable("commandChannel.type", interaction.channel.type);

			DBT.saveVariable("guild.id", interaction.guild.id);
			DBT.saveVariable("guild.icon", interaction.guild.icon);
			DBT.saveVariable("guild.name", interaction.guild.name);
			DBT.saveVariable("guild.members", interaction.guild.memberCount);

			DBT.saveVariable(`${slash.name}`, interaction);

			DBT.callEvent(command, "Responses", interaction);
		}
	};

	const types = slash.variables.types.split(",");

	for (const i in slash.aliases) {
		if (slash.aliases[i] == "") continue;

		const type = types[i];

		const Types = {
			ROLE: Discord.Constants.ApplicationCommandOptionTypes.ROLE,
			USER: Discord.Constants.ApplicationCommandOptionTypes.USER,
			CHANNEL: Discord.Constants.ApplicationCommandOptionTypes.CHANNEL,
			TEXT: Discord.Constants.ApplicationCommandOptionTypes.STRING,
			NUMBER: Discord.Constants.ApplicationCommandOptionTypes.NUMBER
		};

		data.options.push({
			name: slash.aliases[i],
			description: "Required argument",
			type: Types[type.toUpperCase().trim()],
			required: true
		});
	}

	slashCommands.push(data);
});

const rest = new REST({ version: "9" }).setToken(config.token);

client.on("ready", () => {
	for (const _f of functions) {
		const file = require(`./functions/${_f}`) || require(`./mods/${_f}`);

		file.startup(DBT);
	}

	(async () => {
		try {
			console.log("Started refreshing application (/) commands.");

			const seperateGuilds = {};

			slashCommands.forEach(async (slash) => {
				if (!seperateGuilds[slash.extraData.guild.id]) {
					seperateGuilds[slash.extraData.guild.id] = [slash];
				} else {
					seperateGuilds[slash.extraData.guild.id].push(slash);
				}
			});

			for (const key of Object.keys(seperateGuilds)) {
				if (key === "everyone") {
					await rest.put(Routes.applicationCommands(client.user.id), { body: seperateGuilds[key] });
				} else {
					await rest.put(Routes.applicationGuildCommands(client.user.id, key), {
						body: seperateGuilds[key]
					});
				}
			}

			console.log("Successfully reloaded application (/) commands.");
		} catch (error) {
			console.error(error);
		}
	})();
});

client.on("messageCreate", async (message) => {
	if (message.author.bot || !message.content.toLowerCase(config.prefix)) return;

	const args = message.content.toLowerCase().slice(config.prefix.length).split(" ");
	const cmd = args.shift();

	DBT.indexes[message.id] = 0;

	let command = commands.filter((x) => x.command).find((x) => x.name == cmd);
	if (!command) {
		const Commands = commands.filter((x) => x.command);
		Commands.forEach((Cmd) => {
			if (Cmd.aliases) {
				Cmd.aliases.forEach((alias) => {
					if (alias.trim() === cmd) {
						command = Cmd;
					}
				});
			}
		});
	}

	if (!command) return;

	DBT.saveVariable("author.username", message.author.username);
	DBT.saveVariable("author.id", message.author.id);
	DBT.saveVariable("author.tag", message.author.tag);
	DBT.saveVariable("author.avatarURL", message.author.avatarURL({ dynamic: true }));
	DBT.saveVariable("authot.displayAvatar", message.author.displayAvatarURL({ format: "jpg" }));

	DBT.saveVariable("commandChannel.id", message.channel.id);
	DBT.saveVariable("commandChannel.name", message.channel.name);
	DBT.saveVariable("commandChannel.pos", message.channel.position);
	DBT.saveVariable("commandChannel.type", message.channel.type);

	DBT.saveVariable("guild.id", message.guild.id);
	DBT.saveVariable("guild.icon", message.guild.icon);
	DBT.saveVariable("guild.name", message.guild.name);
	DBT.saveVariable("guild.members", message.guild.memberCount);

	DBT.saveVariable("commandMessage.content", args.join(" "));
	DBT.saveVariable("commandMessage.id", message.id);

	DBT.callOtherFunctions(command, message, args, command.connections["Responses"]);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const slash = slashCommands.find((slash) => slash.name === commandName);

	if (slash) {
		slash.execute(interaction);
	}
});
