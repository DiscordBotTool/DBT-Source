module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Check Variable Value",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Variables",

    //Your outputs, leave it like this for default settings
    outputs: ["True", "False"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Value *</label>
        <input name="val">
        ${insert}

        <label>Operation</label>
        <select name="opInput">
            <option value="=">Is same as</option>
            <option value="include">Includes</option>
            <option value="startsWith">Starts With</option>
            <option value="endsWith">Ends With</option>
            <option value=">">Is higher than</option>
            <option value="<">Is lower than</option>
            <option value=">=">Is higher or same as</option>
            <option value="<=">Is lower or same as</option>
        </select>
        
        <label>Value to check *</label>
        <input name="value">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const fs = require("fs");

        const val = DBT.parseVariables(action.value);
        const varValue = DBT.parseVariables(action.val);

        switch (action.opInput) {
            case "=":
                if (varValue == val) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case ">":
                if (varValue > val) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case "<":
                if (varValue < val) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case ">=":
                if (varValue >= val) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case "<=":
                if (varValue <= val) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case "include":
                if (varValue.includes(val)) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case "startsWith":
                if (varValue.startsWith(val)) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
            case "endsWith":
                if (varValue.endsWith(val)) {
                    DBT.nextResponse(message, args, command, "True");
                } else {
                    DBT.nextResponse(message, args, command, "False");
                }
                break;
        }
    },
};
