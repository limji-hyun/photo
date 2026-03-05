const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');

// 1. 카메라 시작
startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", aspectRatio: 0.75 },
            audio: false
        });
        video.srcObject = stream;
        video.play();
        startBtn.disabled = true;
        snapBtn.disabled = false;
    } catch (err) {
        alert("HTTPS 환경이 필요합니다.");
    }
});

// 2. 촬영 및 합성 저장
snapBtn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    
    // 프레임 이미지의 실제 해상도에 맞춰 캔버스 크기 조절
    // 만약 img.png가 고화질이라면 그 크기를 따르는 것이 가장 좋습니다.
    canvas.width = frameImg.naturalWidth || 1200;
    canvas.height = frameImg.naturalHeight || 1600;

    // 단계 1: 비디오(카메라) 화면 그리기
    // 좌우반전이 없으므로 그대로 그립니다.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 단계 2: 프레임 이미지 그리기 (비디오 위에 덮어쓰기)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 단계 3: 최종 결과물 저장
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `my_frame_photo_${Date.now()}.png`;
    link.click();
    
    // 갤러리에 미리보기
    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    resultImg.style.width = "100%";
    document.getElementById('photos').innerHTML = ""; 
    document.getElementById('photos').appendChild(resultImg);
});