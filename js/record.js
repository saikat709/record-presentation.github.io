import { showNotification } from "./notification.js";

let webcamStream, screenStream;


export async function askPermission(){
    if (!screenStream) screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    });

    if (!webcamStream) webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });

    /* webcamStream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("User manually stopped screen sharing");
        showNotification();
    }); */

    return true;
};

