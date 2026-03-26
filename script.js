// ===== 基础初始化 =====
const container = document.getElementById("three-container");

// 场景
const scene = new THREE.Scene();

// 相机
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 18;

// 渲染器
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// ===== 光源 =====
scene.add(new THREE.AmbientLight(0x404060));

const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// ===== 状态 =====
let isExplorerMode = false;
let useGyro = false;
let useMouseParallax = true;
let gyro = { b: 0, g: 0 };

// ===== 核心 =====
const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2, 2),
    new THREE.MeshStandardMaterial({
        color: 0x5ff6ff,
        wireframe: true,
        emissive: 0x002222
    })
);
scene.add(core);

// ===== 星云 =====
const starGeo = new THREE.BufferGeometry();
const starCount = 1500;
const starPos = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 200;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.7 })
);
scene.add(stars);

// ===== 节点 =====
const nodeData = [
    { name: "AI Vision", desc: "视觉系统" },
    { name: "NLP", desc: "语言理解" },
    { name: "Decision AI", desc: "决策系统" },
    { name: "Robotics", desc: "机器人" },
    { name: "Future Tech", desc: "未来科技" }
];

const nodes = [];

nodeData.forEach((data, i) => {
    const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 24, 24),
        new THREE.MeshStandardMaterial({
            color: 0x5ff6ff,
            emissive: 0x001111
        })
    );

    node.position.set(
        Math.cos(i * 1.2) * 8,
        Math.sin(i * 1.2) * 5,
        0
    );

    node.userData = data;
    scene.add(node);
    nodes.push(node);
});

// ===== 连线（优化：避免 O(n²)）=====
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.3
});

for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) continue;

        const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position,
            nodes[j].position
        ]);

        scene.add(new THREE.Line(geo, lineMaterial));
    }
}

// ===== Logo 优化 =====
function optimizeLogo() {
    const logoImg = document.querySelector('.logo img');
    if (!logoImg) return;

    const cdnUrl = "https://cdn.jsdelivr.net/gh/Xmyhee/Xmyhee.github.io/logo.png";

    const img = new Image();
    img.onload = () => {
        logoImg.src = cdnUrl;
        logoImg.style.opacity = 1;
    };
    img.onerror = () => {
        logoImg.src = "logo.png";
        logoImg.style.opacity = 1;
    };

    logoImg.style.opacity = 0;
    logoImg.style.transition = "opacity 0.5s";
    img.src = cdnUrl;
}
window.addEventListener("load", optimizeLogo);

// ===== Raycaster =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoverRAF = null;

// ===== 鼠标移动（节流优化）=====
window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (!hoverRAF) {
        hoverRAF = requestAnimationFrame(() => {
            raycaster.setFromCamera(mouse, camera);
            const hits = raycaster.intersectObjects(nodes);

            nodes.forEach(n => n.material.emissive.set(0x001111));

            if (hits.length) {
                hits[0].object.material.emissive.set(0x00ffff);
            }

            hoverRAF = null;
        });
    }

    if (useMouseParallax) {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        camera.position.x = x * 2;
        camera.position.y = -y * 2;
    }
});

// ===== 点击 =====
window.addEventListener("click", (e) => {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(nodes);

    if (hits.length) {
        const data = hits[0].object.userData;
        document.getElementById("node-title").innerText = data.name;
        document.getElementById("node-desc").innerText = data.desc;
        document.getElementById("node-panel").style.display = "block";
    }
});

// ===== 模式切换 =====
async function toggleExplorerMode() {
    isExplorerMode = !isExplorerMode;

    document.body.classList.toggle("machine-mode");

    const color = isExplorerMode ? 0xff00ff : 0x5ff6ff;

    core.material.color.set(color);
    lineMaterial.color.set(color);
    nodes.forEach(n => n.material.color.set(color));

    useGyro = isExplorerMode;
    useMouseParallax = !isExplorerMode;

    if (useGyro) {
        window.addEventListener("deviceorientation", handleGyro);
    } else {
        window.removeEventListener("deviceorientation", handleGyro);
    }
}

function handleGyro(e) {
    gyro.b = e.beta || 0;
    gyro.g = e.gamma || 0;
}

// ===== UI函数（保持兼容HTML）=====
function closePanel() {
    document.getElementById("node-panel").style.display = "none";
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== 动画 =====
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.y += 0.0005;
    nodes.forEach(n => n.rotation.y += 0.01);

    if (isExplorerMode && useGyro) {
        core.rotation.x += (gyro.b * 0.001 - core.rotation.x) * 0.05;
        core.rotation.y += (gyro.g * 0.001 - core.rotation.y) * 0.05;
    } else {
        core.rotation.x += 0.002;
        core.rotation.y += 0.003;
    }

    renderer.render(scene, camera);
}
animate();

// ===== 自适应 =====
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== 导出（兼容HTML）=====
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;
