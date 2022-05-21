module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Check If User Has Role",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "User Action",

    //Your outputs, leave it like this for default settings
    outputs: ["True", "False"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID*</label>
        <input name="userID">
        ${insert}

        <label>Role id or name*</label>
        <input name="role">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const fs = require("fs");

        const userID = DBT.parseVariables(action.userID);
        const member = message.guild.members.cache.find(x => x.id === userID);

        if (
            !member.roles.cache.find(x => x.name === DBT.parseVariables(action.role) || x.id === DBT.parseVariables(action.role))
        ) {
            DBT.nextResponse(message, args, command, "False");
        } else {
            DBT.nextResponse(message, args, command, "True");
        }
    },
};
