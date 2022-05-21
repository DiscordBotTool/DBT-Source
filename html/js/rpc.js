const discordRPC = require("discord-rpc");

const ELECTRON = require("electron");

function changeRPC(message, imageURL) {
    ELECTRON.ipcRenderer.invoke("setRPC", message, imageURL);
}

function setBot(botID, token) {
    ELECTRON.ipcRenderer.invoke("setBot", botID, token);
}
