module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Replace Text",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Variables",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Text to edit *</label>
        <input name="toEdit">
        ${insert}

        
        <label>Replace (this is a regex! DO NOT ADD / or /g!) *</label>
        <input name="regex">
        ${insert}

        <label>With *</label>
        <input name="with">
        ${insert}

        <label>Variable name to save in *</label>
        <input name="varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const fs = require("fs");

        const name = DBT.parseVariables(action.varname);
        const toEdit = DBT.parseVariables(action.toEdit);

        const regex = new RegExp(DBT.parseVariables(action.regex), "g");

        const valueToSave = toEdit.replace(regex, DBT.parseVariables(action.with));
        DBT.saveVariable(name, valueToSave);

        DBT.nextResponse(message, args, command, "Next");
    },
};
