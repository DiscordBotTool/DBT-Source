module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Set Presence",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Bot Action",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (data) {
        return `
        <label>Presence Text *</label>
        <input name="status">

        <label>Presence Type *</label>
        <select name="type">
            <option value="PLAYING">PLAYING</option>
            <option value="WATCHING">WATCHING</option>
            <option value="LISTENING">LISTENING</option>
            <option value="STREAMING">STREAMING</option>
        </select>

        <label>Stream Link (You must use this if you choose STREAMING) *</label>
        <input name="link">
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        DBT.bot.user.setActivity(DBT.parseVariables(action.status), {
            type: action.type,
            link: DBT.parseVariables(action.link),
            status: "online",
        });

        DBT.nextResponse(message, args, command, "Next");
    },
};
