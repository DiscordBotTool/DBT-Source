module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Check User Permissions",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "User Action",

    //Your outputs, leave it like this for default settings
    outputs: ["True", "False"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>User ID *</label>
        <input name="permissionUserId">
        ${insert}

        <label>Permission to check*</label>
        <select name="permissions">
            <option value="KICK_MEMBERS">KICK_MEMBERS</option>
            <option value="BAN_MEMBERS">BAN_MEMBERS</option>
            <option value="ADMINISTRATOR">ADMINISTRATOR</option>
            <option value="MANAGE_CHANNELS">MANAGE_CHANNELS</option>
            <option value="MANAGE_GUILD">MANAGE_GUILD</option>
            <option value="ADD_REACTIONS">ADD_REACTIONS</option>
            <option value="EMBED_LINKS">EMBED_LINKS</option>
            <option value="ATTACH_FILES">ATTACH_FILES</option>
            <option value="USE_EXTERNAL_EMOJIS">USE_EXTERNAL_EMOJIS</option>
            <option value="CHANGE_NICKNAME">CHANGE_NICKNAME</option>
            <option value="MANAGE_NICKNAMES">MANAGE_NICKNAMES</option>
            <option value="MANAGE_ROLES">MANAGE_ROLES</option>
        </select>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");

        const permissions = {
            KICK_MEMBERS: Discord.Permissions.FLAGS.KICK_MEMBERS,
            BAN_MEMBERSS: Discord.Permissions.FLAGS.BAN_MEMBERS,
            ADMINISTRATOR: Discord.Permissions.FLAGS.ADMINISTRATOR,
            MANAGE_CHANNELS: Discord.Permissions.FLAGS.MANAGE_CHANNELS,
            MANAGE_GUILD: Discord.Permissions.FLAGS.MANAGE_GUILD,
            ADD_REACTIONS: Discord.Permissions.FLAGS.ADD_REACTIONS,
            EMBED_LINKS: Discord.Permissions.FLAGS.EMBED_LINKS,
            ATTACH_FILES: Discord.Permissions.FLAGS.ATTACH_FILES,
            USE_EXTERNAL_EMOJIS: Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
            CHANGE_NICKNAME: Discord.Permissions.FLAGS.CHANGE_NICKNAME,
            MANAGE_NICKNAMES: Discord.Permissions.FLAGS.MANAGE_NICKNAMES,
            MANAGE_ROLES: Discord.Permissions.FLAGS.MANAGE_ROLES,
        };
        const userID = DBT.parseVariables(action.permissionUserId);
        const member = message.guild.members.cache.find(x => x.id === userID);

        if (member.permissions.has(permissions[action.permissions])) {
            DBT.nextResponse(message, args, command, "True");
        } else {
            DBT.nextResponse(message, args, command, "False");
        }
    },
};
