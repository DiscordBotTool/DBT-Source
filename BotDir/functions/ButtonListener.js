module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Button Listener",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message Rows",

    //Your outputs, leave it like this for default settings
    outputs: ["After Clicked"],

    html: function (insert) {
        return `
        <label>Button ID</label>
        <input name="buttonId">
        ${insert}

        <label>Variable Name</label>
        <input name="varname">
        ${insert}

        <h3>
            if variable name is MYVAR<br>
            then you can get the value by:<br>
            \${dbt.MYVAR.author.id})
        </h3>
        
        <label>Button Clickable by</label>
        <select name="type">
          <option value="author">Author only</option>
          <option value="everyone">Everyone</option>
        </select>

        <label>Variable Name to save interaction in</label>
        <input name="Varname">
        ${insert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };

        const msg = await message.channel.messages.fetch(message.id || message.message.id);
        const varname = DBT.parseVariables(action.Varname);

        const collector =
            action.type == "author" ? createCollector(msg, i => i.user.id === message.author.id) : createCollector(msg, i => i);

        collector.on("collect", async i => {
            if (!i.isButton()) return;
            DBT.saveVariable(varname, i);

            if (action.type == "author" && i.user.id !== message.author.id) return;

            if (i.customId === DBT.parseVariables(action.buttonId)) {
                DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.username`, i.user.username);
                DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.id`, i.user.id);
                DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.tag`, i.user.tag);
                DBT.saveVariable(`${DBT.parseVariables(action.varname)}.author.avatar`, i.user.avatarURL({ dynamic: true }));

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

                DBT.nextResponse(message, args, command, "After Clicked");
            }
        });
    },
};

function createCollector(message, filter) {
    return message.channel.createMessageComponentCollector({ filter: filter, time: 6000000 });
}
