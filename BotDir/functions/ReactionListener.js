module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Reaction Listener",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Reactions",

    //Your outputs, leave it like this for default settings
    outputs: ["After Reacted"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Message ID *</label>
        <input name="reactionMsg">
        ${insert}

        <label>Channel id or name *</label>
        <input name="reactionChannel">
        ${insert}

        <label>Listen to author only? *</label>
        <select name="author">
            <option value="true">Yes</option>
            <option value="false">No</option>
        </select>
        ${insert}

        <label>Emoji (unicode or emoji id) *</label>
        <input name="reactionEmoji">
        ${insert}

        <label>Store reacted emoji in variable name *</label>
        <input name="emojiVarName">
        ${insert}

        <label>Store user in variable name *</label>
        <input name="reactUserVar">
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

        const emoteRegex = /<:.+:(\d+)>/gm;
        const animatedEmoteRegex = /<a:.+:(\d+)>/gm;

        const emote = emoteRegex.exec(DBT.parseVariables(action.reactionEmoji));
        const animated = animatedEmoteRegex.exec(DBT.parseVariables(action.reactionEmoji));

        DBT.bot.on("messageReactionAdd", (reaction, user) => {
            if (reaction.message.id !== msg.id) return;
            if (user.bot) return;

            if (action.author && user.id !== message.author.id) return;

            DBT.saveVariable(`${DBT.parseVariables(action.reactUserVar)}.username`, user.username);
            DBT.saveVariable(`${DBT.parseVariables(action.reactUserVar)}.id`, user.id);
            DBT.saveVariable(`${DBT.parseVariables(action.reactUserVar)}.tag`, user.tag);
            DBT.saveVariable(`${DBT.parseVariables(action.reactUserVar)}.avatar`, user.avatarURL({ dynamic: true }));

            DBT.saveVariable(`${DBT.parseVariables(action.emojiVarName)}.id`, reaction.emoji.id);
            DBT.saveVariable(`${DBT.parseVariables(action.emojiVarName)}.name`, reaction.emoji.name);
            DBT.saveVariable(`${DBT.parseVariables(action.emojiVarName)}.url`, reaction.emoji.url);

            if (emote !== null) {
                if (reaction.emoji.id === emote[1]) {
                    DBT.nextResponse(message, args, command, "After Reacted");
                }
            } else if (animated !== null) {
                if (reaction.emoji.id === animated[1]) {
                    DBT.nextResponse(message, args, command, "After Reacted");
                }
            } else {
                if (reaction.emoji.name === DBT.parseVariables(action.reactionEmoji)) {
                    DBT.nextResponse(message, args, command, "After Reacted");
                }
            }
        });
    },
};
