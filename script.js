const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');

// 1. 카메라 시작 (정방향 설정)
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: "user",
                aspectRatio: 0.75 // 3:4 요청
            },
            audio: false
        });
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        startBtn.style.display = "none";
        snapBtn.disabled = false;
    } catch (err) {
        alert("카메라를 시작할 수 없습니다. (HTTPS 환경 필수)");
    }
});

// 2. 사진 촬영 및 정밀 합성
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) return;

    const ctx = canvas.getContext('2d');
    
    // 결과물 해상도 (3:4 비율)
    canvas.width = 1200;
    canvas.height = 1600;

    // 비디오 원본 비율 계산 (중앙 자르기 로직)
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const targetRatio = 3 / 4;
    
    let sx, sy, sw, sh;

    if (videoWidth / videoHeight > targetRatio) {
        // 비디오가 더 넓을 때 (가로를 자름)
        sw = videoHeight * targetRatio;
        sh = videoHeight;
        sx = (videoWidth - sw) / 2;
        sy = 0;
    } else {
        // 비디오가 더 길 때 (세로를 자름)
        sw = videoWidth;
        sh = videoWidth / targetRatio;
        sx = 0;
        sy = (videoHeight - sh) / 2;
    }

    // 단계 1: 카메라 화면을 중앙에서 잘라 캔버스에 가득 채움 (정방향)
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // 단계 2: 프레임 이미지를 캔버스 전체에 덮음
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 단계 3: 파일 저장 및 미리보기
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `my_booth_${Date.now()}.png`;
    link.click();

    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    photosDiv.innerHTML = "<h2>Saved!</h2>"; 
    photosDiv.appendChild(resultImg);
});