const homeScreen = document.getElementById('home-screen');
const boothScreen = document.getElementById('booth-screen');
const enterBtn = document.getElementById('enter-btn');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('preview-img');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');
const snapBtn = document.getElementById('snap-btn');
const saveBtn = document.getElementById('save-btn');
const retakeBtn = document.getElementById('retake-btn');
const previewControls = document.getElementById('preview-controls');

let finalImageData = null;

// 입장하기
enterBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
            audio: false
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            homeScreen.style.display = "none";
            boothScreen.style.display = "block";
        };
    } catch (err) {
        alert("카메라를 시작할 수 없습니다.");
    }
});

// 촬영
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 1. 비디오 반전해서 그리기 (거울 모드 저장)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 2. 프레임 정방향으로 그리기
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    finalImageData = canvas.toDataURL('image/png');
    
    previewImg.onload = () => {
        video.style.display = "none";
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    previewImg.src = finalImageData;
});

// 다시 찍기
retakeBtn.addEventListener('click', () => {
    previewImg.style.display = "none";
    video.style.display = "block";
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    finalImageData = null;
    previewImg.src = "";
});

// 저장
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `emtekinc_${Date.now()}.png`;
    link.click();
});
