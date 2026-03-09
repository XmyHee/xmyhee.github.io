const canvas = document.getElementById("ai-canvas");

const ctx = canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;


let nodes=[];

let mouse={x:0,y:0};


window.addEventListener("mousemove",e=>{

mouse.x=e.clientX
mouse.y=e.clientY

})


for(let i=0;i<80;i++){

nodes.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,

vx:(Math.random()-.5)*.6,
vy:(Math.random()-.5)*.6,

title:"AI Node "+i,

desc:"Neural computation unit"

})

}



function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)


nodes.forEach(n=>{

n.x+=n.vx
n.y+=n.vy


if(n.x<0||n.x>canvas.width) n.vx*=-1
if(n.y<0||n.y>canvas.height) n.vy*=-1


let dx=n.x-mouse.x
let dy=n.y-mouse.y

let dist=Math.sqrt(dx*dx+dy*dy)


ctx.beginPath()

ctx.arc(n.x,n.y,dist<100?4:2,0,Math.PI*2)

ctx.fillStyle="#5ff6ff"

ctx.fill()

})



for(let i=0;i<nodes.length;i++){

for(let j=i+1;j<nodes.length;j++){

let dx=nodes[i].x-nodes[j].x
let dy=nodes[i].y-nodes[j].y

let dist=Math.sqrt(dx*dx+dy*dy)


if(dist<140){

ctx.beginPath()

ctx.moveTo(nodes[i].x,nodes[i].y)

ctx.lineTo(nodes[j].x,nodes[j].y)

ctx.strokeStyle="rgba(95,246,255,.15)"

ctx.stroke()

}

}

}


requestAnimationFrame(draw)

}

draw()


canvas.addEventListener("click",e=>{

nodes.forEach(n=>{

let dx=n.x-e.clientX
let dy=n.y-e.clientY

if(Math.sqrt(dx*dx+dy*dy)<6){

openPanel(n)

}

})

})


function openPanel(n){

document.getElementById("node-panel").style.display="block"

document.getElementById("node-title").innerText=n.title

document.getElementById("node-desc").innerText=n.desc

}


function toggleExplorerMode(){

document.body.classList.toggle("machine-mode")

}


function scrollToTop(){

window.scrollTo({top:0,behavior:"smooth"})

}
