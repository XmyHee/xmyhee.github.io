let isExplorerMode = false;
let gyro = { b: 0, g: 0 };
const nodes = [];
const nodeCount = 12;

// --- 初始化场景 [cite: 102, 103] ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(window.innerWidth < 768 ? 75 : 60, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 20;

// --- 1. 创建 V3 镂空核心 [cite: 105, 106] ---
const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3, 2),
    new THREE.MeshStandardMaterial({ color: 0x5ff6ff, wireframe: true, transparent: true, opacity: 0.8 })
);
scene.add(core);
scene.add(new THREE.PointLight(0x5ff6ff, 2).set(10, 10, 10));

// --- 2. 创建神经元节点 [cite: 111] ---
const nodeGroup = new THREE.Group();
for(let i=0; i<nodeCount; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x5ff6ff })
    );
    node.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*12, (Math.random()-0.5)*10);
    node.userData = { 
        velocity: new THREE.Vector3((Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03, (Math.random()-0.5)*0.03),
        name: "神经单元 " + (i+1), desc: "正在同步实时神经信号..."
    };
    nodes.push(node);
    nodeGroup.add(node);
}
scene.add(nodeGroup);

// --- 3. 动态神经元连线系统 (核心改进) ---
const lineMat = new THREE.LineBasicMaterial({ color: 0x5ff6ff, transparent: true, opacity: 0.3 });
const lineGeo = new THREE.BufferGeometry();
const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineMesh);

// --- 4. 数据雨粒子系统 [cite: 107, 108] ---
const rainCount = 1200;
const rainPos = new Float32Array(rainCount * 3);
for(let i=0; i<rainCount*3; i++) rainPos[i] = (Math.random()-0.5)*100;
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// --- 交互与模式控制 [cite: 116] ---
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;
    
    // 视觉反馈
    core.material.color.set(color);
    lineMat.color.set(color);
    rainMat.opacity = isExplorerMode ? 0.6 : 0;
    nodes.forEach(n => n.material.color.set(color));

    // 移动端重力感应请求
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if(res === 'granted') window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    } else if(isExplorerMode) {
        window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    }
}

// 射线检测与面板 [cite: 112, 114]
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if(intersects.length > 0) {
        document.getElementById("node-title").innerText = intersects[0].object.userData.name;
        document.getElementById("node-desc").innerText = intersects[0].object.userData.desc;
        document.getElementById("node-panel").style.display = "block";
    }
});

function closePanel() { document.getElementById("node-panel").style.display = "none"; }

// --- 动画循环 [cite: 118, 119] ---
function animate() {
    requestAnimationFrame(animate);

    // 1. 核心自转与重力响应
    if (isExplorerMode) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.1;
        core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.1;
        // 数据雨流动
        const p = dataRain.geometry.attributes.position.array;
        for(let i=1; i<p.length; i+=3) { p[i] -= 0.6; if(p[i] < -50) p[i] = 50; }
        dataRain.geometry.attributes.position.needsUpdate = true;
    } else {
        core.rotation.y += 0.005; core.rotation.x += 0.002;
    }

    // 2. 节点微动
    nodes.forEach(n => {
        n.position.add(n.userData.velocity);
        if(Math.abs(n.position.x) > 12) n.userData.velocity.x *= -1;
        if(Math.abs(n.position.y) > 8) n.userData.velocity.y *= -1;
    });

    // 3. 实时计算“神经元”连接 (距离感应算法)
    const linePositions = [];
    for(let i=0; i<nodes.length; i++) {
        for(let j=i+1; j<nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if(dist < 9) { // 连线阈值
                linePositions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
            }
        }
    }
    lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// 窗口自适应 [cite: 120]
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = window.innerWidth < 768 ? 75 : 60;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
