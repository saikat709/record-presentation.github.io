export function showNotification(  message, title = "Notice..."){
    const el      = document.querySelector("#notification");
    const titleEl   = document.querySelector("#notification .title");
    const messageEl = document.querySelector("#notification .message");

    titleEl.innerText = title;
    messageEl.innerText = message;

    el.classList.remove("notification-open");
    el.classList.remove("notification-close");

    el.classList.add("notification-open");


    el.addEventListener("animationend", ()=>{
        el.classList.remove("notification-open");
        el.classList.add("notification-close");
        el.addEventListener("animationend", ()=>{
            el.classList.remove("notification-close");
        });
    });
}

