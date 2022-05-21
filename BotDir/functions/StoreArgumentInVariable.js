module.exports = {
    //This is what will be shown inside Discord Bot Agent
    name: "Store Argument In Variable",

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
        <label>Variable name *</label>
        <input name="variable">
        ${insert}

        <label>Parameter Number *</label>
        <input name="parameter">
        ${insert}
        
        <h4 style="color: grey;">
            If the user types {command} discord bot<br>
            then parameter number "1" is discord<br>
            and parameter number "2" is bot
            <br><br>
            type 0 to take all the text as an argument<br>
            type 1 to take the first argument<br>
            type 1+ to take argument one and the text after it
        </h4>
        `;
    },

    //This will be executed when the bot is first started
    startup: function (DBT) {},

    //Place the mod here
    execute: async function (DBT, action, index, message, args, command) {
        const value = DBT.parseVariables(action.parameter);

        if (value === "0") {
            DBT.saveVariable(action.variable, args.join(" "));
        } else if (value.includes("+")) {
            let num = parseInt(value.replace("+", ""));
            if (num <= 0) num = 1;
            const argsToSave = args.slice(num - 1).join(" ");

            DBT.saveVariable(action.variable, DBT.parseVariables(argsToSave));
        } else {
            DBT.saveVariable(action.variable, DBT.parseVariables(args[value - 1]));
        }

        DBT.nextResponse(message, args, command, "Next");
    },
};
