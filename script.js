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
        snapBtn.style.display = "block";
    } catch (err) {
        alert("카메라 연결 실패: HTTPS 환경을 확인하세요.");
    }
});

// 2. 촬영 버튼 클릭 (미리보기 생성)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) {
        alert("프레임 이미지가 로드되지 않았습니다.");
        return;
    }

    // 플래시 효과
    photoZone.classList.remove('flash-effect');
    void photoZone.offsetWidth;
    photoZone.classList.add('flash-effect');

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 거울 모드 저장용 합성
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    
    // 프레임 합성 (정방향 원복)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 캔버스 데이터를 이미지 소스로 전달
    finalImageData = canvas.toDataURL('image/png');
    
    // 이미지가 로드된 후 화면 전환 (안정성 확보)
    previewImg.onload = () => {
        video.style.display = "none";
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    
    previewImg.src = finalImageData;
});

// 3. 다시 찍기
retakeBtn.addEventListener('click', () => {
    previewImg.style.display = "none";
    video.style.display = "block";
    
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    
    finalImageData = null;
    previewImg.src = ""; // 소스 초기화
});

// 4. 저장하기
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `booth_photo_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});