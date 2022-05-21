module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Get Slash Command Argument",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Variables",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Interaction *</label>
        <input name="interaction">

        <label>Argument Name *</label>
        <input name="argName">

        <label>Argument Type *</label>
        <select name="type">
            <option value="ROLE">ROLE</option>
            <option value="CHANNEL">CHANNEL</option>
            <option value="TEXT">TEXT</option>
            <option value="NUMBER">NUMBER</option>
            <option value="USER">USER</option>
        </select>

        <label>Variable Name To Save In*</label>
        <input name="varname">
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const varname = DBT.parseVariables(action.varname);
        const type = DBT.parseVariables(action.type);
        const name = DBT.parseVariables(action.argName);
        const interaction = DBT.parseFully(action.interaction);

        const { options } = interaction;

        switch (type) {
            case "ROLE": {
                const value = options.getRole(name);

                DBT.saveVariable(`${action.varname}.name`, value.name);
                DBT.saveVariable(`${action.varname}.id`, value.id);

                break;
            }
            case "CHANNEL": {
                const value = options.getChannel(name);

                DBT.saveVariable(`${varname}.id`, value.id);
                DBT.saveVariable(`${varname}.name`, value.name);
                DBT.saveVariable(`${varname}.pos`, value.position);
                DBT.saveVariable(`${varname}.type`, value.type);

                break;
            }
            case "TEXT": {
                const value = options.getString(name);

                DBT.saveVariable(`${varname}`, value);
                break;
            }
            case "NUMBER": {
                const value = options.getNumber(name);

                DBT.saveVariable(`${varname}`, value);
                break;
            }
            case "USER": {
                DBT.saveVariable(`${varname}.username`, value.user.username);
                DBT.saveVariable(`${varname}.tag`, value.user.tag);
                DBT.saveVariable(`${varname}.avatarURL`, value.user.avatarURL({ dynamic: true }));
                DBT.saveVariable(`${varname}.displayAvatar`, value.user.displayAvatarURL({ format: "jpg" }));
                DBT.saveVariable(`${varname}.id`, value.user.id);
                break;
            }
        }

        DBT.nextResponse(message, args, command, "Next");
    },
};
