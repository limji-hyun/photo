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

// [1] 입장하기 버튼 클릭 시 카메라 연결
enterBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: "user",
                // 고정된 비율 대신 해상도를 요청하여 화각을 더 넓게 확보합니다.
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play();
            homeScreen.style.display = "none";
            boothScreen.style.display = "block";
        };
    } catch (err) {
        alert("카메라 권한이 거부되었거나 지원되지 않는 브라우저입니다. HTTPS 환경인지 확인해주세요.");
    }
});

// [2] 사진 찍기 (화면에 보이는 거울 모드 그대로 저장)
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

    // 1. 캔버스를 깨끗이 비웁니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 거울 모드(좌우 반전)로 비디오 그리기
    ctx.save();
    ctx.translate(canvas.width, 0); // 좌표를 오른쪽 끝으로 이동
    ctx.scale(-1, 1);               // 좌우 반전
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();                  // 좌표계 원복 (프레임을 위해)

    // 3. 그 위에 정방향으로 프레임 이미지 덮기
    ctx.drawImage(frameImg, -1, 1, canvas.width, canvas.height);

    // 최종 데이터 추출
    finalImageData = canvas.toDataURL('image/png');
    
    // 4. 미리보기 적용
    previewImg.onload = () => {
        video.style.display = "none";
        // 실시간 프레임 가이드를 숨기기 위해 미리보기 이미지의 z-index를 높였습니다(CSS 참고)
        previewImg.style.display = "block"; 
        
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    previewImg.src = finalImageData;
});

// [3] 다시 찍기 (원상 복구)
retakeBtn.addEventListener('click', () => {
    video.style.display = "block";
    previewImg.style.display = "none";
    previewImg.src = ""; // 이전 데이터 삭제
    
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    finalImageData = null;
});

// [4] 저장하기 (다운로드)
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    link.download = `emtekinc_booth_${Date.now()}.png`;
    link.click();
});



