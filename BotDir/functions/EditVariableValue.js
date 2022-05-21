module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Edit Variable Value",

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
        <label>Variable (without \${} and dbt.) *</label>
        <input name="varname">
        ${insert}

        <label>Operator</label>
        <select name="opInput">
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="/">/</option>
            <option value="*">*</option>
            <option value="=">=</option>
        </select>
        
        <label>Value *</label>
        <input name="value">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const fs = require("fs");

        let editTo = DBT.parseVariables(action.value);
        let variable = DBT.parseVariables(`\${dbt.${action.varname}}`);

        if (!isNaN(editTo)) {
            editTo = parseFloat(editTo);
        }

        if (!isNaN(variable)) {
            variable = parseFloat(variable);
        }

        switch (action.opInput) {
            case "=":
                DBT.saveVariable(action.varname, editTo);
                break;
            case "+":
                DBT.saveVariable(action.varname, variable + editTo);
                break;
            case "-":
                DBT.saveVariable(action.varname, variable - editTo);
                break;
            case "/":
                DBT.saveVariable(action.varname, variable / editTo);
                break;
            case "*":
                DBT.saveVariable(action.varname, variable * editTo);
                break;
        }

        DBT.nextResponse(message, args, command, "Next");
    },
};
