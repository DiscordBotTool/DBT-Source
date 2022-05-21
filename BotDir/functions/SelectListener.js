module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Select Listener",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message Rows",

    //Your outputs, leave it like this for default settings
    outputs: ["After Selected"],

    html: function (insert) {
        return `
        <label>Select ID</label>
        <input name="selectId">
        ${insert}

        <label>Select Option ID</label>
        <input name="optionId">
        ${insert}

        <label>Variable Name (example: \${dbt.variableName.author.id}</label>
        <input name="varname">
        ${insert}
        
        <label>Selectable by</label>
        <select name="type">
          <option value="author">Author only</option>
          <option value="everyone">Everyone</option>
        </select>

        <label>Author's ID (only put the id here if you selected the Author Only option)</label>
        <input name="authorId">
        ${insert}

        <label>Variable Name to save interaction in</label>
        <input name="Varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const author = DBT.parseVariables(action.authorId);
        const varname = DBT.parseVariables(action.Varname);

        DBT.bot.on("interactionCreate", async i => {
            if (!i.isSelectMenu()) return;
            DBT.saveVariable(varname, i);

            switch (action.type) {
                case "author": {
                    if (i.user.id == author) {
                        if (
                            i.values[0] === DBT.parseVariables(action.optionId) &&
                            i.customId === DBT.parseVariables(action.selectId)
                        ) {
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.username`, i.user.username);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.id`, i.user.id);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.tag`, i.user.tag);
                            DBT.saveVariable(
                                `${DBT.parseVariables(action.varname)}.author.avatar`,
                                i.user.avatarURL({ dynamic: true })
                            );

                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.id`, i.channel.id);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.name`, i.channel.name);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.pos`, i.channel.position);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.type`, i.channel.type);

                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.id`, i.guild.id);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.icon`, i.guild.icon);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.name`, i.guild.name);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.members`, i.guild.memberCount);

                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandMessage.content`, i.message.content);
                            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandMessage.id`, i.message.id);

                            DBT.nextResponse(message, args, command, "After Selected");
                        }
                    }
                    break;
                }
                case "everyone": {
                    if (
                        i.values[0] === DBT.parseVariables(action.optionId) &&
                        i.customId === DBT.parseVariables(action.selectId)
                    ) {
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.username`, i.user.username);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.id`, i.user.id);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.tag`, i.user.tag);
                        DBT.saveVariable(
                            `${DBT.parseVariables(action.varname)}.author.avatar`,
                            i.user.avatarURL({ dynamic: true })
                        );

                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.id`, i.channel.id);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.name`, i.channel.name);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.pos`, i.channel.position);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandChannel.type`, i.channel.type);

                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.id`, i.guild.id);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.icon`, i.guild.icon);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.name`, i.guild.name);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.guild.members`, i.guild.memberCount);

                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandMessage.content`, i.message.content);
                        DBT.saveVariable(`${DBT.parseVariables(action.varname)}.commandMessage.id`, i.message.id);

                        DBT.nextResponse(message, args, command, "After Selected");
                    }
                    break;
                }
            }
        });
    },
};

function createCollector(message, authorId, filter) {
    return message.channel.createMessageComponentCollector({ filter: filter, time: 6000000 });
}
