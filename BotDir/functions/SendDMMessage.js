module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Send DM Message",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

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
        <label>User ID *</label>
        <input name="userVar">
        ${insert}

        <label>Message Content *</label>
        <textarea name="msgContent"></textarea>
        ${insert}

        <label>Variable Name</label>
        <input name="varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const userVar = DBT.parseVariables(action.userVar);
        const channel = message.guild.members.cache.find(x => x.name === userVar || x.id === userVar);
        const variabled = DBT.parseVariables(action.msgContent);

        const msg = await channel.user.send({ content: variabled });

        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);
        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.channel.id`, msg.channel.id);

        DBT.nextResponse(message, args, command, "Next");
    },
};
