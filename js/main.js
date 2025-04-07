import {showNotification} from "./notification.js";
import { askPermission } from "./record.js";

const permissionManageButton = document.querySelector("#manage-permission");
const permissionModal = document.querySelector("#permission-modal");
const statPreviewButton = document.querySelector("#startPreview");
const startButton = document.querySelector("#startButton");

const microphoneIcon = document.querySelector("#microphoneIcon");
const cameraIcon = document.querySelector("#cameraIcon");
const closeButton = document.querySelector("#closeButton");

const webcamIcon = document.querySelector("#webcamIcon");
const presentationIcon = document.querySelector("#presentationIcon");
const screenIcon = document.querySelector("#screenIcon");

showNotification("Hello, Man. You are nice.");


permissionManageButton.addEventListener("click", ()=>{
    permissionModal.style.display = "block";
    
    const modalCancelButton = document.querySelector("#modalCancelButton");
    const modalProceedButton = document.querySelector("#modalProceedButton");

    modalCancelButton.addEventListener("click", ()=>{
        permissionModal.style.display = "none";
    });

    modalProceedButton.addEventListener("click", async ()=>{
        await askPermission();

        permissionModal.style.display = "none";
        permissionManageButton.style.display = "none";
        document.querySelector("#permissionInfoText").style.display = "none";
        statPreviewButton.classList.remove("hidden");
        startButton.disabled = false;
    });
    
});

startPreview.addEventListener("click", ()=>{
    statPreviewButton.classList.add("hidden");
});