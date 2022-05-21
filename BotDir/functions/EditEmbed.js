module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Edit Embed",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Miro#5410"],

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
        <label>Channel ID or name *</label>
        <input name="editEmbedChannel">
        ${insert}

        <label>Message ID *</label>
        <input name="editEmbedMsg">
        ${insert}

        <label>Embed Color</label>
        <input type="color" placeholder="#FFFFFF" name="colorEDIT">
        ${insert}

        <label>Embed Title</label>
        <input name="titleEDIT">
        ${insert}

        <label>Embed Description</label>
        <textarea name="descriptionEDIT"></textarea>
        ${insert}

        <label>Embed Author</label>
        <input name="authorEDIT">
        ${insert}

        <label>Embed Author Image</label>
        <input name="authorImgEdit">
        ${insert}

        <label>Embed Thumbnail</label>
        <input name="thumbEDIT">
        ${insert}

        <label>Embed Image</label>
        <input name="imageEDIT">
        ${insert}

        <label>Embed Timestamp</label>
        <input name="timestampEDIT">
        ${insert}

        <label>Embed Footer</label>
        <input name="footerEDIT">
        ${insert}

        <label>Embed Footer Image</label>
        <input name="footerImgEdit">
        ${insert}
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        const { MessageEmbed } = require("discord.js");
        const Discord = require("discord.js");

        const channelVar = DBT.parseVariables(action.editEmbedChannel);
        const channel = message.guild.channels.cache.find(x => x.id === channelVar || x.name === channelVar);

        const msg = await channel.messages.fetch(DBT.parseVariables(action.editEmbedMsg));

        let embed = new MessageEmbed()
            .setTitle(DBT.parseVariables(action.titleEDIT))
            .setDescription(DBT.parseVariables(action.descriptionEDIT))
            .setThumbnail(DBT.parseVariables(action.thumbEDIT))
            .setColor(DBT.parseVariables(action.colorEDIT))
            .setImage(DBT.parseVariables(action.imageEDIT));

        if (action.footerImgEdit.length > 0) {
            embed.setFooter(DBT.parseVariables(action.footerEDIT), DBT.parseVariables(action.footerImgEdit));
        } else {
            embed.setFooter(DBT.parseVariables(action.footerEDIT));
        }

        if (action.authorImgEdit.length > 0) {
            embed.setAuthor(DBT.parseVariables(action.authorEDIT), DBT.parseVariables(action.authorImgEdit));
        } else {
            embed.setAuthor(DBT.parseVariables(action.authorEDIT));
        }

        msg.edit({ embeds: [embed] });
        DBT.nextResponse(message, args, command, "Next");
    },
};
