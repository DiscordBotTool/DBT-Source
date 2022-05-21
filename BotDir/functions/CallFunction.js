module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Call Function",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Dev team"],

    //Place the description of this mod here
    description: "Call the function",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Function",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Function Node Name*</label>
        <input name="name">
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const nodeData = require("../data/nodes.json");

        const nodeToCall = nodeData.find(node => node.category === "Function" && node.name === DBT.parseVariables(action.name));
        if (!nodeToCall)
            return console.error(`Function node with the name: "${DBT.parseVariables(action.name)}" couldn't be found`);

        DBT.callOtherFunctions(nodeToCall, message, args, nodeToCall.connections["After Called"]);
        DBT.nextResponse(message, args, command, "Next");
    },
};
