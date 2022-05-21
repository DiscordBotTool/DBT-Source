module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Check If Role Exists",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Server Action",

    //Your outputs, leave it like this for default settings
    outputs: ["True", "False"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Role ID or name*</label>
        <input name="checkIfRole">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const role = message.guild.roles.cache.find(
            x => x.id === DBT.parseVariables(action.checkIfRole) || x.name === DBT.parseVariables(action.checkIfRole)
        );

        if (role === undefined || role === null) {
            DBT.nextResponse(message, args, command, "False");
        } else {
            DBT.nextResponse(message, args, command, "True");
        }
    },
};
