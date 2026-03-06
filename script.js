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

// [1] 입장하기: 카메라 권한 요청 후 화면 전환
enterBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", aspectRatio: 0.75 },
            audio: false
        });
        
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play();
            homeScreen.style.display = "none";
            boothScreen.style.display = "block";
        };
    } catch (err) {
        alert("카메라를 시작할 수 없습니다. HTTPS 환경인지 확인해주세요.");
    }
});

// [2] 사진 찍기 (합성 및 미리보기 생성)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    // 플래시 애니메이션
    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    // 비디오 중앙 Crop 좌표 계산
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 거울 모드 합성을 위해 좌표계 반전
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 프레임 합성 (프레임은 뒤집지 않음)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    finalImageData = canvas.toDataURL('image/png');
    
    // 미리보기 이미지 로드 완료 시 화면 전환
    previewImg.onload = () => {
        video.style.display = "none";
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    previewImg.src = finalImageData;
});

// [3] 다시 찍기 (카메라 상태로 복귀)
retakeBtn.addEventListener('click', () => {
    previewImg.style.display = "none";
    video.style.display = "block";
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    finalImageData = null;
    previewImg.src = "";
});

// [4] 저장하기 (다운로드)
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `emtekinc_booth_${Date.now()}.png`;
    link.click();
});