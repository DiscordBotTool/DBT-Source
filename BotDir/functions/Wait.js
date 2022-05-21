module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Timeout",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Control",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Time (format: 5s, 5m, 5h, 5d) *</label>
        <input name="timeout">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {
        DBT.requireModule("ms");
    },

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const ms = require("ms");

        setTimeout(() => {
            DBT.nextResponse(message, args, command, "Next");
        }, ms(action.timeout));
    },
};
