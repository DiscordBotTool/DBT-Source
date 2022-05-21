module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Log",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Console",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Message *</label>
        <input name="message">
        ${insert}
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        console.log(DBT.parseVariables(action.message));
        DBT.nextResponse(message, args, command, "Next");
    },
};
