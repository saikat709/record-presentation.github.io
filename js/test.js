let mediaRecorder, 
    screenVideo, 
    webcamVideo,
    drawLoop;
let screenStream,
    webcamStream,
    recordingStart, 
    timerInterval;
let recordedChunks = [], 
    pdfDoc = null, 
    currentPage = 1;

const preview     = document.getElementById('preview');
const mixCanvas   = document.getElementById('mixCanvas');
const slideCanvas = document.getElementById('slideCanvas');
const slideCtx    = slideCanvas.getContext('2d');

const startBtn    = document.getElementById('start');
const pauseBtn    = document.getElementById('pause');
const resumeBtn   = document.getElementById('resume');
const stopBtn     = document.getElementById('stop');
const timer       = document.getElementById('timer');
const dynamicInfo = document.getElementById('dynamic-info');

const pdfInput    = document.getElementById('pdfUpload');
const prevBtn     = document.getElementById('prevSlide');
const nextBtn     = document.getElementById('nextSlide');
const pageInfo    = document.getElementById('pageInfo');

// Update Timer
function updateTimer() {
  const elapsed = Math.floor((Date.now() - recordingStart) / 1000);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  timer.textContent = `${mins}:${secs}`;
}

// PDF Slide Upload
pdfInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await pdfjsLib.getDocument(
      { data: arrayBuffer }
    ).promise;
  currentPage = 1;
  renderSlide();
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  dynamicInfo.textContent = "Slides are ready. Start your recording!";
});

async function renderSlide() {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(currentPage);
  const viewport = page.getViewport({ scale: 1 });
  slideCanvas.width = viewport.width;
  slideCanvas.height = viewport.height;
  await page.render({ canvasContext: slideCtx, viewport }).promise;
  pageInfo.textContent = `Page ${currentPage} / ${pdfDoc.numPages}`;
}

// Slide Navigation
prevBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderSlide();
  }
};
nextBtn.onclick = () => {
  if (currentPage < pdfDoc.numPages) {
    currentPage++;
    renderSlide();
  }
};

// Start Recording
async function startRecording() {
  dynamicInfo.textContent = "Recording in progress...";

  screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });

  webcamStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  await screenVideo.play();

  webcamVideo = document.createElement('video');
  webcamVideo.srcObject = webcamStream;
  await webcamVideo.play();

  const screenTrack = screenStream.getVideoTracks()[0];
  const { width, height } = screenTrack.getSettings();
  mixCanvas.width = width;
  mixCanvas.height = height;
  const ctx = mixCanvas.getContext('2d');

  function draw() {
    ctx.drawImage(screenVideo, 0, 0, width, height);

    if (pdfDoc) {
      ctx.drawImage(slideCanvas, 20, 20, 350, 295);
    }

    ctx.drawImage(webcamVideo, width - 260, height - 210, 240, 190);
    drawLoop = requestAnimationFrame(draw);
  }
  draw();

  const canvasStream = mixCanvas.captureStream(30);

  // Merge Audio Streams
  const audioCtx = new AudioContext();
  const dest = audioCtx.createMediaStreamDestination();

  try {
    if (screenStream.getAudioTracks().length > 0) {
      const screenAudio = audioCtx.createMediaStreamSource(screenStream);
      screenAudio.connect(dest);
    }
    if (webcamStream.getAudioTracks().length > 0) {
      const micAudio = audioCtx.createMediaStreamSource(webcamStream);
      micAudio.connect(dest);
      console.log("Scream created.");
    } else {
        console.log("Make sure your microphone is working.");
    }
  } catch (err) {
    alert("⚠️ Audio capture error: " + err.message);
  }

  const finalStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  preview.srcObject = canvasStream;

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(finalStream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
    console.log(e.data);
  };
  mediaRecorder.onstop = () => {
    cancelAnimationFrame(drawLoop);
    clearInterval(timerInterval);
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'classroom-video.webm';
    a.click();
    dynamicInfo.textContent = "Recording complete. Downloading video...";
  };

  mediaRecorder.start();
  recordingStart = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled  = false;
};

startBtn.onclick = startRecording;

// Pause / Resume
pauseBtn.onclick = () => {
  mediaRecorder.pause();
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
};
resumeBtn.onclick = () => {
  mediaRecorder.resume();
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
};

// Stop Recording
stopBtn.onclick = () => {
  mediaRecorder.stop();
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;
  startBtn.disabled = false;
  dynamicInfo.textContent = "Please upload slides to begin.";
};


function stopStream(){
  console.log(screenStream);
  screenStream.getVideoTracks().forEach(track => {
    track.stop();
  });
  screenStream.getAudioTracks().forEach(track => {
    track.stop();
  });
}

