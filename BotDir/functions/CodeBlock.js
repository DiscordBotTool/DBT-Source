module.exports = {
	//This is what will be shown inside Discord Bot Tool
	name: "Code Block",

	//Place the mods authors here, you can add other authors like this: ["user", "user2"]
	author: ["Pokemonultra"],

	//Place the description of this mod here
	description: "Execute inserted Code",

	//Place the verison of this mod here
	version: "1.0.0",

	//Category the mod can be found in
	category: "Mods",

	//Your outputs, leave it like this for default settings
	outputs: ["Next", "Error"],

	//Place the HTML to show inside of Discord Bot Agent
	html: function (insert) {
		return `
        <label>Write some Code below which will be executed</label>
        <textarea name="Codeblock" placeholder='message.channel.send("This is a test")'></textarea>
        ${insert} <!-- This is the insert variable button, put it below the input to insert into that input! --!>
        `;
	},
	startup: function (DBT) {
		console.log("Code Block by Pokemonultra#2815");
	},

	execute: async function (DBT, action, index, message, args, command) {
		try {
			eval(DBT.parseVariables(action.Codeblock));
		} catch (error) {
			DBT.nextResponse(message, args, command, "Error");
			console.log(error);
		}

		DBT.nextResponse(message, args, command, "Next"); //Next is the output name
	}
};
