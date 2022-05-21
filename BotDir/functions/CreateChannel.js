module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Create Channel",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Dev"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Channel",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Channel Name</label>
        <input name="channelName">
        ${insert}
        
        <select name="type">
            <option select value="GUILD_TEXT">Text Channel</option>
            <option select value="GUILD_VOICE">Voice Channel</option>
            <option select value="GUILD_STAGE_VOICE">Stage Channel</option>
        </select>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const variabled = DBT.parseVariables(action.channelName);

        message.guild.channels.create(variabled, {
            type: info.type.value,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                },
            ],
        });

        DBT.nextResponse(message, args, command, "Next");
    },
};
