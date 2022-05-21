module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Send Webhook Message",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Webhook URL *</label>
        <input name="webhook">
        ${insert}

        <label>Message *</label>
        <textarea name="msg"></textarea>
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const webhook = new Discord.WebhookClient({ url: DBT.parseVariables(action.webhook) });
        webhook.send(DBT.parseVariables(action.msg));

        DBT.nextResponse(message, args, command, "Next");
    },
};
