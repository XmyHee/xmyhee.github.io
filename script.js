let isExplorerMode = false;
let gyro = { b: 0, g: 0 };
const nodes = [];
const nodeCount = 12;

// --- 初始化场景 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(window.innerWidth < 768 ? 75 : 60, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);

camera.position.z = 20;

// --- 1. 创建 V3 镂空核心 ---
const coreGeo = new THREE.IcosahedronGeometry(3, 2);
const coreMat = new THREE.MeshStandardMaterial({ 
    color: 0x5ff6ff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.8 
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// --- 2. 创建神经元节点 ---
const nodeGroup = new THREE.Group();
for(let i=0; i<nodeCount; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x5ff6ff })
    );
    node.position.set((Math.random()-0.5)*18, (Math.random()-0.5)*12, (Math.random()-0.5)*10);
    node.userData = { 
        velocity: new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02),
        name: "神经元单元 " + (i+1),
        desc: "正在处理实时并发流数据..."
    };
    nodes.push(node);
    nodeGroup.add(node);
}
scene.add(nodeGroup);

// --- 3. 神经元连线系统 ---
const lineMat = new THREE.LineBasicMaterial({ color: 0x5ff6ff, transparent: true, opacity: 0.3 });
let lineGeo = new THREE.BufferGeometry();
const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineMesh);

// --- 4. 数据雨粒子系统 ---
const rainCount = 1500;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);
for(let i=0; i<rainCount*3; i++) rainPos[i] = (Math.random()-0.5)*100;
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// --- 交互逻辑 ---

async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    
    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;
    coreMat.color.set(color);
    lineMat.color.set(color);
    rainMat.opacity = isExplorerMode ? 0.6 : 0;
    nodes.forEach(n => n.material.color.set(color));

    // 陀螺仪请求
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if(res === 'granted') window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    } else if(isExplorerMode) {
        window.addEventListener("deviceorientation", e => { gyro.b = e.beta; gyro.g = e.gamma; });
    }
}

// 射线检测（点击节点）
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if(intersects.length > 0) openPanel(intersects[0].object.userData);
});

function openPanel(data) {
    document.getElementById("node-title").innerText = data.name;
    document.getElementById("node-desc").innerText = data.desc;
    document.getElementById("node-panel").style.display = "block";
}
function closePanel() { document.getElementById("node-panel").style.display = "none"; }

// --- 动画循环 ---
function animate() {
    requestAnimationFrame(animate);

    // 1. 核心与重力感应
    if (isExplorerMode) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.1;
        core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.1;
        
        // 数据雨流动
        const p = dataRain.geometry.attributes.position.array;
        for(let i=1; i<p.length; i+=3) {
            p[i] -= 0.5;
            if(p[i] < -50) p[i] = 50;
        }
        dataRain.geometry.attributes.position.needsUpdate = true;
    } else {
        core.rotation.y += 0.005;
        core.rotation.x += 0.002;
    }

    // 2. 节点运动与边界检查
    nodes.forEach(n => {
        n.position.add(n.userData.velocity);
        if(Math.abs(n.position.x) > 10) n.userData.velocity.x *= -1;
        if(Math.abs(n.position.y) > 8) n.userData.velocity.y *= -1;
    });

    // 3. 实时计算连线 (神经元连接算法)
    const linePositions = [];
    for(let i=0; i<nodes.length; i++) {
        for(let j=i+1; j<nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if(dist < 8) { // 连接阈值
                linePositions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
            }
        }
    }
    lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// 自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = window.innerWidth < 768 ? 75 : 60;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
