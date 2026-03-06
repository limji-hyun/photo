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
            video: { facingMode: "user", aspectRatio: 0.75 },
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

// [2] 사진 찍기 (거울 모드로 합성 및 저장)
snapBtn.addEventListener('click', () => {
    if (!frameImg.complete) {
        alert("프레임을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    // 플래시 효과
    photoZone.classList.add('flash-effect');
    setTimeout(() => photoZone.classList.remove('flash-effect'), 300);

    const ctx = canvas.getContext('2d');
    
    // 고화질 저장용 해상도 설정 (3:4 비율)
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

    // --- 거울 모드 합성을 위한 좌표계 반전 ---
    // 캔버스 좌표를 오른쪽 끝으로 이동시킨 후, 가로축 비율을 -1로 설정하여 뒤집습니다.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // 카메라 화면을 캔버스에 그리기 (거울 모드 적용됨)
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // --- 프레임 합성을 위해 좌표계 원복 ---
    // 프레임 이미지까지 뒤집히면 그 안의 글자가 거꾸로 나오기 때문에, 좌표를 다시 정상으로 돌려놓습니다.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 그 위에 프레임 이미지 그리기
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 최종 이미지 데이터 추출 (PNG)
    finalImageData = canvas.toDataURL('image/png');
    
    // 미리보기 이미지 로드 완료 시 화면 전환
    previewImg.onload = () => {
        video.style.display = "none";
        previewImg.style.display = "block";
        snapBtn.style.display = "none";
        previewControls.style.display = "flex";
    };
    previewImg.src = finalImageData;
});

// [3] 다시 찍기
retakeBtn.addEventListener('click', () => {
    video.style.display = "block";
    previewImg.style.display = "none";
    previewControls.style.display = "none";
    snapBtn.style.display = "block";
    finalImageData = null;
    previewImg.src = ""; // 미리보기 이미지 초기화
});

// [4] 저장하기 (다운로드)
saveBtn.addEventListener('click', () => {
    if (!finalImageData) return;
    const link = document.createElement('a');
    link.href = finalImageData;
    // 파일명에 시간 정보 추가
    link.download = `booth_photo_${Date.now()}.png`;
    link.click();
});
