// ===== 初始化场景 =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 18;

// ===== 光源 =====
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);
const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// ===== 全局变量 =====
let isExplorerMode = false;
let gyro = { b: 0, g: 0 };
let useGyro = false;
let useMouseParallax = true; // 普通模式启用鼠标视差

// ===== 1. AI核心（V3镂空二十面体）=====
const coreGeo = new THREE.IcosahedronGeometry(2, 2);
const coreMat = new THREE.MeshStandardMaterial({
    color: 0x5ff6ff,
    wireframe: true,
    emissive: 0x002222
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// ===== 2. 星云粒子（V3）=====
const starGeo = new THREE.BufferGeometry();
const starCount = 1500;
const starPos = [];
for (let i = 0; i < starCount; i++) {
    starPos.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.7 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ===== 3. 节点（V3椭圆分布）=====
const nodeData = [
    { name: "AI Vision", desc: "视觉系统" },
    { name: "NLP", desc: "语言理解" },
    { name: "Decision AI", desc: "决策系统" },
    { name: "Robotics", desc: "机器人" },
    { name: "Future Tech", desc: "未来科技" }
];
const nodes = [];
nodeData.forEach((data, i) => {
    const geo = new THREE.SphereGeometry(0.35, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x5ff6ff,
        emissive: 0x001111
    });
    const node = new THREE.Mesh(geo, mat);
    node.position.x = Math.cos(i * 1.2) * 8;
    node.position.y = Math.sin(i * 1.2) * 5;
    node.userData = data;
    scene.add(node);
    nodes.push(node);
});

// ===== 4. 节点之间的连线（V3全连接）=====
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.35
});
nodes.forEach(a => {
    nodes.forEach(b => {
        if (a !== b) {
            const points = [a.position.clone(), b.position.clone()];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMaterial);
            scene.add(line);
        }
    });
});

// ===== Logo加载优化（CDN加速+渐显）=====
function optimizeLogo() {
    const logoImg = document.querySelector('.logo img');
    if (logoImg) {
        const githubPath = 'Xmyhee/Xmyhee.github.io'; // 请确认用户名
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${githubPath}/logo.png`;
        const preloadImg = new Image();
        preloadImg.onload = () => {
            logoImg.src = cdnUrl;
            logoImg.style.opacity = 1;
        };
        preloadImg.onerror = () => {
            logoImg.src = 'logo.png';
            logoImg.style.opacity = 1;
        };
        preloadImg.src = cdnUrl;
        logoImg.style.opacity = 0;
        logoImg.style.transition = 'opacity 0.5s';
    }
}
window.addEventListener('load', optimizeLogo);

// ===== 交互功能 =====
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;
    document.body.classList.toggle("machine-mode");
    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;

    // 切换颜色
    core.material.color.set(color);
    lineMaterial.color.set(color);
    nodes.forEach(n => n.material.color.set(color));

    // 切换控制方式
    useGyro = isExplorerMode;
    useMouseParallax = !isExplorerMode;

    // 移动端陀螺仪
    if (useGyro && typeof DeviceOrientationEvent?.requestPermission === 'function') {
        try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') {
                window.addEventListener("deviceorientation", handleGyro);
            }
        } catch (e) { }
    } else if (useGyro) {
        window.addEventListener("deviceorientation", handleGyro);
    } else {
        window.removeEventListener("deviceorientation", handleGyro);
    }
}
function handleGyro(e) {
    gyro.b = e.beta;
    gyro.g = e.gamma;
}

// 射线检测（Hover + Click）
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// hover 高亮
window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    nodes.forEach(n => n.material.emissive.set(0x001111));
    if (intersects.length > 0) {
        intersects[0].object.material.emissive.set(0x00ffff);
    }

    // 鼠标视差（仅在普通模式启用）
    if (useMouseParallax) {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        camera.position.x = x * 2;
        camera.position.y = -y * 2;
    }
});

// 点击显示面板
window.addEventListener("click", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        document.getElementById("node-title").innerText = data.name;
        document.getElementById("node-desc").innerText = data.desc;
        document.getElementById("node-panel").style.display = "block";
    }
});

// 关闭面板
function closePanel() {
    document.getElementById("node-panel").style.display = "none";
}

// 滚动驱动核心旋转
window.addEventListener("scroll", () => {
    const s = window.scrollY;
    core.rotation.y = s * 0.002;
});

// 回到顶部
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 导出全局函数供HTML调用
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;

// ===== 动画循环 =====
function animate() {
    requestAnimationFrame(animate);

    // 星云和节点自转（不受模式影响）
    stars.rotation.y += 0.0005;
    nodes.forEach(n => n.rotation.y += 0.01);

    if (isExplorerMode) {
        // 探索者模式：优先陀螺仪，否则自动旋转
        if (useGyro && (gyro.b !== 0 || gyro.g !== 0)) {
            core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.05;
            core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.05;
        } else {
            // 无陀螺仪数据时，使用与普通模式相同的自动旋转
            core.rotation.x += 0.002;
            core.rotation.y += 0.003;
        }
    } else {
        // 普通模式：自动旋转
        core.rotation.x += 0.002;
        core.rotation.y += 0.003;
    }

    renderer.render(scene, camera);
}
animate();

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
