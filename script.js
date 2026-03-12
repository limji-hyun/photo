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

// [2] 입장하기: 카메라 연결 (이미지 클릭)
enterBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 } },
            audio: false
        });
        video.srcObject = stream;
        document.getElementById('home-screen').style.display = "none";
        document.getElementById('booth-screen').style.display = "block";
    } catch (err) {
        alert("카메라 권한이 필요합니다.");
    }
});

// [3] 사진 촬영 및 합성 (날짜 위치 및 폰트 유지)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    // 플래시 애니메이션
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

    // 비디오 반전해서 그리기
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 프레임 합성 (정방향)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 날짜 텍스트 합성 (Mona 폰트, 검은색, 위치 유지)
    const currentDateTime = getFormattedDateTime();
    // 캔버스 크기(1200) 기준 폰트 크기
    ctx.font = "500 42px Mona, sans-serif";
    ctx.fillStyle = "#000000"; // 검은색
    ctx.textAlign = "center";
    ctx.shadowBlur = 0; // 그림자 제거
    // 상단 top: 17px 비율에 맞춘 캔버스 좌표 (약 65px~70px)
    ctx.fillText(currentDateTime, canvas.width / 2, 70);

    finalImageData = canvas.toDataURL('image/png');
    
    previewImg.onload = () => {
        video.style.opacity = "0"; 
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        document.getElementById('preview-controls').style.display = "flex";
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

