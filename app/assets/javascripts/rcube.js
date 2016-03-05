var camera, scene, renderer;
var cube = [[[],[],[]],[[],[],[]],[[],[],[]]];
//var cube = [[[],[]],[[],[]]];
//var cube = [[[]]];
var CNUM = 3;
var CSIZE = 12;
var DLT = (CNUM - 1) * 0.5;
var SPEED = 0.005;
var FPS = 60;
var SPF = 1000 / FPS;
var anm;
var anmFlg;

window.onload = function() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
    renderer.setClearColor(0xffffff, 1.0);
    camera = new THREE.PerspectiveCamera(1, width / height, 1, 10000);
    camera.position.set(2000, 2000, 2000);
    camera.lookAt({x: 0, y: 0, z: 0});
    scene = new THREE.Scene();
    //var light = new THREE.DirectionalLight(0xffffff);
    //light.position.set(14, 40, 20).normalize();
    //scene.add(light);
    //var ambientLight = new THREE.AmbientLight(0x888888);
    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    
    // load textures
    var black = new THREE.TextureLoader().load('/assets/black.png');
    var green = new THREE.TextureLoader().load('/assets/green.png');
    var blue = new THREE.TextureLoader().load('/assets/blue.png');
    var yellow = new THREE.TextureLoader().load('/assets/yellow.png');
    var white = new THREE.TextureLoader().load('/assets/white.png');
    var orange = new THREE.TextureLoader().load('/assets/orange.png');
    var red = new THREE.TextureLoader().load('/assets/red.png');

    // initialize cubes
    for(var x = 0; x < CNUM; x++){
        for(var y = 0; y < CNUM; y++){
            for(var z = 0; z < CNUM; z++){
                var geometry = new THREE.BoxGeometry(CSIZE, CSIZE, CSIZE);
                var materials = [
                    new THREE.MeshLambertMaterial({map: black}),
                    new THREE.MeshLambertMaterial({map: black}),
                    new THREE.MeshLambertMaterial({map: black}),
                    new THREE.MeshLambertMaterial({map: black}),
                    new THREE.MeshLambertMaterial({map: black}),
                    new THREE.MeshLambertMaterial({map: black})
                ];
                if(x == 0) materials[1] = new THREE.MeshLambertMaterial({map: green});
                if(x == CNUM - 1) materials[0] = new THREE.MeshLambertMaterial({map: blue});
                if(y == 0) materials[3] = new THREE.MeshLambertMaterial({map: yellow});
                if(y == CNUM - 1) materials[2] = new THREE.MeshLambertMaterial({map: white});
                if(z == 0) materials[5] = new THREE.MeshLambertMaterial({map: orange});
                if(z == CNUM - 1) materials[4] = new THREE.MeshLambertMaterial({map: red});
                var material= new THREE.MeshFaceMaterial(materials);
                cube[x][y][z] = new THREE.Mesh( geometry, material );
                cube[x][y][z].position.set((x - DLT) * CSIZE, (y - DLT) * CSIZE, (z - DLT) * CSIZE);
                scene.add(cube[x][y][z]);
            }
        }
    }
    setTimeout(function(){renderer.render(scene, camera);}, 0);
    turn('x', 0, 1);
    turn('x', 0, -1);
}

// turn plane
// axis = "x" or "y" or "z"
// val  = 0 or 1 or ... or (CNUM - 1)
// dir  = 1 or -1
function turn(axis, val, dir){
    var tmr = setInterval(function(){
    if(!anmFlg){
    anmFlg = true;

    var tval = (val - 1 - DLT) * CSIZE;
    var c = [];
    for(var x = 0; x < CNUM; x++){
        for(var y = 0; y < CNUM; y++){
            for(var z = 0; z < CNUM; z++){
                var p = cube[x][y][z].position;
                var q = cube[x][y][z].quaternion;
                if(axis == "x" && (p.x == tval || val == 0)){
                    var p0 = p.clone();
                    var q0 = q.clone();
                    var q1 = new THREE.Quaternion().set(1, 0, 0, dir).normalize().multiply(q.clone());
                    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                } else if (axis == "y" && (p.y == tval || val == 0)){
                    var p0 = p.clone();
                    var q0 = q.clone();
                    var q1 = new THREE.Quaternion().set(0, 1, 0, dir).normalize().multiply(q.clone());
                    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                } else if (axis == "z" && (p.z == tval || val == 0)){
                    var p0 = p.clone();
                    var q0 = q.clone();
                    var q1 = new THREE.Quaternion().set(0, 0, 1, dir).normalize().multiply(q.clone());
                    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                }
            }
        }
    }
    var t = 0
    anm = setInterval(function(){
        //console.log(cube[0][0][2].position, c[0].p0, c[0].p1);
        if(t > 1 / SPF / SPEED){
            for(var i = 0; i < c.length; i++){
                var p = cube[c[i].x][c[i].y][c[i].z].position;
                var q = cube[c[i].x][c[i].y][c[i].z].quaternion;
                var rad = 0.5 * Math.PI;
                if(axis == "x" && (p.x == tval || val == 0)){
                    p.y = Math.round(c[i].p0.y * Math.cos(dir * rad) - c[i].p0.z * Math.sin(dir * rad));
                    p.z = Math.round(c[i].p0.z * Math.cos(dir * rad) + c[i].p0.y * Math.sin(dir * rad));
                } else if (axis == "y" && (p.y == tval || val == 0)){
                    p.z = Math.round(c[i].p0.z * Math.cos(dir * rad) - c[i].p0.x * Math.sin(dir * rad));
                    p.x = Math.round(c[i].p0.x * Math.cos(dir * rad) + c[i].p0.z * Math.sin(dir * rad));
                } else if (axis == "z" && (p.z == tval || val == 0)){
                    p.x = Math.round(c[i].p0.x * Math.cos(dir * rad) - c[i].p0.y * Math.sin(dir * rad));
                    p.y = Math.round(c[i].p0.y * Math.cos(dir * rad) + c[i].p0.x * Math.sin(dir * rad));
                }
                q.copy(c[i].q1);
            }
            anmFlg = false;
            clearInterval(anm);
        } else {
            for(var i = 0; i < c.length; i++){
                var p = cube[c[i].x][c[i].y][c[i].z].position;
                var q = cube[c[i].x][c[i].y][c[i].z].quaternion;
                var rad = 0.5 * Math.PI * t * SPF * SPEED;
                if(axis == "x" && (p.x == tval || val == 0)){
                    p.y = Math.round(c[i].p0.y * Math.cos(dir * rad) - c[i].p0.z * Math.sin(dir * rad));
                    p.z = Math.round(c[i].p0.z * Math.cos(dir * rad) + c[i].p0.y * Math.sin(dir * rad));
                } else if (axis == "y" && (p.y == tval || val == 0)){
                    p.z = Math.round(c[i].p0.z * Math.cos(dir * rad) - c[i].p0.x * Math.sin(dir * rad));
                    p.x = Math.round(c[i].p0.x * Math.cos(dir * rad) + c[i].p0.z * Math.sin(dir * rad));
                } else if (axis == "z" && (p.z == tval || val == 0)){
                    p.x = Math.round(c[i].p0.x * Math.cos(dir * rad) - c[i].p0.y * Math.sin(dir * rad));
                    p.y = Math.round(c[i].p0.y * Math.cos(dir * rad) + c[i].p0.x * Math.sin(dir * rad));
                }
                THREE.Quaternion.slerp(c[i].q0, c[i].q1, q, t * SPF * SPEED);
            }
        }
        renderer.render(scene, camera);
        t++
    }, SPF);
    
    clearInterval(tmr);
    }
    }, 100);
}

