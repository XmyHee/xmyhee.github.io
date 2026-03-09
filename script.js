const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

const renderer = new THREE.WebGLRenderer({
alpha:true,
antialias:true
})

renderer.setSize(window.innerWidth,window.innerHeight)

document
.getElementById("three-container")
.appendChild(renderer.domElement)

camera.position.z=18



/* 光源 */

const light = new THREE.PointLight(0x00f0ff,2)

light.position.set(10,10,10)

scene.add(light)



/* AI核心 */

const coreGeo = new THREE.IcosahedronGeometry(2,2)

const coreMat = new THREE.MeshStandardMaterial({

color:0x00f0ff,
wireframe:true,
emissive:0x002222

})

const core = new THREE.Mesh(coreGeo,coreMat)

scene.add(core)



/* 星云粒子 */

const starGeo = new THREE.BufferGeometry()

const starCount = 1500

const starPos=[]

for(let i=0;i<starCount;i++){

starPos.push(

(Math.random()-0.5)*200,
(Math.random()-0.5)*200,
(Math.random()-0.5)*200

)

}

starGeo.setAttribute(
"position",
new THREE.Float32BufferAttribute(starPos,3)
)

const starMat = new THREE.PointsMaterial({
color:0x00f0ff,
size:0.7
})

const stars = new THREE.Points(starGeo,starMat)

scene.add(stars)



/* 节点数据 */

const nodeData=[

{name:"AI Vision",desc:"视觉系统"},
{name:"NLP",desc:"语言理解"},
{name:"Decision AI",desc:"决策系统"},
{name:"Robotics",desc:"机器人"},
{name:"Future Tech",desc:"未来科技"}

]

const nodes=[]

nodeData.forEach((data,i)=>{

const geo = new THREE.SphereGeometry(0.35,32,32)

const mat = new THREE.MeshStandardMaterial({

color:0x00f0ff,
emissive:0x001111

})

const node = new THREE.Mesh(geo,mat)

node.position.x = Math.cos(i*1.2)*8
node.position.y = Math.sin(i*1.2)*5

node.userData=data

scene.add(node)

nodes.push(node)

})



/* 连线 */

nodes.forEach(a=>{
nodes.forEach(b=>{

if(a!==b){

const material = new THREE.LineBasicMaterial({

color:0x0088ff,
transparent:true,
opacity:0.35

})

const points=[a.position,b.position]

const geo = new THREE.BufferGeometry().setFromPoints(points)

const line = new THREE.Line(geo,material)

scene.add(line)

}

})
})



/* hover */

const raycaster = new THREE.Raycaster()

const mouse = new THREE.Vector2()

window.addEventListener("mousemove",e=>{

mouse.x = (e.clientX/window.innerWidth)*2-1
mouse.y = -(e.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

const intersects = raycaster.intersectObjects(nodes)

nodes.forEach(n=>{
n.material.emissive.set(0x001111)
})

if(intersects.length>0){

intersects[0].object.material.emissive.set(0x00ffff)

}

})



/* 点击 */

window.addEventListener("click",e=>{

mouse.x = (e.clientX/window.innerWidth)*2-1
mouse.y = -(e.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

const intersects = raycaster.intersectObjects(nodes)

if(intersects.length>0){

showPanel(intersects[0].object.userData)

}

})



function showPanel(data){

document.getElementById("nodeTitle").innerText=data.name
document.getElementById("nodeDesc").innerText=data.desc

document.getElementById("nodePanel").style.display="block"

}

function closePanel(){

document.getElementById("nodePanel").style.display="none"

}



/* 鼠标视差 */

window.addEventListener("mousemove",e=>{

const x=(e.clientX/window.innerWidth)-0.5
const y=(e.clientY/window.innerHeight)-0.5

camera.position.x=x*2
camera.position.y=-y*2

})



/* 滚动驱动 */

window.addEventListener("scroll",()=>{

const s=window.scrollY

core.rotation.y=s*0.002

})



/* 动画 */

function animate(){

requestAnimationFrame(animate)

core.rotation.x+=0.002
core.rotation.y+=0.003

stars.rotation.y+=0.0005

nodes.forEach(n=>{
n.rotation.y+=0.01
})

renderer.render(scene,camera)

}

animate()
