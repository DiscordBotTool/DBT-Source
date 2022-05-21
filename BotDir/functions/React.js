module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "React",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Reactions",

    //Your outputs, leave it like this for default settings
    outputs: ["Nexxt"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Message ID *</label>
        <input name="reactionMsg">
        ${insert}

        <label>Channel id or name *</label>
        <input name="reactionChannel">
        ${insert}

        <label>Emoji (unicode or emoji id) *</label>
        <input name="reactionEmoji">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBA) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const channel = message.guild.channels.cache.find(
            x => x.name === DBT.parseVariables(action.reactionChannel) || x.id === DBT.parseVariables(action.reactionChannel)
        );

        const msg = await channel.messages.fetch(DBT.parseVariables(action.reactionMsg));
        msg.react(DBT.parseVariables(action.reactionEmoji));

        DBT.nextResponse(message, args, command, "Next");
    },
};
