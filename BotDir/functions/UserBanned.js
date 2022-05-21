module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "User Banned",

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
        DBT.bot.on("guildBanAdd", member => {
            console.log("what");
            const varname = DBT.parseVariables(action.varname);

            DBT.saveVariable(`${varname}.username`, member.user.username);
            DBT.saveVariable(`${varname}.id`, member.user.id);
            DBT.saveVariable(`${varname}.tag`, member.user.tag);
            DBT.saveVariable(`${varname}.avatarURL`, member.user.avatarURL({ dynamic: true }));

            DBT.callEvent(command, "Responses", member);
        });
    },
};
