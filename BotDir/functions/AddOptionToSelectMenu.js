module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Add Option To Select Menu",

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
        <label>Select Menu Variable (without \${})</label>
        <input name="selectMenu">
        ${insert}

        <label>Label</label>
        <input name="label">
        ${insert}

        <label>Description</label>
        <input name="desc">
        ${insert}

        <label>Emoji</label>
        <input name="emoji">
        ${insert}

        <label>Custom ID</label>
        <input name="customId">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const menu = JSON.parse(DBT.parseVariables(`\${dbt.${action.selectMenu}}`));

        menu.options.push({
            value: DBT.parseVariables(action.customId),
            emoji: DBT.parseVariables(action.emoji) || "",
            description: DBT.parseVariables(action.desc) || "",
            label: DBT.parseVariables(action.label),
        });

        DBT.saveVariable(action.selectMenu, JSON.stringify(menu));
        DBT.nextResponse(message, args, command, "Next");
    },
};
