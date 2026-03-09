let isExplorerMode = false;
let gyro = { b: 0, g: 0 };

// --- 基础场景初始化 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(window.innerWidth < 768 ? 75 : 60, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 18;

// --- V3 镂空核心 ---
const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x5ff6ff, wireframe: true })
);
scene.add(core);

// --- 节点生成 (神经元点) ---
const nodes = [];
const nodeData = ["视觉", "语言", "量子", "控制", "感知", "决策"];
for(let i=0; i<8; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x5ff6ff, emissiveIntensity: 0.5 })
    );
    // 随机分布在核心周围
    node.position.set((Math.random()-0.5)*15, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
    node.userData = { 
        velocity: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02)
    };
    scene.add(node);
    nodes.push(node);
}

// --- 神经元连线系统 (核心新功能) ---
const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x5ff6ff, 
    transparent: true, 
    opacity: 0.3,
    blending: THREE.AdditiveBlending 
});
const lineGeometry = new THREE.BufferGeometry();
const connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(connectionLines);

// --- 数据雨系统 ---
const rainGeo = new THREE.BufferGeometry();
const rainPos = [];
for(let i=0; i<1500; i++) rainPos.push((Math.random()-0.5)*100, Math.random()*100, (Math.random()-0.5)*100);
rainGeo.setAttribute("position", new THREE.Float32BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// --- 交互与模式控制 ---
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    
    // 视觉切换
    const targetColor = isExplorerMode ? 0xff00ff : 0x5ff6ff;
    core.material.color.set(targetColor);
    lineMaterial.color.set(targetColor);
    nodes.forEach(n => n.material.color.set(targetColor));
    rainMat.opacity = isExplorerMode ? 0.5 : 0;

    // 陀螺仪权限 (同前)
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    }
}

// --- 动画循环 ---
function animate() {
    requestAnimationFrame(animate);

    // 1. 节点微动逻辑
    nodes.forEach(n => {
        n.position.add(n.userData.velocity);
        // 边界反弹
        if (Math.abs(n.position.x) > 8) n.userData.velocity.x *= -1;
        if (Math.abs(n.position.y) > 6) n.userData.velocity.y *= -1;
    });

    // 2. 更新神经元连线 (核心算法)
    const positions = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if (dist < 10) { // 连线阈值
                positions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                positions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
            }
        }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lineGeometry.attributes.position.needsUpdate = true;

    // 3. 核心自转与陀螺仪
    core.rotation.y += 0.005;
    if (isExplorerMode) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.1;
        core.rotation.z += (gyro.g * 0.001 - core.rotation.z) * 0.1;
        
        // 数据雨流动
        const p = dataRain.geometry.attributes.position.array;
        for (let i = 1; i < p.length; i += 3) {
            p[i] -= 0.4;
            if (p[i] < -50) p[i] = 50;
        }
        dataRain.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// 窗口适配
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
