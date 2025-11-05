// 소문자 (아두이노와 동일하게 입력)
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"; 
const WRITE_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"; 
let writeChar, statusP, connectBtn;

// 원의 색상을 저장할 변수
let circleColor;

// 버튼들
let button1, button2, button3;

// 애니메이션 변수들
let circleY; // 원의 y 위치
let circleBaseY; // 원의 기본 y 위치 (중앙)
let velocity; // 속도
let gravity; // 중력
let bounce; // 바운스 감쇠
let isAnimating; // 애니메이션 중인지 여부

// 가속도 센서 변수들
let accelBtn; // 가속도 센서 활성화 버튼
let accelStatus; // 가속도 센서 상태 텍스트
let accelData; // 가속도 데이터 표시 텍스트
let accelX = 0, accelY = 0, accelZ = 0; // 가속도 값
let isAccelEnabled = false; // 가속도 센서 활성화 여부

// 굴러다니는 작은 원 변수들
let smallCircleX, smallCircleY; // 작은 원의 위치
let smallCircleVX = 0, smallCircleVY = 0; // 작은 원의 속도
let smallCircleRadius = 10; // 작은 원의 반지름 (지름 20)

function setup() {
  createCanvas(windowWidth, windowHeight);

  // BLE 연결
  connectBtn = createButton("Scan & Connect");
  connectBtn.mousePressed(connectAny);
  connectBtn.size(120, 30);
  connectBtn.position(20, 40);

  statusP = createP("Status: Not connected");
  statusP.position(22, 60);

  // 색상 버튼들 생성
  button1 = createButton("빨강");
  button1.mousePressed(() => { changeColor(color(255, 0, 0)); });
  button1.size(100, 40);
  button1.position(20, 100);

  button2 = createButton("초록");
  button2.mousePressed(() => { changeColor(color(0, 255, 0)); });
  button2.size(100, 40);
  button2.position(130, 100);

  button3 = createButton("파랑");
  button3.mousePressed(() => { changeColor(color(0, 0, 255)); });
  button3.size(100, 40);
  button3.position(240, 100);

  // 초기 색상 설정 (기본값: 검정)
  circleColor = color(0);
  
  // 애니메이션 초기화
  circleBaseY = height / 2;
  circleY = circleBaseY;
  velocity = 0;
  gravity = 0.8;
  bounce = 0.7; // 바운스 감쇠 계수 (1에 가까울수록 더 많이 튐)
  isAnimating = false;
  
  // 가속도 센서 버튼 및 텍스트 생성
  accelBtn = createButton("가속도 센서 활성화");
  accelBtn.mousePressed(enableAccelerometer);
  accelBtn.size(150, 40);
  accelBtn.position(20, 150);
  
  accelStatus = createP("가속도 센서: 비활성화");
  accelStatus.position(22, 190);
  accelStatus.style('font-size', '12px');
  
  accelData = createP("X: 0.00, Y: 0.00, Z: 0.00");
  accelData.position(22, 210);
  accelData.style('font-size', '12px');
  
  // 작은 원 초기화 (중앙)
  smallCircleX = width / 2;
  smallCircleY = height / 2;
}

function draw() {
  background(220);
  
  // 애니메이션 업데이트
  if (isAnimating) {
    velocity += gravity; // 중력 적용
    circleY += velocity; // 위치 업데이트
    
    // 바닥에 닿았을 때 튀어오르기
    if (circleY >= circleBaseY) {
      circleY = circleBaseY;
      velocity = -velocity * bounce; // 반대 방향으로 튀어오름
      
      // 속도가 충분히 작아지면 애니메이션 종료
      if (abs(velocity) < 0.5) {
        velocity = 0;
        circleY = circleBaseY;
        isAnimating = false;
      }
    }
  }
  
  // 중앙에 크기 200인 원 그리기
  fill(circleColor);
  noStroke();
  circle(width / 2, circleY, 200);
  
  // 가속도 센서가 활성화된 경우 작은 원 업데이트 및 그리기
  if (isAccelEnabled) {
    // 가속도를 속도에 적용 (감쇠 적용)
    const sensitivity = 0.5; // 감도 조절
    smallCircleVX += accelX * sensitivity;
    smallCircleVY += accelY * sensitivity;
    
    // 마찰 적용 (속도 감쇠)
    smallCircleVX *= 0.95;
    smallCircleVY *= 0.95;
    
    // 위치 업데이트
    smallCircleX += smallCircleVX;
    smallCircleY += smallCircleVY;
    
    // 캔버스 경계에서 튕기기
    if (smallCircleX < smallCircleRadius) {
      smallCircleX = smallCircleRadius;
      smallCircleVX = -smallCircleVX * 0.8;
    }
    if (smallCircleX > width - smallCircleRadius) {
      smallCircleX = width - smallCircleRadius;
      smallCircleVX = -smallCircleVX * 0.8;
    }
    if (smallCircleY < smallCircleRadius) {
      smallCircleY = smallCircleRadius;
      smallCircleVY = -smallCircleVY * 0.8;
    }
    if (smallCircleY > height - smallCircleRadius) {
      smallCircleY = height - smallCircleRadius;
      smallCircleVY = -smallCircleVY * 0.8;
    }
    
    // 기울기를 계산 (가속도 기반)
    let rotationAngle = atan2(accelY, accelX);
    
    // 작은 파란색 원 그리기
    push();
    translate(smallCircleX, smallCircleY);
    rotate(rotationAngle);
    fill(0, 0, 255); // 파란색
    noStroke();
    circle(0, 0, 20); // 지름 20
    // 기울기 표시를 위한 작은 선
    stroke(255);
    strokeWeight(2);
    line(0, 0, smallCircleRadius, 0);
    pop();
  }
}

// 색상 변경 함수 (애니메이션 시작)
function changeColor(newColor) {
  circleColor = newColor;
  // 튀어오르기 시작
  velocity = -15; // 위로 튀어오르는 초기 속도
  isAnimating = true;
}

// 창 크기 변경 시 호출
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 기본 위치 업데이트 (애니메이션 중이 아닐 때만)
  if (!isAnimating) {
    circleBaseY = height / 2;
    circleY = circleBaseY;
  } else {
    circleBaseY = height / 2;
  }
  // 작은 원 위치도 업데이트
  if (!isAccelEnabled) {
    smallCircleX = width / 2;
    smallCircleY = height / 2;
  }
}

// 가속도 센서 활성화 함수
function enableAccelerometer() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    // iOS 13+ 의 경우 권한 요청 필요
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          startAccelerometer();
        } else {
          accelStatus.html('가속도 센서: 권한 거부됨');
          isAccelEnabled = false;
        }
      })
      .catch(console.error);
  } else {
    // Android나 다른 브라우저의 경우 바로 시작
    startAccelerometer();
  }
}

// 가속도 센서 시작
function startAccelerometer() {
  window.addEventListener('devicemotion', handleMotion);
  isAccelEnabled = true;
  accelStatus.html('가속도 센서: 활성화됨');
  accelBtn.html('가속도 센서 비활성화');
  accelBtn.mousePressed(disableAccelerometer);
}

// 가속도 센서 비활성화
function disableAccelerometer() {
  window.removeEventListener('devicemotion', handleMotion);
  isAccelEnabled = false;
  accelStatus.html('가속도 센서: 비활성화');
  accelBtn.html('가속도 센서 활성화');
  accelBtn.mousePressed(enableAccelerometer);
  // 작은 원을 중앙으로 리셋
  smallCircleX = width / 2;
  smallCircleY = height / 2;
  smallCircleVX = 0;
  smallCircleVY = 0;
}

// 가속도 데이터 처리
function handleMotion(event) {
  if (event.accelerationIncludingGravity) {
    // 가속도 값 가져오기 (m/s²)
    accelX = event.accelerationIncludingGravity.x || 0;
    accelY = event.accelerationIncludingGravity.y || 0;
    accelZ = event.accelerationIncludingGravity.z || 0;
    
    // 텍스트 업데이트
    accelData.html(`X: ${accelX.toFixed(2)}, Y: ${accelY.toFixed(2)}, Z: ${accelZ.toFixed(2)}`);
  }
}

// ---- BLE Connect ----
async function connectAny() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID],
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    writeChar = await service.getCharacteristic(WRITE_UUID);
    statusP.html("Status: Connected to " + (device.name || "device"));
  } catch (e) {
    statusP.html("Status: Error - " + e);
    console.error(e);
  }
}

// ---- Write 1 byte to BLE ----
async function sendNumber(n) {
  if (!writeChar) {
    statusP.html("Status: Not connected");
    return;
  }
  try {
    await writeChar.writeValue(new Uint8Array([n & 0xff]));
    statusP.html("Status: Sent " + n);
  } catch (e) {
    statusP.html("Status: Write error - " + e);
  }
}
