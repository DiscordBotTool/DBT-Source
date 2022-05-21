module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Send Message",

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
        <label>Channel name or ID *</label>
        <input name="channelVar">
        ${insert}

        <label>Message Row (if you want to add buttons/selects)</label>
        <input name="actionRow">
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
        const channelVar = DBT.parseVariables(action.channelVar);
        const channel = message.guild.channels.cache.find(x => x.name === channelVar || x.id === channelVar);
        const variabled = DBT.parseVariables(action.msgContent);

        var row;

        if (action.actionRow?.length > 0) {
            row = JSON.parse(DBT.parseVariables(action.actionRow));
        } else {
            row = undefined;
        }
        // console.log(row);
        if (row) {
            const msg = await channel.send({ content: variabled, components: [row] });

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);
        } else {
            const msg = await channel.send({ content: variabled });

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);
        }

        DBT.nextResponse(message, args, command, "Next");
    },
};
