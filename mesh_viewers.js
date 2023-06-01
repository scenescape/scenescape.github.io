import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

class MeshViewer {
    constructor(mesh_name, mesh_path) {
        this.mesh_path = mesh_path;
        this.loaded = false;

        // renderer
        this.canvas = document.getElementById(mesh_name + '-canvas');
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 3000 );
        this.camera.position.set( 0, 0, 30);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xFFFFFF );

        this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000 ) );

        // controls
        this.controls = new ArcballControls(this.camera, this.renderer.domElement, this.scene);
        const render_function = this.render.bind(this);
        this.controls.addEventListener('change', render_function);

        // Fullscreen
        this.fullscreen_button = document.getElementById(mesh_name + '-fullscreen');

        // Progress bar
        this.progressbar = document.getElementById(mesh_name + '-bar');
    }

    load_mesh(geometry) {
        const material = new THREE.MeshBasicMaterial({});
        material.vertexColors = true;
        material.side = THREE.DoubleSide;

        const mesh = new THREE.Mesh( geometry, material );

        mesh.position.y = 0.0;
        mesh.position.z = 0.0;
        mesh.rotation.x = 0.0;
        mesh.scale.multiplyScalar( 0.006 );

        this.scene.add(mesh);
        this.render();
        this.progressbar.parentElement.setAttribute('hidden', '');
    }

    update_progress_bar(xhr) {
        let int_percentage = Math.floor(xhr.loaded / xhr.total * 100);

        this.progressbar.style.width = int_percentage + '%';
        this.progressbar.innerText = int_percentage + '%';
    }

    load() {
        if (this.loaded) {
            return;
        }

        this.fullscreen_button.removeAttribute('hidden');
        this.canvas.removeAttribute('hidden');
        this.progressbar.parentElement.removeAttribute('hidden');

        const loader = new PLYLoader();

        // bind load_mesh to this
        const load_mesh_function = this.load_mesh.bind(this);
        const progress_bar_function = this.update_progress_bar.bind(this);

        loader.loadAsync(this.mesh_path, progress_bar_function).then(load_mesh_function).catch((error) => {
            console.log( 'An error happened' );
            console.log(error);
        });

        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);

        // Fullscreen button
        this.fullscreen_button.addEventListener('click', () => {
            if (this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen();
            } else if (this.canvas.mozRequestFullScreen) { /* Firefox */
                this.canvas.mozRequestFullScreen();
            } else if (this.canvas.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                this.canvas.webkitRequestFullscreen();
            } else if (this.canvas.msRequestFullscreen) { /* IE/Edge */
                this.canvas.msRequestFullscreen();
            }
        });

        this.loaded = true;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

let cave_viewer = new MeshViewer('cave', './meshes/cave_enlarged_rotated.ply');
document.getElementById('cave-loader').addEventListener('click', () => {
    cave_viewer.load();
});

let candyhouse_viewer = new MeshViewer('candyhouse', './meshes/candyhouse_enlarged_rotated.ply');
document.getElementById('candyhouse-loader').addEventListener('click', () => {
    candyhouse_viewer.load();
});

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    if (candyhouse_viewer.loaded) {
        candyhouse_viewer.camera.aspect = candyhouse_viewer.canvas.clientWidth / candyhouse_viewer.canvas.clientHeight;
        candyhouse_viewer.camera.updateProjectionMatrix();
        candyhouse_viewer.renderer.setSize(candyhouse_viewer.canvas.clientWidth, candyhouse_viewer.canvas.clientHeight, false);
        candyhouse_viewer.render();
    }

    if (cave_viewer.loaded) {
        cave_viewer.camera.aspect = cave_viewer.canvas.clientWidth / cave_viewer.canvas.clientHeight;
        cave_viewer.camera.updateProjectionMatrix();
        cave_viewer.renderer.setSize(cave_viewer.canvas.clientWidth, cave_viewer.canvas.clientHeight, false);
        cave_viewer.render();
    }
}
