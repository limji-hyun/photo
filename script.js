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

    // 플래시 애니메이션 효과
    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    
    // 1. 캔버스 해상도를 3:4 표준 해상도로 고정
    canvas.width = 1200;
    canvas.height = 1600;

    // 2. 비디오 소스 크기 및 비율 계산
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const targetRatio = 3 / 4;
    
    let sW, sH, sX, sY;

    // 비디오의 중앙을 3:4 비율로 자르기 위한 계산
    if (vW / vH > targetRatio) {
        sW = vH * targetRatio;
        sH = vH;
        sX = (vW - sW) / 2;
        sY = 0;
    } else {
        sW = vW;
        sH = vW / targetRatio;
        sX = 0;
        sY = (vH - sH) / 2;
    }

    // 3. 배경 이미지(비디오) 그리기 (좌우 반전)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 4. 프레임 합성 (가장 중요: 좌표 0,0에서 캔버스 크기만큼 꽉 채우기)
    // 이 부분이 어긋나면 프레임이 위나 아래로 쏠려 보입니다.
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 5. 날짜 합성 (Mona 폰트)
    const currentDateTime = getFormattedDateTime();
    ctx.font = "500 42px 'Mona', sans-serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // 상단 17px 위치 (1600px 해상도 비율 계산 시 약 70px 지점)
    ctx.fillText(currentDateTime, canvas.width / 2, 40);

    // 6. 결과 출력 및 미리보기 전환
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
    
    // 버튼 교체
    previewControls.style.display = "none"; // btn3, btn4 숨기기
    snapBtn.style.display = "block";       // btn2 보이기
    
    finalImageData = null;
    previewImg.src = "";
});

// 촬영 성공 시 로직 보완
// snapBtn 클릭 이벤트 마지막 부분
previewImg.onload = () => {
    video.style.opacity = "0";
    previewImg.style.display = "block";
    
    snapBtn.style.display = "none";         // btn2 숨기기
    previewControls.style.display = "flex"; // btn3, btn4 보이기
};

// [5] 저장하기
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `emtekinc_booth_${Date.now()}.png`;
    link.click();
});





