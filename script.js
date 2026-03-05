// script.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');

// 1. 카메라 시작 함수
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
        
        // iOS에서 비디오가 멈추지 않도록 설정
        video.setAttribute("playsinline", true);
        await video.play();

        startBtn.innerText = "연결 완료";
        startBtn.disabled = true;
        snapBtn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("카메라 권한이 거부되었거나 HTTPS 환경이 아닙니다.");
    }
});

// 2. 촬영 및 합성 저장 함수
function takePhoto() {
    // 카메라가 켜지지 않았거나 프레임 로드가 안됐으면 중단
    if (snapBtn.disabled || !frameImg.complete) return;

    // 플래시 시각 효과
    photoZone.classList.remove('flash-effect');
    void photoZone.offsetWidth; // 브라우저가 애니메이션을 초기화하도록 강제
    photoZone.classList.add('flash-effect');

    const ctx = canvas.getContext('2d');
    
    // 고화질 저장용 크기 설정 (3:4 비율)
    canvas.width = 1200;
    canvas.height = 1600;

    // (1) 카메라 화면 먼저 그리기 (정방향)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // (2) 그 위에 프레임 이미지 덮어쓰기
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // (3) 이미지 데이터 생성
    const dataUrl = canvas.toDataURL('image/png');
    
    // (4) 즉시 다운로드 실행
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `my_photo_${Date.now()}.png`;
    link.click();

    // 미리보기 이미지 표시
    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    photosDiv.innerHTML = "<h3>Saved!</h3>"; 
    photosDiv.appendChild(resultImg);
}

// 3. 촬영 버튼 클릭 시 실행
snapBtn.addEventListener('click', takePhoto);

// 4. 프레임 영역 터치/클릭 시 실행
photoZone.addEventListener('click', (e) => {
    e.preventDefault();
    takePhoto();
});
