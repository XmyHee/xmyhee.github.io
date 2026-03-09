let isExplorerMode = false;
let gyro = { b: 0, g: 0 };
const nodes = [];
const nodeCount = 15; // 增加节点密度

// --- 初始化场景 [cite: 42, 43] ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 22;

// --- 1. 创建 3D 核心 [cite: 45, 46] ---
const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3, 2),
    new THREE.MeshStandardMaterial({ color: 0x5ff6ff, wireframe: true, transparent: true, opacity: 0.6 })
);
scene.add(core);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// --- 2. 创建神经元节点 [cite: 50] ---
const nodeGroup = new THREE.Group();
for(let i=0; i<nodeCount; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x5ff6ff })
    );
    // 随机分布
    node.position.set((Math.random()-0.5)*25, (Math.random()-0.5)*15, (Math.random()-0.5)*10);
    // 运动向量 [cite: 58]
    node.userData = { 
        vel: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02),
        title: "神经单元 " + (i+1),
        desc: "量子纠缠态连接中..."
    };
    nodes.push(node);
    nodeGroup.add(node);
}
scene.add(nodeGroup);

// --- 3. 神经元动态连线系统 (关键修复) ---
const lineMat = new THREE.LineBasicMaterial({ color: 0x5ff6ff, transparent: true, opacity: 0.2 });
const lineGeo = new THREE.BufferGeometry();
const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineMesh);

// --- 4. 数据雨粒子系统 [cite: 47, 48] ---
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(1500 * 3);
for(let i=0; i<rainPos.length; i++) rainPos[i] = (Math.random()-0.5)*100;
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// --- 交互功能 [cite: 53, 56] ---
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;
    
    // 视觉颜色平滑切换
    core.material.color.set(color);
    lineMat.color.set(color);
    rainMat.opacity = isExplorerMode ? 0.6 : 0;
    nodes.forEach(n => n.material.color.set(color));

    // iOS/移动端权限请求
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if(res === 'granted') window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    } else if(isExplorerMode) {
        window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    }
}

// 射线检测（点击节点）[cite: 51]
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if(intersects.length > 0) {
        const d = intersects[0].object.userData;
        document.getElementById("node-title").innerText = d.title;
        document.getElementById("node-desc").innerText = d.desc;
        document.getElementById("node-panel").style.display = "block";
    }
});
function closePanel() { document.getElementById("node-panel").style.display = "none"; }

// --- 动画主循环 [cite: 58, 59, 60] ---
function animate() {
    requestAnimationFrame(animate);

    // 核心自转与重力响应
    if (isExplorerMode) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.1;
        core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.1;
        // 数据雨向下流动
        const p = dataRain.geometry.attributes.position.array;
        for(let i=1; i<p.length; i+=3) { p[i] -= 0.5; if(p[i] < -50) p[i] = 50; }
        dataRain.geometry.attributes.position.needsUpdate = true;
    } else {
        core.rotation.y += 0.005; core.rotation.x += 0.002;
    }

    // 节点漂浮
    nodes.forEach(n => {
        n.position.add(n.userData.vel);
        if(Math.abs(n.position.x) > 12) n.userData.vel.x *= -1;
        if(Math.abs(n.position.y) > 8) n.userData.vel.y *= -1;
    });

    // 实时计算连线 (神经元算法)
    const linePositions = [];
    for(let i=0; i<nodes.length; i++) {
        for(let j=i+1; j<nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if(dist < 9) { 
                linePositions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
            }
        }
    }
    lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// 窗口自适应 [cite: 60]
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
