const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const frameImg = document.getElementById('frame-img');
const photoZone = document.getElementById('photo-zone');
const startBtn = document.getElementById('start-btn');
const snapBtn = document.getElementById('snap-btn');
const photosDiv = document.getElementById('photos');

startBtn.addEventListener('click', async () => {
    const constraints = {
        video: { facingMode: "user", aspectRatio: 0.75 },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        await video.play();

        startBtn.style.display = "none"; // 시작 후 공간 확보를 위해 숨김
        snapBtn.disabled = false;
    } catch (err) {
        alert("카메라를 켤 수 없습니다. HTTPS 환경인지 확인해주세요.");
    }
});

function takePhoto() {
    if (snapBtn.disabled || !frameImg.complete) return;

    // 플래시 효과
    photoZone.classList.remove('flash-effect');
    void photoZone.offsetWidth;
    photoZone.classList.add('flash-effect');

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1600;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    
    // 모바일 저장 가이드 (iOS는 자동 다운로드가 안될 수 있음)
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `booth_${Date.now()}.png`;
    link.click();

    const resultImg = document.createElement('img');
    resultImg.src = dataUrl;
    photosDiv.innerHTML = "<h3>Saved! (길게 눌러 저장 가능)</h3>"; 
    photosDiv.appendChild(resultImg);
}

snapBtn.addEventListener('click', takePhoto);
// 모바일 터치 대응
photoZone.addEventListener('click', (e) => {
    e.preventDefault();
    takePhoto();
});
