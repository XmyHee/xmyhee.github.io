// 初始化场景 [cite: 8]
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);
camera.position.z = 18;

// 光源
const light = new THREE.PointLight(0x5ff6ff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// V3 核心：镂空旋转几何体 [cite: 8]
const coreGeo = new THREE.IcosahedronGeometry(2.5, 2);
const coreMat = new THREE.MeshStandardMaterial({
    color: 0x5ff6ff,
    wireframe: true, // 镂空效果
    emissive: 0x002222
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// 星云粒子
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<1500; i++) {
    starPos.push((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0x5ff6ff, size: 0.2 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// 节点数据与生成
const nodeData = [
    {name:"AI Vision", desc:"视觉神经系统"},
    {name:"NLP", desc:"语言理解引擎"},
    {name:"Quantum Compute", desc:"量子计算单元"},
    {name:"Robotics", desc:"自动化控制"},
    {name:"Neural Link", desc:"脑机接口预研"}
];
const nodes = [];
nodeData.forEach((data, i) => {
    const geo = new THREE.SphereGeometry(0.4, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x5ff6ff, emissive: 0x001111 });
    const node = new THREE.Mesh(geo, mat);
    node.position.x = Math.cos(i * 1.2) * 9;
    node.position.y = Math.sin(i * 1.2) * 6;
    node.userData = data;
    scene.add(node);
    nodes.push(node);
});

// 交互：射线检测 [cite: 8]
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // 鼠标视差效果
    camera.position.x = (e.clientX / window.innerWidth - 0.5) * 2;
    camera.position.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener("click", () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    if (intersects.length > 0) {
        openPanel(intersects[0].object.userData);
    }
});

// UI 控制函数
function openPanel(data) {
    const panel = document.getElementById("node-panel");
    document.getElementById("node-title").innerText = data.name;
    document.getElementById("node-desc").innerText = data.desc;
    panel.style.display = "block";
}

function closePanel() {
    document.getElementById("node-panel").style.display = "none";
}

function toggleExplorerMode() {
    document.body.classList.toggle("machine-mode");
    // 切换模式时改变核心颜色
    core.material.color.set(document.body.classList.contains("machine-mode") ? 0xff00ff : 0x5ff6ff);
}

function scrollToTop() {
    window.scrollTo({top: 0, behavior: "smooth"});
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 核心旋转
    core.rotation.x += 0.002;
    core.rotation.y += 0.003;
    
    // 星云自转
    stars.rotation.y += 0.0003;
    
    // 节点微动
    nodes.forEach(n => {
        n.position.y += Math.sin(Date.now() * 0.001) * 0.002;
    });

    renderer.render(scene, camera);
}

// 窗口适配
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
