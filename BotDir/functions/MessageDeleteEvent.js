module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Message Delete",

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
        <label>Variable Name *</label>
        <input name="varname">
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, command) {
        DBT.bot.on("messageDelete", message => {
            const varname = DBT.parseVariables(action.varname);

            DBT.saveVariable(`${varname}.author.username`, message.author.username);
            DBT.saveVariable(`${varname}.author.id`, message.author.id);
            DBT.saveVariable(`${varname}.author.tag`, message.author.tag);
            DBT.saveVariable(`${varname}.author.avatarURL`, message.author.avatarURL({ dynamic: true }));

            DBT.saveVariable(`${varname}.commandChannel.id`, message.channel.id);
            DBT.saveVariable(`${varname}.commandChannel.name`, message.channel.name);
            DBT.saveVariable(`${varname}.commandChannel.pos`, message.channel.position);
            DBT.saveVariable(`${varname}.commandChannel.type`, message.channel.type);

            DBT.saveVariable(`${varname}.guild.id`, message.guild.id);
            DBT.saveVariable(`${varname}.guild.icon`, message.guild.icon);
            DBT.saveVariable(`${varname}.guild.name`, message.guild.name);
            DBT.saveVariable(`${varname}.guild.members`, message.guild.memberCount);

            DBT.saveVariable(`${varname}.commandMessage.content`, message.content);
            DBT.saveVariable(`${varname}.commandMessage.id`, message.id);

            DBT.callEvent(command, "Responses", message);
        });
    },
};
