const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

const renderer = new THREE.WebGLRenderer({alpha:true})

renderer.setSize(window.innerWidth,window.innerHeight)

document
.getElementById("three-container")
.appendChild(renderer.domElement)

camera.position.z=10



// 光源

const light = new THREE.PointLight(0xffffff,1)

light.position.set(10,10,10)

scene.add(light)



// 节点数据

const nodeData = [

{
name:"AI Vision",
desc:"计算机视觉与图像理解技术"
},

{
name:"NLP",
desc:"自然语言理解与知识结构分析"
},

{
name:"Decision AI",
desc:"数据驱动决策与预测系统"
},

{
name:"Robotics",
desc:"机器人控制与智能系统"
},

{
name:"Future Tech",
desc:"探索前沿科技边界"
}

]



const nodes=[]


// 创建节点

nodeData.forEach((data,i)=>{

const geo = new THREE.SphereGeometry(0.4,32,32)

const mat = new THREE.MeshStandardMaterial({

color:0x00f0ff,
emissive:0x003333

})

const mesh = new THREE.Mesh(geo,mat)

mesh.position.x = Math.cos(i*1.2)*4
mesh.position.y = Math.sin(i*1.2)*2
mesh.userData=data

scene.add(mesh)

nodes.push(mesh)

})



// Raycaster

const raycaster = new THREE.Raycaster()

const mouse = new THREE.Vector2()



window.addEventListener("click",event=>{

mouse.x = (event.clientX/window.innerWidth)*2-1
mouse.y = -(event.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

const intersects = raycaster.intersectObjects(nodes)

if(intersects.length>0){

const data = intersects[0].object.userData

showPanel(data)

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



// 动画

function animate(){

requestAnimationFrame(animate)

nodes.forEach(n=>{

n.rotation.y+=0.01

})

renderer.render(scene,camera)

}

animate()

