module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Get Mentioned Role",

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
        const mention = message.mentions.roles.first() || { name: undefined, id: undefined };
        DBT.saveVariable(`${action.varname}.name`, mention.name);
        DBT.saveVariable(`${action.varname}.id`, mention.id);

        DBT.nextResponse(message, args, command, "Next");
    },
};
