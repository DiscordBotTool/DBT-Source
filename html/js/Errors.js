class Error {
    constructor(message) {
        const templateStuff = document.querySelector("#errorMsg");
        const error = templateStuff.content.cloneNode(true);

        const id = Math.floor(Math.random() * (999 - 111 + 1)) + 111;

        error.querySelector(".error-text").innerText = message;
        error.querySelector(".error").id = id.toString();
        document.querySelector(".error-container").appendChild(error);

        setTimeout(() => {
            document.getElementById(id.toString()).remove();
        }, 4000);
    }
}

class Toast {
    constructor(obj) {
        const content = obj.message;
        const style = obj.style || "";

        const templateStuff = document.querySelector("#toastMsg");
        const toast = templateStuff.content.cloneNode(true);

        const id = Math.floor(Math.random() * (999 - 111 + 1)) + 111;

        toast.querySelector(".toast-text").innerText = obj.message;
        toast.querySelector(".toast").id = id.toString();
        toast.querySelector(".toast").setAttribute("style", obj.style);

        document.querySelector(".error-container").appendChild(toast);

        setTimeout(() => {
            document.getElementById(id.toString()).remove();
        }, 4000);
    }
}
