/**
 * QuestFrontiers 核心交互脚本
 * 优化项：窗口自适应、鼠标交互反馈、模式深度联动
 */

let scene, camera, renderer, core, light;
let isMachineMode = false;

// ===== 页面加载启动 =====
window.addEventListener("DOMContentLoaded", () => {
    init3D();
    initResizeListener();
});

// ===== 3D 初始化 =====
function init3D() {
    const container = document.getElementById("three-container");
    if (typeof THREE === "undefined" || !container) {
        console.error("Three.js 未能加载或容器不存在");
        return;
    }

    // 1. 场景与相机
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15;

    // 2. 渲染器优化
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance" // 强制开启高性能模式
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比，提升移动端性能
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 3. 创建几何核心 (增加细节分段使球体更圆润)
    const geometry = new THREE.IcosahedronGeometry(4, 2);
    const material = new THREE.MeshPhongMaterial({ 
        wireframe: true, 
        color: 0x5ff6ff,
        transparent: true,
        opacity: 0.8
    });
    core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // 4. 光源
    light = new THREE.PointLight(0x5ff6ff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // 增加环境光增强质感

    // 5. 鼠标交互变量
    let targetX = 0, targetY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener("mousemove", (e) => {
        // 将鼠标坐标归一化到 -1 到 1
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // 6. 动画循环
    function animate() {
        requestAnimationFrame(animate);

        // 基础旋转
        const speed = isMachineMode ? 0.015 : 0.005;
        core.rotation.x += speed;
        core.rotation.y += speed;

        // 鼠标平滑追踪 (让核心随鼠标轻微摆动)
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        core.rotation.z = targetX * 0.5;
        core.position.x = targetX * 2;
        core.position.y = targetY * 1;

        renderer.render(scene, camera);
    }

    animate();
}

// ===== 响应式窗口缩放 =====
function initResizeListener() {
    window.addEventListener("resize", () => {
        if (!camera || !renderer) return;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

// ===== UI 功能联动 =====

/**
 * 切换探索者模式
 */
function toggleExplorerMode() {
    isMachineMode = !isMachineMode;
    document.body.classList.toggle("machine-mode");

    // 联动 3D 材质颜色切换
    if (core && light) {
        const newColor = isMachineMode ? 0xff00ff : 0x5ff6ff;
        core.material.color.setHex(newColor);
        light.color.setHex(newColor);
        
        // 模式切换时的冲击感动画
        core.scale.set(1.5, 1.5, 1.5);
        setTimeout(() => core.scale.set(1, 1, 1), 200);
    }
}

/**
 * 滚动到顶部
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 控制面板
 */
function closePanel() {
    const panel = document.getElementById("node-panel");
    if (panel) panel.style.display = "none";
}

// 导出到全局环境
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;
