module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Edit User Data",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "User Data",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID *</label>
        <input name="id">
        ${insert}

        <label>Key *</label>
        <input name="key">
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

        let db = require("../data/userdata.json");
        const id = DBT.parseVariables(action.id);
        const key = DBT.parseVariables(action.key);

        const i = db.findIndex(x => x.id == id && x.key == key);

        let editTo = isNaN(DBT.parseVariables(action.value))
            ? DBT.parseVariables(action.value)
            : parseFloat(DBT.parseVariables(action.value));

        switch (action.opInput) {
            case "=":
                if (i > -1) {
                    db[i].value = editTo;
                } else {
                    db.push({
                        id,
                        key,
                        value: editTo,
                    });
                }
                break;
            case "+":
                if (i > -1) {
                    db[i].value = db[i].value + editTo;
                } else {
                    db.push({
                        id,
                        key,
                        value: editTo,
                    });
                }
                break;
            case "-":
                if (i > -1) {
                    db[i].value = db[i].value - editTo;
                } else {
                    db.push({
                        id,
                        key,
                        value: editTo,
                    });
                }
                break;
            case "/":
                if (i > -1) {
                    db[i].value = db[i].value / editTo;
                } else {
                    db.push({
                        id,
                        key,
                        value: editTo,
                    });
                }
                break;
            case "*":
                if (i > -1) {
                    db[i].value = db[i].value * editTo;
                } else {
                    db.push({
                        id,
                        key,
                        value: editTo,
                    });
                }
                break;
        }

        fs.writeFile("./data/userdata.json", JSON.stringify(db, null, 4), err => {
            if (err) throw err;
            DBT.nextResponse(message, args, command, "Next");
        });
    },
};
