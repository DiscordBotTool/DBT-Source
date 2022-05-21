module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Add Role to User",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Devs"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "User Action",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID *</label>
        <input name="user">
        ${insert}

        <label>Role ID or Name (CAPITAL SENSITIVE) *</label>
        <input name="role">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const userVariabled = DBT.parseVariables(action.user);
        const user = await message.guild.members.cache.find(member => member.id === userVariabled);
        const roleVariabled = DBT.parseVariables(action.role);
        const role = await message.guild.roles.cache.find(role => role.id === roleVariabled || role.name === roleVariabled);

        if (!user) return console.log("Couldn't find the user " + userVariabled);
        if (!role) return console.log("Couldn't find the role " + roleVariabled);

        user.roles.add(role).catch(err => console.error(err));
        DBT.nextResponse(message, args, command, "Next");
    },
};
