module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Switch Case",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Devs"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Control",

    //Your outputs, leave it like this for default settings
    outputs: [],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Switch</label>
        <input name="value">
        ${insert}

        <label>Case</label>
        <input name="case">
        <button 
            btn
            type="button"
            onclick="AddOutput(currentNode, this.previousElementSibling.value)"
        >
            Add Case
        </button>

        <label>Case to delete</label>
        <input name="deleteCase">
        <button 
            btn-danger
            type="button"
            onclick="deleteOutput(currentNode, this.previousElementSibling.value)"
        >
            Delete Case
        </button>
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        const value = DBT.parseVariables(action.value);

        for (const i in command.outputs) {
            if (value === command.outputs[i]) {
                DBT.nextResponse(message, args, command, command.outputs[i]);
            }
        }
    },
};
