import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

// -----------------------------
// 场景、相机、渲染器
// -----------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 10;

// -----------------------------
// 中心旋转镂空球体
// -----------------------------
const ballGeometry = new THREE.SphereGeometry(1, 64, 64);
const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0x00bfff,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});
const hollowBall = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(hollowBall);

// 镂空线条
const wireframe = new THREE.WireframeGeometry(ballGeometry);
const line = new THREE.LineSegments(wireframe);
line.material.depthTest = true;
line.material.opacity = 0.6;
line.material.transparent = true;
line.material.color = new THREE.Color(0x00bfff);
scene.add(line);

// -----------------------------
// 环绕渐变光环
// -----------------------------
const glowRingGeometry = new THREE.TorusGeometry(1.2, 0.05, 16, 100);
const glowRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});
const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
glowRing.rotation.x = Math.PI / 2; // 水平放置
scene.add(glowRing);

// -----------------------------
// 光源
// -----------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00bfff, 0.5, 10);
pointLight.position.set(2, 2, 5);
scene.add(pointLight);

// -----------------------------
// 动画
// -----------------------------
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // 球体旋转
    hollowBall.rotation.y += 0.003;
    hollowBall.rotation.x += 0.002;
    line.rotation.copy(hollowBall.rotation);

    // 光环旋转与渐隐
    glowRing.rotation.z += 0.002;
    glowRing.material.opacity = 0.1 + 0.1 * Math.sin(time * 0.5);

    controls.update();
    renderer.render(scene, camera);
}

animate();

// -----------------------------
// 窗口自适应
// -----------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
