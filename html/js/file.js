async function deleteFile(fileNameInput, te) {
	let fileName = fileNameInput.trimRight();
	let selectedBot = await ipcRenderer.invoke("selected");
	if (fs.existsSync(`${selectedBot.path}/data/files/${fileName}`)) {
		if (!fs.existsSync(`${selectedBot.path}/data/deleted_files/${fileName}`)) {
			fs.move(`${selectedBot.path}/data/files/${fileName}`, `${selectedBot.path}/data/deleted_files/${fileName}`, (err) => {
				if (err) throw err;
				let fileBtn = document.getElementById(fileNameInput);
				let fileSpan = document.getElementById(`span-${fileName}`);
				fileSpan.remove();
				fileBtn.remove();
				new Error(`SUCCESS: ${fileName} has been removed!`);
			});
		} else if (fs.existsSync(`${selectedBot.path}/data/deleted_files`)) {
			console.log("manually removing file..");
			fs.unlinkSync(`${selectedBot.path}/data/files/${fileName}`, (err) => {
				if (err) throw err;
				let fileBtn = document.getElementById(fileNameInput);
				let fileSpan = document.getElementById(`span-${fileName}`);
				fileSpan.remove();
				fileBtn.remove();
				new Error(`SUCCESS: ${fileName} has been removed!`);
			});
		}
	} else if (!fs.existsSync(`${selectedBot.path}/data/files`)) {
		fs.mkdir(`${selectedBot.path}/data/files`, (err) => {
			if (err) throw err;
			new Error(`The 'files' folder has been created.`);
		});
	}
}
async function upadateFileList() {
	const fileList = document.getElementById("fileList");
	fileList.innerText = ``;
	const { ipcRenderer } = require("electron");
	let selectedBot = await ipcRenderer.invoke("selected");
	const files = fs.readdirSync(`${selectedBot.path}/data/files`);
	files.sort();
	for (i = 0; i < files.length; i++) {
		const filename = files[i].replace(/^.*[\\\/]/, "");
		const fileName_ = files[i].toString();
		fileList.innerHTML += `<h3><span class="spreadsheetFileName" style="display:flex;flex-wrap:wrap;width:3rem" id="span-${fileName_}">${filename}</span><button onclick="deleteFile(this.id, this.dataset.identify)"id="${fileName_} "data-identify="${i}"  data-fileName="${fileName_}" class="red fileDeleteBtn">DELETE</button></h3>`;
	}
}

function dirErr(path, dirBtn) {
	dirBtn.setAttribute("class", "red");
	path.innerHTML = "<span style='color: red'>ERROR: Unprovided directory</span>";
	path.style.display = "block";
	new Error("ERROR: You didnt provide a valid directory ");
}
function clicked(identifier) {
	const ele = document.getElementById(identifier);
	if ((ele.style.display = "none")) {
		div.style.display = "block";
	} else if ((div.style.display = "block")) {
		div.style.display = "none";
	}
}
const { ifError } = require("assert");
const path = require("path");

async function getDir() {
	/*Setup (s) */
	const dirBtn = document.getElementById("fileDirBtn");
	const path = document.getElementById("path");
	let selectedBot = await ipcRenderer.invoke("selected");
	let _path = await ipcRenderer.invoke("getFilePath");
	const configJSON = `${selectedBot.path}/data/files/config.json`;

	/*Validation */
	if (!_path || _path.startsWith(undefined)) return dirErr(path, dirBtn);
	dirBtn.setAttribute("class", "blue");

	if (path) {
		path.style.display = "block";
		path.innerText = `PATH: ${_path}`;
	}
	const fileDir = `${selectedBot.path}/data/files`;
	if (!fs.existsSync(fileDir)) {
		console.log("starting to create..");
		fs.mkdir(fileDir, (err) => {
			if (err) throw err;
		});
		window.location.reload();
	}
	const file = fs.readFileSync(_path);
	const filename = _path.replace(/^.*[\\\/]/, "");
	fs.writeFileSync(`${fileDir}/${filename}`, file, (err) => {
		if (err) {
			fs.deleteFileSync(`${fileDir}/${filename}`, (err) => {
				if (err) throw err;
			});
			console.log("test");
		}
		window.location.reload();
	});
	console.log("created file");
	dirBtn.setAttribute("class", "green");
}
