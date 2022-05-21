module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Multiple Inputs",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Devs"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Control",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Trigger Name</label>
        <input name="trigger">
        <button 
            btn
            type="button"
            onclick="AddInput(currentNode, this.previousElementSibling.value)"
        >
            Add Trigger
        </button>

        <label>Trigger Name to Delete</label>
        <input name="triggerDelete">
        <button 
            btn-danger
            type="button"
            onclick="deleteInput(currentNode, this.previousElementSibling.value)"
        >
            Remove Trigger
        </button>
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        DBT.nextResponse(message, args, command, "Next");
    },
};
