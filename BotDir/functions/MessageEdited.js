module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Message Edited",

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

        <label>Get old message: \${dbt.varname.oldMessage.content}</label>
        <label>Get new message: \${dbt.varname.newMessage.content}</label>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, command) {
        DBT.bot.on("messageUpdate", (oldMessage, newMessage) => {
            const varname = DBT.parseVariables(action.varname);

            DBT.saveVariable(`${varname}.author.username`, oldMessage.author.username);
            DBT.saveVariable(`${varname}.author.id`, oldMessage.author.id);
            DBT.saveVariable(`${varname}.author.tag`, oldMessage.author.tag);
            DBT.saveVariable(`${varname}.author.avatarURL`, oldMessage.author.avatarURL({ dynamic: true }));

            DBT.saveVariable(`${varname}.commandChannel.id`, oldMessage.channel.id);
            DBT.saveVariable(`${varname}.commandChannel.name`, oldMessage.channel.name);
            DBT.saveVariable(`${varname}.commandChannel.pos`, oldMessage.channel.position);
            DBT.saveVariable(`${varname}.commandChannel.type`, oldMessage.channel.type);

            DBT.saveVariable(`${varname}.guild.id`, oldMessage.guild.id);
            DBT.saveVariable(`${varname}.guild.icon`, oldMessage.guild.icon);
            DBT.saveVariable(`${varname}.guild.name`, oldMessage.guild.name);
            DBT.saveVariable(`${varname}.guild.members`, oldMessage.guild.memberCount);

            DBT.saveVariable(`${varname}.oldMessage.content`, oldMessage.content);
            DBT.saveVariable(`${varname}.oldMessage.id`, oldMessage.id);

            DBT.saveVariable(`${varname}.newMessage.content`, newMessage.content);
            DBT.saveVariable(`${varname}.newMessage.id`, newMessage.id);

            DBT.callEvent(command, "Responses", newMessage);
        });
    },
};
