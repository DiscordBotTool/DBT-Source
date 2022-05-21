module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Get Mentioned User",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["dev team"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Variables",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Variable Name *</label>
        <input name="varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    execute: async function (DBT, action, index, message, args, command) {
        const mention = message.mentions.members.first() || message.member;
        DBT.saveVariable(`${action.varname}.username`, mention.user.username);
        DBT.saveVariable(`${action.varname}.tag`, mention.user.tag);
        DBT.saveVariable(`${action.varname}.avatarURL`, mention.user.avatarURL({ dynamic: true }));
        DBT.saveVariable(`${action.varname}.displayAvatar`, mention.user.displayAvatarURL({ format: "jpg" }));
        DBT.saveVariable(`${action.varname}.id`, mention.user.id);

        DBT.nextResponse(message, args, command, "Next");
    },
};
