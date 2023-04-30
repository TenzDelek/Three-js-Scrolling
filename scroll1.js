import * as THREE from 'three'
import * as dat from 'dat.gui'
import './style1.css'
import gsap from 'gsap'
/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(()=>{//if this is not there the change of color will be not happening
        material.color.set(parameters.materialColor)
        particlematerial.color.set(parameters.materialColor)
    })
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * object
 */

const material=new THREE.MeshToonMaterial({color:parameters.materialColor})


const objectdistance=4
const mesh1=new THREE.Mesh(
    new THREE.TorusGeometry(1,0.4,16,60),
    material
)
const mesh2=new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)
const mesh3=new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8,0.35,100,16),
    material
)
mesh1.position.y=-objectdistance*0
mesh2.position.y=-objectdistance*1
mesh3.position.y=-objectdistance*2
scene.add(mesh1,mesh2,mesh3)

mesh1.position.x=2
mesh2.position.x=-2
mesh3.position.x=2

const sectionarray=[mesh1,mesh2,mesh3]

//particle
const particlecount=300
const position= new Float32Array(particlecount*3)
for(let i=0;i<particlecount;i++)
{
    position[i*3+0 ]=(Math.random()-0.5)*10
    position[i*3+1 ]=objectdistance*0.5-Math.random()*objectdistance*sectionarray.length
    position[i*3+2 ]=(Math.random()-0.5)*10
}
const particlegeo=new THREE.BufferGeometry()
particlegeo.setAttribute('position',new THREE.BufferAttribute(position,3))
const particlematerial=new THREE.PointsMaterial({
    color:parameters.materialColor,
    sizeAttenuation:true,
    size:0.03
})
const particle=new THREE.Points(particlegeo,particlematerial)
scene.add(particle)
//light
const light=new THREE.DirectionalLight('white',1)
light.position.set(1,1,0)
scene.add(light)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
//group
const cameragroup=new THREE.Group()
scene.add(cameragroup)
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameragroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//scroll
let scrolly=window.scrollY
let currentsection=0
window.addEventListener('scroll',()=>{
    scrolly=window.scrollY
    const newsection=Math.round(scrolly/sizes.height)
    if(newsection !=currentsection)
    {
        currentsection=newsection
        gsap.to(
            sectionarray[currentsection].rotation,
            {
                duration:1.5,
                ease:'power2.inOut',
                x:'+=6',
                y:'+=3',
                z:'+=1.5'
            }
        )
    }
})
/**
 * Animate
 */
//cursor
const cursor={}
cursor.x=0
cursor.y=0
window.addEventListener('mousemove',(event)=>{
    cursor.x=event.clientX/sizes.width-0.5
    cursor.y=event.clientY/sizes.height-0.5
    
})

const clock = new THREE.Clock()
let prevoiustime=0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltatime=elapsedTime-prevoiustime
    prevoiustime=elapsedTime
    //animate camera
    camera.position.y= - scrolly/sizes.height*objectdistance
    const parallexX=cursor.x*0.5
    const parallexY=-cursor.y*0.5
    cameragroup.position.x +=(parallexX-cameragroup.position.x)*4*deltatime//we use group to ease the movement
    cameragroup.position.y +=(parallexY-cameragroup.position.y)*4*deltatime

   
    //animate mesh
    for(const mesh of sectionarray)
    {
        mesh.rotation.x+= deltatime *0.5
        mesh.rotation.y+= deltatime *0.15
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()