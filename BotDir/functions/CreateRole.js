module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Create Role",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Server Action",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Role name *</label>
        <input name="name">
        ${insert}

        <label>Role color hex *</label>
        <input type="color" name="color">
        ${insert}

        <label>Role position (must be a number)*</label>
        <input name="position">
        ${insert}

        <h3 style="color: grey">
            Position "1" is the highest position in hirerarchy
            Position "your servers role amount" is the lowest position in hirerarchy
        </h3>

        <label>Hoist Role *</label>
        <select name="hoist">
            <option value="true">TRUE</option>
            <option value="false">FALSE</option>
        </select>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        message.guild.roles
            .create({
                name: DBT.parseVariables(action.name),
                color: DBT.parseVariables(action.color),
                hoist: JSON.parse(action.hoist),
                position: parseInt(DBT.parseVariables(action.position)),
            })
            .then(() => {
                DBT.nextResponse(message, args, command, "Next");
            });
    },
};
