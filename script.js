const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('preview-img');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');

const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const saveBtn = document.getElementById('save-btn');
const retakeBtn = document.getElementById('retake-btn');
const previewControls = document.getElementById('preview-controls');

let finalImageData = null;

// 1. 카메라 시작하기
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", aspectRatio: 0.75 },
            audio: false
        });
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        // 버튼 상태 변경
        startBtn.style.display = "none";
        snapBtn.style.display = "block";
    } catch (err) {
        alert("카메라를 켤 수 없습니다. HTTPS 환경을 확인하세요.");
    }
});

// 2. 사진 찍기 (미리보기 화면으로 전환)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    // 플래시 효과
    photoZone.classList.remove('flash-effect');
    void photoZone.offsetWidth;
    photoZone.classList.add('flash-effect');

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    // 중앙 Crop 계산
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 거울 모드 합성
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    
    // 프레임 합성 (정방향 원복)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 이미지 데이터 임시 보관
    finalImageData = canvas.toDataURL('image/png');
    previewImg.src = finalImageData;

    // [중요] 비디오만 숨기고 프레임은 유지됨 (CSS z-index 덕분)
    video.style.display = "none";
    previewImg.style.display = "block";
    
    // 버튼 상태 변경
    snapBtn.style.display = "none";
    previewControls.style.display = "flex";
});

// 3. 다시 찍기 (카메라 화면으로 복구)
retakeBtn.addEventListener('click', () => {
    video.style.display = "block";
    previewImg.style.display = "none";
    
    snapBtn.style.display = "block";
    previewControls.style.display = "none";
    finalImageData = null;
});

// 4. 이대로 저장하기 (사용자가 눌렀을 때만 다운로드)
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `booth_photo_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});