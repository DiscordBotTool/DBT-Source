module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Ready",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Event",

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Good to go!</label>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, command) {
        DBT.bot.on("ready", () => {
            DBT.callEvent(command, "Responses", {});
        });
    },
};
