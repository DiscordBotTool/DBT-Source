module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Create Button",

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
        <label>Variable Name</label>
        <input name="varname">
        ${insert}

        <label>Label</label>
        <input name="label">
        ${insert}

        <label>Custom ID (this becomes an URL when a LINK style is selected)</label>
        <input name="customId">
        ${insert}

        <label>Emoji (unicode or custom emoji id)</label>
        <input name="emojiMsg">
        ${insert}

        <label>Style</label>
        <select name="style">
            <option value="PRIMARY">PRIMARY</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DANGER">DANGER</option>
            <option value="LINK">LINK</option>
        </select>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const varname = DBT.parseVariables(action.varname);

        var button;

        switch (action.style) {
            case "LINK": {
                if (action.emojiMsg.length > 0) {
                    button = new Discord.MessageButton()
                        .setLabel(DBT.parseVariables(action.label))
                        .setURL(DBT.parseVariables(action.customId))
                        .setStyle(action.style)
                        .setEmoji(DBT.parseVariables(action.emojiMsg));
                } else {
                    button = new Discord.MessageButton()
                        .setLabel(DBT.parseVariables(action.label))
                        .setStyle(action.style)
                        .setURL(DBT.parseVariables(action.customId));
                }
                break;
            }
            default: {
                if (action.emojiMsg.length > 0) {
                    button = new Discord.MessageButton()
                        .setLabel(DBT.parseVariables(action.label))
                        .setCustomId(DBT.parseVariables(action.customId))
                        .setStyle(action.style)
                        .setEmoji(DBT.parseVariables(action.emojiMsg));
                } else {
                    button = new Discord.MessageButton()
                        .setLabel(DBT.parseVariables(action.label))
                        .setStyle(action.style)
                        .setCustomId(DBT.parseVariables(action.customId));
                }
            }
        }

        DBT.saveVariable(varname, JSON.stringify(button));
        DBT.nextResponse(message, args, command, "Next");
    },
};
