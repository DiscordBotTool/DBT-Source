module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Function",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Dev team"],

    //Place the description of this mod here
    description: "Create a Function",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Function",

    //Your outputs, leave it like this for default settings
    outputs: ["After Called"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <h2>You are good to go!</h2>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        DBT.nextResponse(message, args, command, "After Called");
    },
};
