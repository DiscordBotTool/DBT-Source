module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Reply To Interaction",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Interaction *</label>
        <input name="interaction">
        ${insert}

        <label>Message Row (if you want to add buttons/selects)</label>
        <input name="actionRow">
        ${insert}

        <label>Message Content *</label>
        <textarea name="msgContent"></textarea>
        ${insert}

        <label>Ephemeral *</label>
        <select name="ephemeral">
            <option selected value="true">Yes</option>
            <option value="false">No</optiom>
        </select>
        ${insert}

        <label>Variable Name</label>
        <input name="varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const variabled = DBT.parseVariables(action.msgContent);
        const interaction = DBT.parseFully(action.interaction);
        
        var row;

        if (action.actionRow?.length > 0) {
            row = JSON.parse(DBT.parseVariables(action.actionRow));
        } else {
            row = undefined;
        }
        // console.log(row);
        if (row) {
            await interaction.reply({ content: variabled, components: [row], ephemeral: JSON.parse(action.ephemeral) });
            const msg = await interaction.fetchReply();

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);

            DBT.nextResponse(message, args, command, "Next");
        } else {
            await interaction.reply({ content: variabled, ephemeral: JSON.parse(action.ephemeral) });
            const msg = await interaction.fetchReply();

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);

            DBT.nextResponse(message, args, command, "Next");
        }
    },
};
