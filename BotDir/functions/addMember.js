module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Add Member",

    //Place the mods authors here, you can add other authors like this: ["user", "user2"]
    author: ["Miro#5410"],

    //Place the description of this mod here
    description: "Official Mod",

    //Place the verison of this mod here
    version: "1.0.0",

    //Category the mod can be found in
    category: "Threads",

    //Your outputs, leave it like this for default settings
    outputs: ["Next"],

    //Place the HTML to show inside of Discord Bot Agent
    html: function (insert) {
        return `
        <label>Channel id or name</label>
        <input name="channel">
        ${insert}

        <label>Thread Name</label>
        <input name="threadName">
        ${insert}

        <label>Thread Member</label>
        <input name="threadUser">
        ${insert}
        `;
    },
    startup: function (DBT) {},
    execute: async function (DBT, action, index, message, args, command) {
        const channel = message.guild.channels.cache.find(
            x => x.id === DBT.parseVariables(action.channel) || x.name === DBT.parseVariables(action.channel)
        );

        const thread = message.channel.threads.cache.find(x => x.name === DBT.parseVariables(action.threadName));
        thread.members.add(DBT.parseVariables(action.threadUser));

        DBT.nextResponse(message, args, command, "Next");
    },
};
