module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Push in Array",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["dev team"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Array",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID (this can be anything!) *</label>
        <input name="id">
        ${insert}

        <label>Key *</label>
        <input name="key">
        ${insert}

        <label>Item to push *</label>
        <input name="value">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    execute: async function (DBT, action, index, message, args, command) {
        let db = require("../data/userdata.json");
        const fs = require("fs");

        const id = DBT.parseVariables(action.id);
        const key = DBT.parseVariables(action.key);
        const value = DBT.parseVariables(action.value);

        if (!isNaN(value)) {
            value = parseInt(val);
        }

        const i = db.findIndex(x => x.id == id && x.key == key);

        if (i > -1) {
            db[i].value.push(value);
        } else {
            db.push({
                id: id,
                key: key,
                value: [value],
            });
        }

        fs.writeFile("./data/userdata.json", JSON.stringify(db, null, 4), err => {
            if (err) throw err;
            DBT.nextResponse(message, args, command, "Next");
        });
    },
};
