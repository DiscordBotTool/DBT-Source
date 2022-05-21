module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Get Attachment Link",

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
        <label>Channel id or name *</label><br>
        <input name="channel">
        ${insert}

        <label>Message ID *</label><br>
        <input name="msgID">
        ${insert}

        <label>Variable name *</label><br>
        <input name="variable">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const channel = message.guild.channels.cache.get(
            x => x.id === DBT.parseVariables(action.channel) || x.name === DBT.parseVariables(action.channel)
        );

        message.attachments.forEach(attachment => {
            DBT.saveVariable(action.variable, attachment.proxyURL);
        });

        DBT.nextResponse(message, args, command, "Next");
    },
};
