let isExplorerMode = false;
let gyro = { b: 0, g: 0 };
const nodes = [];
const nodeCount = 15;

// --- 初始化场景 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 22;

// --- 1. 创建3D核心 ---
const coreGeo = new THREE.IcosahedronGeometry(3, 2);
const coreMat = new THREE.MeshStandardMaterial({ color: 0x5ff6ff, wireframe: true, transparent: true, opacity: 0.6 });
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// --- 2. 创建神经元节点 ---
const nodeGroup = new THREE.Group();
for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x5ff6ff })
    );
    node.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10);
    node.userData = {
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
        title: "神经单元 " + (i + 1),
        desc: "量子纠缠态连接中..."
    };
    nodes.push(node);
    nodeGroup.add(node);
}
scene.add(nodeGroup);

// --- 3. 神经元动态连线系统 ---
const lineMat = new THREE.LineBasicMaterial({ color: 0x5ff6ff, transparent: true, opacity: 0.2 });
const lineGeo = new THREE.BufferGeometry();
const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineMesh);

// --- 4. 数据雨粒子系统 ---
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(1500 * 3);
for (let i = 0; i < rainPos.length; i++) rainPos[i] = (Math.random() - 0.5) * 100;
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.1, transparent: true, opacity: 0 });
const dataRain = new THREE.Points(rainGeo, rainMat);
scene.add(dataRain);

// --- Logo 加载优化 ---
function optimizeLogo() {
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        // 1. 使用 jsDelivr CDN 加速
        const githubPath = 'Xmyhee/Xmyhee.github.io'; // 请确认你的用户名和仓库名
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${githubPath}/logo.png`;
        
        // 2. 创建一个新图片对象来预加载CDN图片
        const preloadImg = new Image();
        preloadImg.onload = function() {
            logoImg.src = cdnUrl;
            logoImg.style.opacity = 1;
        };
        preloadImg.onerror = function() {
            // 如果CDN失败，回退到原始路径，并保持透明度
            console.log('CDN加载失败，使用原始路径');
            logoImg.src = 'logo.png';
            logoImg.style.opacity = 1;
        };
        // 开始加载CDN图片
        preloadImg.src = cdnUrl;
        
        // 初始设置透明度为0，加载完成后渐显
        logoImg.style.opacity = 0;
        logoImg.style.transition = 'opacity 0.5s';
    }
}
// 在页面加载后运行
window.addEventListener('load', optimizeLogo);

// --- 交互功能 ---
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;

    core.material.color.set(color);
    lineMat.color.set(color);
    rainMat.opacity = isExplorerMode ? 0.6 : 0;
    nodes.forEach(n => n.material.color.set(color));

    // 移动端陀螺仪
    if (isExplorerMode && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') {
                window.addEventListener("deviceorientation", handleGyro);
            }
        } catch (e) {}
    } else if (isExplorerMode) {
        window.addEventListener("deviceorientation", handleGyro);
    } else {
        window.removeEventListener("deviceorientation", handleGyro);
    }
}

function handleGyro(e) {
    gyro.b = e.beta;
    gyro.g = e.gamma;
}

// 射线检测
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if (intersects.length > 0) {
        const d = intersects[0].object.userData;
        document.getElementById("node-title").innerText = d.title;
        document.getElementById("node-desc").innerText = d.desc;
        document.getElementById("node-panel").style.display = "block";
    }
});

function closePanel() {
    document.getElementById("node-panel").style.display = "none";
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 将函数挂载到window对象上，供HTML中的onclick调用
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;

// --- 动画主循环 ---
function animate() {
    requestAnimationFrame(animate);

    if (isExplorerMode) {
        // 探索者模式：陀螺仪控制核心旋转
        if (gyro.b !== 0 || gyro.g !== 0) {
            core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.05;
            core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.05;
        }
        // 数据雨流动
        const p = dataRain.geometry.attributes.position.array;
        for (let i = 1; i < p.length; i += 3) {
            p[i] -= 0.5;
            if (p[i] < -50) p[i] = 50;
        }
        dataRain.geometry.attributes.position.needsUpdate = true;
    } else {
        // 普通模式：核心持续自动旋转
        core.rotation.y += 0.005;
        core.rotation.x += 0.002;
    }

    // 节点漂浮运动
    nodes.forEach(n => {
        n.position.add(n.userData.vel);
        if (Math.abs(n.position.x) > 12) n.userData.vel.x *= -1;
        if (Math.abs(n.position.y) > 8) n.userData.vel.y *= -1;
    });

    // 更新动态连线
    const linePositions = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if (dist < 9) {
                linePositions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
            }
        }
    }
    lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineMesh.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
