const minimize = document.querySelector("[minimize]");
const maximize = document.querySelector("[maximize]");
const Close = document.querySelector("[close]");

const Title_Electron = require("electron");
const { toNamespacedPath } = require("path");

Close.addEventListener("click", (e) => {
	Title_Electron.ipcRenderer.invoke("close");
});

minimize.addEventListener("click", (e) => {
	Title_Electron.ipcRenderer.invoke("minimize");
});

maximize.addEventListener("click", (e) => {
	Title_Electron.ipcRenderer.invoke("maximize");
});
