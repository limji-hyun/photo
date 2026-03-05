const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');

// 1. 카메라 권한 요청 및 시작 (iOS 팝업 유도)
startBtn.addEventListener('click', async () => {
    const constraints = {
        video: {
            facingMode: "user", // 전면 카메라
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    try {
        // 이 코드가 실행될 때 브라우저가 자동으로 '허용/비허용' 팝업을 띄웁니다.
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // iOS에서 비디오가 멈추지 않고 계속 재생되게 함
        video.setAttribute("playsinline", true);
        video.play();

        startBtn.style.display = 'none';
        snapBtn.disabled = false;
    } catch (err) {
        console.error("Camera error:", err);
        alert("카메라 접근을 허용해야 사진을 찍을 수 있습니다. 설정에서 브라우저 카메라 권한을 확인해주세요.");
    }
});

// 2. 사진 촬영 및 프레임 합성
snapBtn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    canvas.width = 600; 
    canvas.height = 800;

    // (1) 좌우 반전 처리 (거울 모드 유지하여 촬영)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // (2) 비디오 화면 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // (3) 다시 반전 복구 후 프레임 그리기 (글자나 프레임은 정방향이어야 하므로)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // 흰색 액자 프레임 합성
    ctx.lineWidth = 40;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // (4) 결과물 생성 및 저장 유도
    const dataUrl = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = dataUrl;
    
    // 클릭 시 저장 기능 추가
    img.onclick = () => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `photo_${Date.now()}.png`;
        link.click();
    };

    photosDiv.prepend(img);
    alert("사진이 찍혔습니다! 사진을 클릭하면 기기에 저장됩니다.");
});