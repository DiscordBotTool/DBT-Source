module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Create Row",

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

        <label>Components to add (seperate them by adding a comma)</label>
        <input name="components">
        ${insert}

        <h3 style="color: grey">
        Example: 
        \${dbt.exampleButton1}, \${dbt.exampleButton2}
        </h3
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBA) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const varname = DBT.parseVariables(action.varname);
        let componentVar = action.components.split(",");

        let components = [];

        if (Array.isArray(componentVar)) {
            for (let i = 0; i < componentVar.length; i++) {
                components.push(JSON.parse(DBT.parseVariables(componentVar[i])));
            }
        } else {
            components = [JSON.parse(DBT.parseVariables(componentVar[i]))];
        }
        var row = new Discord.MessageActionRow().addComponents(components);

        DBT.saveVariable(varname, JSON.stringify(row));
        DBT.nextResponse(message, args, command, "Next");
    },
};
