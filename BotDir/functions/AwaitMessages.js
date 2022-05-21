module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Await Messages",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Asynchronous",

    //Your outputs, leave it like this for default settings
    outputs: ["Next", "On Error"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Time (format: 5s, 5m, 5hr, 5d) *</label>
        <input name="time">
        ${insert}

        <label>Amount messages to await *</label>
        <input name="amount">
        ${insert}

        <label>Channel Name or ID *</label>
        <input name="channel">
        ${insert}

        <label>Variable Name</label>
        <input name="varname">
        ${insert}

        <h3>
            if variable name is MYVAR<br>
            then you can get the value by:<br>
            \${dbt.MYVAR.message.content}
            \${dbt.MYVAR.guild.id}
            \${dbt.MYVAR.author.id}
            \${dbt.MYVAR.channel.id}
            You can also use 
        </h3>

        <label>Await messages from author only?</label>
        <select name="bots">
            <option selected value="true">Yes</option>
            <option value="false">No</option>
        </select>
        `;
    },
    startup: function (DBT) {
        DBT.requireModule("ms");
    },

    execute: async function (DBT, action, index, message, args, command) {
        const ms = require("ms");

        const filter = m => m.author.id === message.author.id;
        const varname = DBT.parseVariables(action.varname);

        const channel = message.guild.channels.cache.find(
            x => x.id === DBT.parseVariables(action.channel) || x.name === DBT.parseVariables(action.channel)
        );

        message.channel
            .awaitMessages({
                filter,
                max: 5,
                time: 3000,
            })
            .then(collected => {
                const msg = collected.first();

                DBT.saveVariable(`${varname}.author.username`, msg.author.username);
                DBT.saveVariable(`${varname}.author.id`, msg.author.id);
                DBT.saveVariable(`${varname}.author.tag`, msg.author.tag);
                DBT.saveVariable(`${varname}.author.avatarURL`, msg.author.avatarURL({ dynamic: true }));

                DBT.saveVariable(`${varname}.channel.id`, msg.channel.id);
                DBT.saveVariable(`${varname}.channel.name`, msg.channel.name);
                DBT.saveVariable(`${varname}.channel.pos`, msg.channel.position);
                DBT.saveVariable(`${varname}.channel.type`, msg.channel.type);

                DBT.saveVariable(`${varname}.guild.id`, msg.guild.id);
                DBT.saveVariable(`${varname}.guild.icon`, msg.guild.icon);
                DBT.saveVariable(`${varname}.guild.name`, msg.guild.name);
                DBT.saveVariable(`${varname}.guild.members`, msg.guild.memberCount);

                DBT.saveVariable(`${varname}.message.content`, msg.content);
                DBT.saveVariable(`${varname}.message.id`, msg.id);

                DBT.nextResponse(msg, args, command, "Next");
            })
            .catch(err => {
                DBT.nextResponse(message, args, command, "Error");
            });
    },
};
