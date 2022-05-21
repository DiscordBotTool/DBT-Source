module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Timeout User",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "User Action",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID</label>
        <input name="userId"><br>
        ${insert}

        <label>Timeout Length (You can use: 1h, 1d, 1m, 1s)</label>
        <input class="input-field" name="time"><br>
        ${insert}

        <label>Reason</label>
        <input class="input-field" name="reason">
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

        const user = message.guild.members.cache.get(DBT.parseVariables(action.userId));
        const time = DBT.parseVariables(action.time);
        const reason = DBT.parseVariables(action.reason);

        user.timeout(ms(time), reason || "Reason not specified").catch(err => {
            console.log(err);
        });

        DBT.nextResponse(message, args, command, "Next");
    },
};
