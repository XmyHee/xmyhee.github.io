let isExplorerMode = false;
let gyro = { b: 0, g: 0 };

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(window.innerWidth < 768 ? 75 : 60, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);

camera.position.z = 18;

// V3 核心模型 [cite: 3]
const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x5ff6ff, wireframe: true })
);
scene.add(core);

// 数据雨粒子系统
const rainCount = 2000;
const rainGeo = new THREE.BufferGeometry();
const rainPos = [];
for(let i=0; i<rainCount; i++) {
    rainPos.push((Math.random()-0.5)*100, Math.random()*100, (Math.random()-0.5)*100);
}
rainGeo.setAttribute("position", new THREE.Float32BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// 陀螺仪与模式切换
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");

    // iOS 权限申请
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    } else if (isExplorerMode) {
        window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    }

    // 动画效果：数据雨显现
    rainMat.opacity = isExplorerMode ? 0.6 : 0;
    core.material.color.set(isExplorerMode ? 0xff00ff : 0x5ff6ff);
}

// 动画主循环
function animate() {
    requestAnimationFrame(animate);

    // 基础旋转
    core.rotation.y += 0.005;
    
    // 陀螺仪联动
    if (isExplorerMode) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.1;
        core.rotation.z += (gyro.g * 0.001 - core.rotation.z) * 0.1;

        // 数据雨流动逻辑
        const positions = dataRain.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.5; // 向下坠落
            if (positions[i] < -50) positions[i] = 50; // 回到顶部
        }
        dataRain.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// 适配与交互 [cite: 19]
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
