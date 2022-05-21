const cooldown = new Map();

module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Cooldown",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Control",

    //Your outputs, leave it like this for default settings
    outputs: ["No Cooldown", "Has Cooldown"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID *</label>
        <input name="userId">
        ${insert}

        <label>Time (format: 5s, 5m, 5hr, 5d)*</label>
        <input name="time">
        ${insert}

        <label>Variable name to save seconds in *</label>
        <input name="varname">
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
        const userId = DBT.parseVariables(action.userId);
        const time = DBT.parseVariables(action.time);

        if (cooldown.get(userId)) {
            DBT.saveVariable(
                `${DBT.parseVariables(action.varname)}`,
                ms(time) / 1000 - (new Date().getSeconds() - cooldown.get(userId).getSeconds())
            );

            DBT.nextResponse(message, args, command, "Has Cooldown");
        } else {
            cooldown.set(userId, new Date());
            setTimeout(() => {
                cooldown.delete(userId);
            }, ms(time));

            DBT.nextResponse(message, args, command, "No Cooldown");
        }
    },
};

function addDotOrSmth(object, DBT, variable) {
    if (object instanceof Array) {
        for (const index in object) {
            DBT.saveVariable(`${variable}.${index + 1}`, object[index]);
            console.log(``);
            callOther(object[index], DBT, `${variable}.${index + 1}`);
        }
    } else if (object instanceof Object) {
        for (const key of Object.keys(object)) {
            DBT.saveVariable(`${variable}.${key}`, object[key]);
            callOther(object[key], DBT, `${variable}.${key}`);
        }
    }
}

function callOther(object, DBT, variable, firstTime) {
    addDotOrSmth(object, DBT, variable, firstTime);
}
