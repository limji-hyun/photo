const homeScreen = document.getElementById('home-screen');
const boothScreen = document.getElementById('booth-screen');
const enterBtn = document.getElementById('enter-btn');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('preview-img');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');
const dateOverlay = document.getElementById('date-overlay');
const snapBtn = document.getElementById('snap-btn');
const saveBtn = document.getElementById('save-btn');
const retakeBtn = document.getElementById('retake-btn');
const previewControls = document.getElementById('preview-controls');

let finalImageData = null;

// [1] 날짜 형식 업데이트 함수
function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// 실시간 날짜 업데이트
setInterval(() => {
    dateOverlay.innerText = getFormattedDateTime();
}, 1000);
dateOverlay.innerText = getFormattedDateTime();

// [2] 입장하기
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
        alert("카메라를 켤 수 없습니다.");
    }
});

// [3] 사진 촬영 및 합성
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

    // 비디오 좌우 반전 합성
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 프레임 합성
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 날짜 텍스트 합성 (검은색 글씨)
    const currentDateTime = getFormattedDateTime();
    ctx.font = "500 42px Mona, sans-serif"; // 1200x1600 해상도 비례 크기
    ctx.fillStyle = "#000000"; // 검은색
    ctx.textAlign = "center";
    ctx.shadowBlur = 0; // 그림자 제거
    // 상단 17px 비율에 맞춘 캔버스 y좌표 (약 65~70px)
    ctx.fillText(currentDateTime, canvas.width / 2, 70);

    finalImageData = canvas.toDataURL('image/png');
    
    previewImg.onload = () => {
        video.style.opacity = "0"; 
        previewImg.style.display = "block";
        dateOverlay.style.display = "block"; 
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    previewImg.src = finalImageData;
});

// [4] 다시 찍기
retakeBtn.addEventListener('click', () => {
    video.style.opacity = "1";
    previewImg.style.display = "none";
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    finalImageData = null;
    previewImg.src = "";
});

// [5] 저장하기
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `emtekinc_booth_${Date.now()}.png`;
    link.click();
});
