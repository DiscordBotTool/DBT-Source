module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Set Status",

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
        <label>Status *</label><br>
        <select class="input-field" id="status" name="status">
            <option value="online">Online</option>
            <option value="dnd">Do not disturb</option>
            <option value="idle">Idle</option>
        </select>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBA) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        DBT.bot.user.setStatus(DBT.parseVariables(action.status));
        DBT.nextResponse(message, args, command, "Next");
    },
};
