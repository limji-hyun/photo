const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('preview-img');
const frameImg = document.getElementById('frame-img');
const dateOverlay = document.getElementById('date-overlay');
const snapBtn = document.getElementById('snap-btn');
const saveBtn = document.getElementById('save-btn');
const retakeBtn = document.getElementById('retake-btn');
const enterBtn = document.getElementById('enter-btn');
const previewControls = document.getElementById('preview-controls');
const photoZone = document.getElementById('photo-zone');

let finalImageData = null;

// 날짜 포맷 (YYYY.MM.DD HH:mm)
function getFormattedDateTime() {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// 실시간 날짜 표시
setInterval(() => { dateOverlay.innerText = getFormattedDateTime(); }, 1000);
dateOverlay.innerText = getFormattedDateTime();

// [btn1] 입장하기
enterBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 } },
            audio: false
        });
        video.srcObject = stream;
        document.getElementById('home-screen').style.display = "none";
        document.getElementById('booth-screen').style.display = "flex";
    } catch (err) { alert("카메라 접근 권한을 허용해주세요."); }
});

// [btn2] 사진 찍기
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const targetRatio = 3 / 4;
    let sW, sH, sX, sY;

    if (vW / vH > targetRatio) {
        sW = vH * targetRatio; sH = vH;
        sX = (vW - sW) / 2; sY = 0;
    } else {
        sW = vW; sH = vW / targetRatio;
        sX = 0; sY = (vH - sH) / 2;
    }

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 프레임 합성 (좌표 0,0 고정)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 날짜 합성
    ctx.font = "500 42px 'Mona', sans-serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(getFormattedDateTime(), canvas.width / 2, 70);

    finalImageData = canvas.toDataURL('image/png');
    previewImg.src = finalImageData;
    previewImg.onload = () => {
        video.style.opacity = "0";
        previewImg.style.display = "block";
        // 버튼 전환
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
});

// [btn4] 다시 찍기
retakeBtn.addEventListener('click', () => {
    video.style.opacity = "1";
    previewImg.style.display = "none";
    snapBtn.style.display = "block";
    previewControls.style.display = "none";
    finalImageData = null;
});

// [btn3] 저장하기
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `photo_${Date.now()}.png`;
    link.click();
});



