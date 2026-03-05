const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');

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
        alert("카메라 연결 실패: HTTPS 환경인지 확인해주세요.");
    }
});

// 2. 촬영 버튼 클릭 (터치 촬영 제외)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    const ctx = canvas.getContext('2d');
    
    // 고화질 3:4 결과물 크기 설정 (1200x1600)
    canvas.width = 1200;
    canvas.height = 1600;

    // 카메라 화면 비율 보정 (Crop)
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = 3 / 4;
    
    let sx, sy, sw, sh;
    if (videoRatio > targetRatio) {
        sw = video.videoHeight * targetRatio;
        sh = video.videoHeight;
        sx = (video.videoWidth - sw) / 2;
        sy = 0;
    } else {
        sw = video.videoWidth;
        sh = video.videoWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sh) / 2;
    }

    // (1) 비디오 그리기
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // (2) 프레임 덮기
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // (3) 결과 추출 및 저장
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `photo_${Date.now()}.png`;
    link.click();

    // 미리보기
    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    photosDiv.innerHTML = "<h2>저장 완료!</h2>"; 
    photosDiv.appendChild(resultImg);
});