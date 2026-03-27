/**
 * QuestFrontiers 核心交互脚本
 * 优化项：窗口自适应、鼠标交互反馈、模式深度联动、✅ 粒子系统
 */

let scene, camera, renderer, core, light;
let particles; // ✅ 粒子系统变量
let isMachineMode = false;

// 鼠标交互变量
let targetX = 0, targetY = 0;
let mouseX = 0, mouseY = 0;

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
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 3. 创建几何核心
    const geometry = new THREE.IcosahedronGeometry(4, 2);
    const material = new THREE.MeshPhongMaterial({ 
        wireframe: true, 
        color: 0x5ff6ff,
        transparent: true,
        opacity: 0.7
    });
    core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // 4. ✅ 初始化漂浮粒子
    initParticles();

    // 5. 光源
    light = new THREE.PointLight(0x5ff6ff, 1.2);
    light.position.set(15, 15, 15);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // 6. 鼠标移动监听
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // 7. 动画循环
    function animate() {
        requestAnimationFrame(animate);

        const baseSpeed = 0.003;
        const modeMultiplier = isMachineMode ? 4 : 1;
        
        // 核心旋转
        if (core) {
            core.rotation.x += baseSpeed * modeMultiplier;
            core.rotation.y += baseSpeed * 1.5 * modeMultiplier;
        }

        // ✅ 粒子漂浮动画
        if (particles) {
            // 让粒子整体缓慢旋转
            particles.rotation.y += 0.0005 * modeMultiplier;
            particles.rotation.x += 0.0002;
            
            // 粒子随鼠标轻微摆动 (增加景深感)
            particles.position.x += (mouseX * 0.5 - particles.position.x) * 0.02;
            particles.position.y += (mouseY * 0.3 - particles.position.y) * 0.02;
        }

        // 核心鼠标平滑追踪
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        
        if (core) {
            core.rotation.z = targetX * 0.3;
            core.position.x = targetX * 2;
            core.position.y = targetY * 1;
        }

        renderer.render(scene, camera);
    }

    animate();
}

/**
 * ✅ 3. 初始化漂浮粒子系统
 */
function initParticles() {
    const particleCount = 2500; // 粒子数量
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3); // 每个粒子 XYZ 三个坐标

    // 在指定范围内随机分布粒子
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 60;     // X
        positions[i + 1] = (Math.random() - 0.5) * 60; // Y
        positions[i + 2] = (Math.random() - 0.5) * 40; // Z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 粒子材质 (使用 PointsMaterial)
    const material = new THREE.PointsMaterial({
        color: 0x5ff6ff,
        size: 0.12,          // 粒子大小
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending, // 叠加增强亮度
        depthWrite: false,   // 防止粒子遮挡粒子
        sizeAttenuation: true // 随距离衰减
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
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

function toggleExplorerMode() {
    isMachineMode = !isMachineMode;
    document.body.classList.toggle("machine-mode");

    // 联动 3D 材质和粒子颜色切换
    if (core && light && particles) {
        const newColor = isMachineMode ? 0xff00ff : 0x5ff6ff;
        
        // 核心颜色
        core.material.color.setHex(newColor);
        // 光源颜色
        light.color.setHex(newColor);
        // ✅ 粒子颜色同步切换
        particles.material.color.setHex(newColor);
        
        // 冲击感动画
        core.scale.set(1.4, 1.4, 1.4);
        setTimeout(() => core.scale.set(1, 1, 1), 200);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closePanel() {
    const panel = document.getElementById("node-panel");
    if (panel) panel.style.display = "none";
}

// 导出到全局
window.toggleExplorerMode = toggleExplorerMode;
window.closePanel = closePanel;
window.scrollToTop = scrollToTop;
