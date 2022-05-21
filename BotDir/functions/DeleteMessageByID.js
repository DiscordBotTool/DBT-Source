module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Delete Message By ID",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Devs"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (data) {
        return `
        <label>Channel id or name *</label><br>
        <input name="channel">
        <button type="button" var-btn><i class="fa-solid fa-flask-round-potion"></i> Insert Variable</button>

        <label>Message ID *</label><br>
        <input name="msgID">
        <button type="button" var-btn><i class="fa-solid fa-flask-round-potion"></i> Insert Variable</button>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: function (DBT, action, index, message, args, command) {
        const channel = message.guild.channels.cache.find(
            x => x.id === DBT.parseVariables(action.channel) || x.name === DBT.parseVariables(action.channel)
        );

        const msg = channel.messages.fetch(DBT.parseVariables(action.msgID)).then(msg => msg.delete());

        DBT.nextResponse(message, args, command, "Next");
    },
};
