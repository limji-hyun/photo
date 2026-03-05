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

    // 플래시 효과
    photoZone.classList.remove('flash-effect');
    void photoZone.offsetWidth;
    photoZone.classList.add('flash-effect');

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    // 비디오 중앙 자르기(Crop) 계산
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 합성과정
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');

    // 다운로드 실행
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `booth_${Date.now()}.png`;
    link.click();

    // 미리보기 모드 전환
    previewImg.src = dataUrl;
    previewImg.style.display = "block"; // 사진 보여주기
    video.style.display = "none";      // 카메라 숨기기
    
    snapBtn.style.display = "none";    // 촬영 버튼 숨기기
    retakeBtn.style.display = "block"; // 다시 찍기 버튼 보이기
});

// 3. 다시 찍기 (카메라로 복귀)
retakeBtn.addEventListener('click', () => {
    previewImg.style.display = "none"; // 미리보기 숨기기
    video.style.display = "block";     // 카메라 보이기
    
    snapBtn.style.display = "block";   // 촬영 버튼 보이기
    retakeBtn.style.display = "none";  // 다시 찍기 버튼 숨기기
});