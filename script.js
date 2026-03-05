const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('preview-img');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');

const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const retakeBtn = document.getElementById('retake-btn');

// 1. 카메라 시작
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", aspectRatio: 0.75 },
            audio: false
        });
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        startBtn.style.display = "none";
        snapBtn.disabled = false;
    } catch (err) {
        alert("카메라를 켤 수 없습니다. HTTPS 환경을 확인하세요.");
    }
});

// 2. 촬영 및 미리보기 적용
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    // 플래시 효과 로직...

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    // 비디오 중앙 자르기 계산
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // --- 거울 모드 저장 로직 추가 ---
    // 1. 캔버스 좌표계를 좌우 반전시킵니다.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // 2. 비디오를 그립니다 (이미 뒤집힌 상태이므로 거울 모드로 찍힙니다)
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // 3. 다시 좌표계를 원복시킨 후 프레임을 그립니다 (프레임 내 글자가 뒤집히면 안 되니까요)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');

    // 다운로드 및 미리보기 모드 전환 로직...
    previewImg.src = dataUrl;
    previewImg.style.display = "block";
    video.style.display = "none";
    snapBtn.style.display = "none";
    retakeBtn.style.display = "block";
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `selfie_${Date.now()}.png`;
    link.click();
});