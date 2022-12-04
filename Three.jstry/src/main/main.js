import * as THREE from "three";


console.log(THREE);

//basic three.js


//1. create the Scene
const scene = new THREE.Scene()

//2. create camera

const camera = new THREE.PerspectiveCamera(
    75, window.innerHeight/window.innerWidth,0.1, 1000
);

// set camera position
camera.position.set(0,0,10)
scene.add(camera);

//add something
const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
//create item by cube
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// make cube into scene
scene.add(cube);

// init
const renderer = new THREE.WebGLRenderer();
//set size
renderer.setSize(window.innerHeight, window.innerWidth);
// console.log(renderer);
//make render into the body
document.body.appendChild(renderer.domElement);

//use render, use camera to render
renderer.render(scene, camera);
