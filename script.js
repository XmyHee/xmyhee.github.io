// ===== 等待 THREE 加载 =====
window.addEventListener("DOMContentLoaded", () => {
    init3D();
});

// ===== 3D初始化 =====
function init3D() {
    if (typeof THREE === "undefined") {
        console.warn("THREE 未加载");
        return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-container").appendChild(renderer.domElement);

    // 光源
    const light = new THREE.PointLight(0x5ff6ff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);

    // 核心
    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2, 2),
        new THREE.MeshBasicMaterial({ wireframe: true, color: 0x5ff6ff })
    );
    scene.add(core);

    function animate() {
        requestAnimationFrame(animate);
        core.rotation.x += 0.002;
        core.rotation.y += 0.003;
        renderer.render(scene, camera);
    }

    animate();
}

// ===== UI功能 =====
function toggleExplorerMode() {
    document.body.classList.toggle("machine-mode");
}

function closePanel() {
    document.getElementById("node-panel").style.display = "none";
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== 全局导出 =====
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;
