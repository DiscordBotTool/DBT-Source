module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Send Embed",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["DBT Developers"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
    
        <label>Channel name or ID *</label>
        <input name="channelVar">
        ${insert}

        <label>Embed Color</label>
        <input style="padding: 0;" type="color" placeholder="#FFFFFF" name="colorDBT">
        ${insert}

        <label>Embed Title</label>
        <input name="titleDBT">
        ${insert}

        <label>Embed Description</label>
        <textarea name="descriptionDBT"></textarea>
        ${insert}

        <label>Embed Author</label>
        <input name="authorDBT">
        ${insert}

        <label>Embed Author Image</label>
        <input name="authorImg">
        ${insert}

        <label>Embed Thumbnail</label>
        <input name="thumbDBT">
        ${insert}

        <label>Embed Image</label>
        <input name="imageDBT">
        ${insert}

        <label>Embed Timestamp</label>
        <input name="timestampDBT">
        ${insert}

        <label>Embed Footer</label>
        <input name="footerDBT">
        ${insert}

        <label>Embed Footer Image</label>
        <input name="footerImg">
        ${insert}

        <label>Variable Name *</label>
        <input name="varname">
        ${insert}

        <label>Action Row</label>
        <input name="actionRow">
        ${insert}
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        const { MessageEmbed } = require("discord.js");
        const Discord = require("discord.js");

        const channelVar = DBT.parseVariables(action.channelVar);
        const channel = message.guild.channels.cache.find(x => x.name === channelVar || x.id === channelVar);

        let embed = new MessageEmbed()
            .setTitle(DBT.parseVariables(action.titleDBT))
            .setDescription(DBT.parseVariables(action.descriptionDBT))
            .setThumbnail(DBT.parseVariables(action.thumbDBT))
            .setColor(DBT.parseVariables(action.colorDBT))
            .setImage(DBT.parseVariables(action.imageDBT));

        if (action.footerImg.length > 0) {
            embed.setFooter(DBT.parseVariables(action.footerDBT), DBT.parseVariables(action.footerImg));
        } else {
            embed.setFooter(DBT.parseVariables(action.footerDBT));
        }

        if (action.authorImg.length > 0) {
            embed.setAuthor(DBT.parseVariables(action.authorDBT), DBT.parseVariables(action.authorImg));
        } else {
            embed.setAuthor(DBT.parseVariables(action.authorDBT));
        }

        var row;

        if (action.actionRow?.length > 0) {
            row = JSON.parse(DBT.parseVariables(action.actionRow));
        } else {
            row = undefined;
        }

        if (row) {
            const msg = await channel.send({ embeds: [embed], components: [row] });

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);
        } else {
            const msg = await channel.send({ embeds: [embed] });

            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.content`, msg.content);
            DBT.saveVariable(`${DBT.parseVariables(action.varname)}.id`, msg.id);
        }

        DBT.nextResponse(message, args, command, "Next");
    },
};
