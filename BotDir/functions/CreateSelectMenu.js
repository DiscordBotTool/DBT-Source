module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Create Select Menu",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message Rows",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    html: function (insert) {
        return `
        <label>Variable Name</label><br>
        <input name="varname">
        ${insert}

        <label>Placeholder</label><br>
        <input name="placeholder">
        ${insert}

        <label>Custom ID</label><br>
        <input name="customId">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const varname = DBT.parseVariables(action.varname);

        var menu = new Discord.MessageSelectMenu().setCustomId(action.customId).setPlaceholder(action.placeholder);

        DBT.saveVariable(varname, JSON.stringify(menu));
        DBT.nextResponse(message, args, command, "Next");
    },
};
