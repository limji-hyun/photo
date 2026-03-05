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

// 카메라 시작
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", aspectRatio: 0.75 },
            audio: false
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            startBtn.style.display = "none";
            snapBtn.style.display = "block";
        };
    } catch (err) {
        alert("카메라 연결 실패: HTTPS 환경인지 확인해주세요.");
    }
});

// 촬영 함수
snapBtn.addEventListener('click', () => {
    // 1. 프레임 로드 체크
    if (!frameImg.complete || frameImg.naturalWidth === 0) {
        alert("프레임 이미지를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    // 2. 플래시 효과
    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    // 3. 캔버스 그리기
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const tR = 3 / 4;
    let sx, sy, sw, sh;
    if (vW / vH > tR) { sw = vH * tR; sh = vH; sx = (vW - sw) / 2; sy = 0; }
    else { sw = vW; sh = vW / tR; sx = 0; sy = (vH - sh) / 2; }

    // 거울 모드 합성
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 프레임 합성 (정방향)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 4. 미리보기 적용 (이 부분이 중요합니다)
    try {
        const dataUrl = canvas.toDataURL('image/png');
        finalImageData = dataUrl;
        
        // 미리보기 이미지 로드 대기
        previewImg.onload = () => {
            video.style.display = "none";
            previewImg.style.display = "block";
            snapBtn.style.display = "none";
            previewControls.style.display = "flex"; // 여기서 버튼이 나타남
        };
        previewImg.src = dataUrl;

    } catch (e) {
        console.error("이미지 생성 오류:", e);
        alert("사진을 생성하는 중 오류가 발생했습니다.");
    }
});

// 다시 찍기
retakeBtn.addEventListener('click', () => {
    finalImageData = null;
    previewImg.style.display = "none";
    video.style.display = "block";
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
});

// 저장하기
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `my_booth_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});