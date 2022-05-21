module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Send Webhook Embed",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["koki1019"],

    //Place the description of this mod here
    description: "Example Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Message",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (varInsert) {
        return `
        <label>Webhook URL *</label>
        <input name="webhook">
        ${varInsert}

        <label for="colorDBT">Embed Color</label>
        <input type="color" placeholder="#FFFFFF" name="colorDBT">
        ${varInsert}

        <label for="titleDBT">Embed Title</label>
        <input name="titleDBT">
        ${varInsert}

        <label for="descriptionDBT">Embed Description</label>
        <textarea name="descriptionDBT"></textarea>
        ${varInsert}

        <label for="authorDBT">Embed Author</label>
        <input name="authorDBT">
        ${varInsert}

        <label for="authorDBT">Embed Author Image</label>
        <input name="authorImg">
        ${varInsert}

        <label for="thumbDBT">Embed Thumbnail</label>
        <input name="thumbDBT">
        ${varInsert}

        <label for="imageDBT">Embed Image</label>
        <input name="imageDBT">
        ${varInsert}

        <label for="timestampDBT">Embed Timestamp</label>
        <input name="timestampDBT">
        ${varInsert}

        <label for="footerDBT">Embed Footer</label>
        <input name="footerDBT">
        ${varInsert}

        <label for="footerDBT">Embed Footer Image</label>
        <input name="footerImg">
        ${varInsert}
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const Discord = require("discord.js");
        const webhook = new Discord.WebhookClient({ url: DBT.parseVariables(action.webhook) });

        let embed = new Discord.MessageEmbed()
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

        webhook.send({ embeds: [embed] });

        DBT.nextResponse(message, args, command, "Next");
    },
};
