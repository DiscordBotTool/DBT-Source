module.exports = {
	//This is what will be shown inside Discord Bot Agent
	name: "JSON Get Request",

	//Place the mods authors here, you can add other authors like this: ["user", "user2"]
	author: ["koki1019"],

	//Place the description of this mod here
	description: "Example Mod",

	//Place the verison of this mod here
	version: "1.0.0",

	//Category the mod can be found in
	category: "API Request",

	//Your outputs, leave it like this for default settings
	outputs: ["After Data Got"],

	//Place the HTML to show inside of Discord Bot Agent
	html: function (insert) {
		return `
        <label>Link *</label>
        <input name="link">

        <label>Variable name *</label>
        <input name="variableName">
        `;
	},

	//This will be executed when the bot is first started
	startup: function (DBT) {},

	//Place the mod here
	execute: async function (DBT, action, index, message, args, command) {
		const fetch = require("node-fetch");

		const link = DBT.parseVariables(action.link);
		const variable = DBT.parseVariables(action.variableName);

		const fetched = await fetch(link, {
			method: "GET",
		});

		const object = await fetched.json();

		addDotOrSmth(object, DBT, variable);
		DBT.nextResponse(message, args, command, "After Data Got");
	},
};

function addDotOrSmth(object, DBT, variable) {
	if (object instanceof Array) {
		for (const index in object) {
			DBT.saveVariable(`${variable}.${index + 1}`, object[index]);
			console.log(``);
			callOther(object[index], DBT, `${variable}.${index + 1}`);
		}
	} else if (object instanceof Object) {
		for (const key of Object.keys(object)) {
			DBT.saveVariable(`${variable}.${key}`, object[key]);
			callOther(object[key], DBT, `${variable}.${key}`);
		}
	}
}

function callOther(object, DBT, variable, firstTime) {
	addDotOrSmth(object, DBT, variable, firstTime);
}
