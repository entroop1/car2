import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LayerMaterial, Base, Depth, Noise } from 'lamina/vanilla'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import MeshReflectorMaterial from './utils/MeshReflectorMaterial.js'
import BiimllboardReflection from './utils/BillboardReflection.js'
import * as dat from 'lil-gui'
import * as POSTPROCESSING from "postprocessing"


//debug
const gui = new dat.GUI()

//gltf loader
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

// load model
const carMaterial = new THREE.MeshStandardMaterial({
  color:'#5ABB98', 
  metalness:0.3,
  roughness: 0,
  })

let model = '/models/lamborghini_urus/scene.gltf'
gltfLoader.load(
  model,
  (gltf) =>
  {
          gltf.scene.scale.set(.005,.005,.005)
          gltf.scene.position.y = 0
          gltf.scene.position.x = 0
          gltf.scene.position.z = 0
          model = gltf.scene
          scene.add(model)
          console.log(model)

          model.traverse((child) =>
          {
              if(child instanceof THREE.Mesh)
              {
                  child.castShadow = true
                  child.receiveShadow = true

  
                //   child.material = carMaterial
              }
          })
  }
)

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// fog

scene.fog = new THREE.Fog('#381C4E', 0.002, 11);


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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 2
scene.add(camera)


// Torus

const torusMaterial = new THREE.MeshBasicMaterial(
    
)

const torusGeometry = new THREE.TorusBufferGeometry(1, .01, 16, 55)
const torus = new THREE.Mesh(torusGeometry, torusMaterial)
torus.castShadow = true
const torusGeometry2 = new THREE.TorusBufferGeometry(0.8, .01, 16, 55)
const torus2 = new THREE.Mesh(torusGeometry2, torusMaterial)

const torusGeometry3 = new THREE.TorusBufferGeometry(1.1, .01, 16, 55)
const torus3 = new THREE.Mesh(torusGeometry3, torusMaterial)

const torusGeometry4 = new THREE.TorusBufferGeometry(0.6, .01, 16, 55)
const torus4 = new THREE.Mesh(torusGeometry4, torusMaterial)

scene.add(torus, torus2, torus3, torus4)

// Light

const light = new THREE.AmbientLight( 0xffffff, 2); // soft white light

scene.add( light );

const directionalLight = new THREE.DirectionalLight(0x00fffc, 3)
directionalLight.position.set(5,5,5)
directionalLight.castShadow = true


scene.add(directionalLight)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// banner


const bannerMaterial = new THREE.MeshStandardMaterial({
    color:'#fff', 
    metalness:0.5,
    roughness: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
    })
    
const banner = new THREE.Mesh(new THREE.PlaneGeometry(3,3,3), bannerMaterial)
banner.position.x = -2
banner.position.y = 2

banner.rotation.y = Math.PI * 0.5
banner.receiveShadow = true
banner.castShadow = true
scene.add(banner)




/**
 * Floor
 */


let floorMaterial = new THREE.MeshStandardMaterial()
 
 
const floorGeometry = new THREE.PlaneGeometry(110,110,110)

const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)

 floorMesh.rotation.x = - Math.PI * 0.5
 floorMesh.position.y = -0.39
 floorMesh.receiveShadow = true
 floorMesh.castShadow = true


scene.add(floorMesh)



/**
 * Environment map
 */
 const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

//scene.background = environmentMap
scene.environment = environmentMap
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
	antialias: false,
	depth: false,
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.setClearColor('#381C4E')
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMappingExposure = 1
renderer.physicallyCorrectLights = true


// floor



floorMesh.material = new MeshReflectorMaterial(renderer, camera, scene, floorMesh, {
    mixBlur:0,
    mixStrength:1,
    resolution:1024,
    blur:[600, 100],
    minDepthThreshold: 0.9,
    maxDepthThreshold: 1,
    depthScale: 0,
    depthToBlurRatioBias: 0.25,
    mirror: 1,
    distortion: 1,
    mixContrast: 1,
    reflectorOffset: 0,
    bufferSamples: 8,
} )

const reflectorFolder = gui.addFolder('Reflector')
reflectorFolder.add(floorMesh.material, 'roughness').min(0).max(3).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'mixBlur').min(0).max(6).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'mixStrength').min(-10).max(10).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'mixContrast').min(-10).max(10).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'maxDepthThreshold').min(-10).max(10).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'minDepthThreshold').min(-10).max(10).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'depthToBlurRatioBias').min(-10).max(10).step(0.01)
reflectorFolder.add(floorMesh.material.reflectorProps, 'distortion').min(-10).max(10).step(0.01)

floorMesh.material.setValues({
    metalness:0.5,
    roughness: 5,
    roughnessMap: new THREE.TextureLoader().load("/textures/roughness.png"),
    normalMap: new THREE.TextureLoader().load("/textures/normal.png"),
    normalScale: new THREE.Vector3(0.1,0.1),
    color:'#381C4E',

})



/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime
    // Update controls
    controls.update()

    floorMesh.material.update();

    torus.position.z = Math.cos(elapsedTime/2)
    torus2.position.z = Math.cos(elapsedTime/1)
    torus3.position.z = Math.cos(elapsedTime/2.5)
    torus4.position.z = Math.cos(elapsedTime/1.5)


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()