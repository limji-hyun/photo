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

    // 플래시 효과
    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    
    // 1. 캔버스 크기를 프레임의 실제 해상도로 고정 (매우 중요)
    canvas.width = 1200;
    canvas.height = 1600;

    // 2. 카메라 영상 크롭 계산 (3:4 비율로 중앙 자르기)
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const targetRatio = 3 / 4;
    
    let sW, sH, sX, sY;

    if (vW / vH > targetRatio) {
        // 영상이 가로로 더 길 때
        sH = vH;
        sW = vH * targetRatio;
        sX = (vW - sW) / 2;
        sY = 0;
    } else {
        // 영상이 세로로 더 길 때
        sW = vW;
        sH = vW / targetRatio;
        sX = 0;
        sY = (vH - sH) / 2;
    }

    // 3. 비디오 그리기 (좌우 반전)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 4. 프레임 그리기 (이미지 경로가 img/frame.png인지 확인하세요)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 5. 날짜 합성
    const currentDateTime = getFormattedDateTime();
    ctx.font = "500 42px 'Mona', sans-serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // 화면상의 17px 위치를 1600px 캔버스 비율에 맞게 계산 (약 70px)
    ctx.fillText(currentDateTime, canvas.width / 2, 70);

    // 6. 결과 출력
    finalImageData = canvas.toDataURL('image/png');
    previewImg.src = finalImageData;
    previewImg.onload = () => {
        video.style.opacity = "0";
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
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


