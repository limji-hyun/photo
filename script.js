// script.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');
const photoZone = document.getElementById('photo-zone'); // 터치 영역 추가

// 1. 카메라 시작
startBtn.addEventListener('click', async () => {
    const constraints = {
        video: {
            facingMode: "user",
            aspectRatio: 0.75 // 3:4
        },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        startBtn.innerText = "연결 완료";
        startBtn.disabled = true;
        snapBtn.disabled = false;
    } catch (err) {
        console.error("Camera access denied:", err);
        alert("카메라 권한이 거부되었거나 HTTPS 환경이 아닙니다.");
    }
});

// 2. 촬영 핵심 로직 (재사용을 위해 함수로 분리)
const takePhoto = () => {
    // 카메라가 아직 연결되지 않았다면 작동 안 함
    if (snapBtn.disabled) return;

    if (!frameImg.complete) {
        alert("프레임 이미지를 로드 중입니다.");
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    // 단계 1: 카메라 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 단계 2: 프레임 겹치기
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 단계 3: 저장 및 미리보기
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `photo_${Date.now()}.png`;
    link.click();

    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    photosDiv.innerHTML = "<h3>방금 저장된 사진:</h3>"; 
    photosDiv.appendChild(resultImg);
    
    // 촬영 피드백 (화면 깜빡임 효과 등 추가 가능)
    console.log("Photo Captured!");
};

// 3. 촬영 버튼 클릭 이벤트
snapBtn.addEventListener('click', takePhoto);

// 4. 프레임 영역 터치/클릭 이벤트 추가
// PC 클릭
photoZone.addEventListener('click', (e) => {
    e.preventDefault();
    takePhoto();
});

// 모바일 터치 (반응 속도를 위해 touchstart 사용 가능)
photoZone.addEventListener('touchstart', (e) => {
    // 중복 실행 방지 (클릭 이벤트와 겹치지 않게)
    // e.preventDefault(); 
    takePhoto();
}, { passive: true });