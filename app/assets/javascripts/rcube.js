var camera, scene, renderer;
var WIDTH, HEIGHT;
var cube = [[[],[],[]],[[],[],[]],[[],[],[]]];
var FLD;
var CNUM = 3;
var CSIZE = 10;
var DLT = (CNUM - 1) * 0.5;
var ZOOM = 1900;
var SPEED = 0.007;
var FPS = 60;
var SPF = 1000 / FPS;
var nloaded = 0;
var anm;
var anmFlg = true;
var raycaster;
var pickFlg = false;
var clickFlg = false;
var clickedPlane;
var timeFlg = true;
var tmr2;
var t0;
var mouse0;
var mouse1;
var planes = [];

var black, green, blue, yellow, white, orange, red;

window.onload = function() {
    raycaster = new THREE.Raycaster();
    mouse0 = new THREE.Vector2();
    mouse1 = new THREE.Vector2();

    scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    
    // load textures
    black  = new THREE.TextureLoader().load('/assets/black.png' , function(){nloaded++});
    green  = new THREE.TextureLoader().load('/assets/green.png' , function(){nloaded++});
    blue   = new THREE.TextureLoader().load('/assets/blue.png'  , function(){nloaded++});
    yellow = new THREE.TextureLoader().load('/assets/yellow.png', function(){nloaded++});
    white  = new THREE.TextureLoader().load('/assets/white.png' , function(){nloaded++});
    orange = new THREE.TextureLoader().load('/assets/orange.png', function(){nloaded++});
    red    = new THREE.TextureLoader().load('/assets/red.png'   , function(){nloaded++});

    // initialize cubes
    var geometry = new THREE.PlaneGeometry(CSIZE, CSIZE, 2);
    var material;
    for(var x = 0; x < CNUM; x++){
        for(var y = 0; y < CNUM; y++){
            for(var z = 0; z < CNUM; z++){
		cube[x][y][z] = new THREE.Object3D();
		addFace(x, y, z, "z", 0, orange, [0, 0, -CSIZE / 2], [0, 1, 0, 0] , [0, 0, -1]);
		addFace(x, y, z, "x", 2, blue  , [CSIZE / 2, 0, 0] , [0, 1, 0, 1] , [1, 0, 0] );
		addFace(x, y, z, "z", 2, red   , [0, 0, CSIZE / 2] , [0, 0, 0, 1] , [0, 0, 1] );
		addFace(x, y, z, "x", 0, green , [-CSIZE / 2, 0, 0], [0, 1, 0, -1], [-1, 0, 0]);
		addFace(x, y, z, "y", 2, white , [0, CSIZE / 2, 0] , [1, 0, 0, -1], [0, 1, 0] );
		addFace(x, y, z, "y", 0, yellow, [0, -CSIZE / 2, 0], [1, 0, 0, 1] , [0, -1, 0]);
                cube[x][y][z].position.set((x - DLT) * CSIZE, (y - DLT) * CSIZE, (z - DLT) * CSIZE);
                scene.add(cube[x][y][z]);
            }
        }
    }

    // initial render
    var tmr = setInterval(function(){
	if(nloaded >= 7){
	    clearInterval(tmr);
	    FLD = document.getElementById('canvas-frame');
	    var ww = window.innerWidth;
	    var wh = window.innerHeight;
	    var wl = ww > wh ? wh : ww;
	    WIDTH = ww > wh ? 0.83 * wl : wl;
	    HEIGHT = ww > wh ? wl - 16 : 1.2 * wl;
	    FLD.style.width = WIDTH + "px";
	    FLD.style.height = HEIGHT + "px";
	    camera = new THREE.PerspectiveCamera(1, WIDTH / HEIGHT, 1000, 5000);
	    camera.position.set(ZOOM, ZOOM, ZOOM);
	    camera.lookAt({x: 0, y: 0, z: 0});
	    FLD.innerHTML = "";
	    FLD.addEventListener('mousemove' , onDocumentMouseMove, false);
	    FLD.addEventListener('mousedown' , onDocumentMouseDown, false);
	    FLD.addEventListener('mouseup'   , onDocumentMouseUp  , false);
	    FLD.addEventListener('touchmove' , onDocumentMouseMove, false);
	    FLD.addEventListener('touchstart', onDocumentMouseDown, false);
	    FLD.addEventListener('touchend'  , onDocumentMouseUp  , false);
	    renderer = new THREE.WebGLRenderer({antialias: true});
	    renderer.setSize(FLD.clientWidth, FLD.clientHeight);
	    renderer.setClearColor(0xffffff, 1.0);
            FLD.appendChild(renderer.domElement);
	    renderer.render(scene, camera);
	    anmFlg = false;
	}
    }, 10);

    // add cube's faces
    function addFace(x, y, z, axis, num, color, p, q, n){
	if(axis == "x" && x == num || axis == "y" && y == num || axis == "z" && z == num){
	    material = new THREE.MeshLambertMaterial({map: color});
	}else{
	    material = new THREE.MeshLambertMaterial({map: black});
	}
	var c = new THREE.Mesh(geometry, material);
	c.position.set(p[0], p[1], p[2]);
	c.quaternion.set(q[0], q[1], q[2], q[3]).normalize();
	c.normal = new THREE.Vector3(n[0], n[1], n[2]);
        cube[x][y][z].add(c);
	planes.push(c);
    }
}

// turn plane
// axis = "x" or "y" or "z"
// val  = 0 or 1 or ... or (CNUM - 1)
// dir  = 1 or -1
function turn(axis, val, dir){
    var tmr = setInterval(function(){

	// calculate goal of quaternion (q1)
	if(!anmFlg){
	    anmFlg = true;
	    var tval = (val - 1 - DLT) * CSIZE;
	    var c = [];
	    for(var x = 0; x < CNUM; x++){
		for(var y = 0; y < CNUM; y++){
		    for(var z = 0; z < CNUM; z++){
			var p = cube[x][y][z].position;
			var q = cube[x][y][z].quaternion;
			var p0 = p.clone();
			var q0 = q.clone();
			if(axis == "x" && (p.x == tval || val == 0)){
			    var q1 = new THREE.Quaternion().set(1, 0, 0, dir).normalize().multiply(q.clone());
			    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
			} else if (axis == "y" && (p.y == tval || val == 0)){
			    var q1 = new THREE.Quaternion().set(0, 1, 0, dir).normalize().multiply(q.clone());
			    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
			} else if (axis == "z" && (p.z == tval || val == 0)){
			    var q1 = new THREE.Quaternion().set(0, 0, 1, dir).normalize().multiply(q.clone());
			    c.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
			}
		    }
		}
	    }
	    var t = 0

	    // animate turn
	    anm = setInterval(function(){
		if(t > 1 / SPF / SPEED){
		    var rad = 0.5 * Math.PI;
		    anmFlg = false;
		    clearInterval(anm);
		} else {
		    var rad = 0.5 * Math.PI * t * SPF * SPEED;
		}
		for(var i = 0; i < c.length; i++){
		    var p = cube[c[i].x][c[i].y][c[i].z].position;
		    var q = cube[c[i].x][c[i].y][c[i].z].quaternion;
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
		    if(t > 1 / SPF / SPEED){
			q.copy(c[i].q1);
		    } else {
			THREE.Quaternion.slerp(c[i].q0, c[i].q1, q, t * SPF * SPEED);
		    }
		}
		renderer.render(scene, camera);
		if(t > 1 / SPF / SPEED){
		    judgeClear();
		}
		t++
	    }, SPF);
	    clearInterval(tmr);
	}
    }, 10);
}

function judgeClear(){
    var c = cube[0][0][0];
    var normal = c.children[0].normal.clone();
    normal.applyQuaternion(c.quaternion);
    var target0 = Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
    normal = c.children[1].normal.clone();
    normal.applyQuaternion(c.quaternion);
    target0 += ", " + Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
    for(var x = 0; x < CNUM; x++){
	for(var y = 0; y < CNUM; y++){
	    for(var z = 0; z < CNUM; z++){
		var c = cube[x][y][z];		
		normal = c.children[0].normal.clone();
		normal.applyQuaternion(c.quaternion);
		var target = Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
		normal = c.children[1].normal.clone();
		normal.applyQuaternion(c.quaternion);
		target += ", " + Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
		if(target != target0){
		    return;
		}
	    }
	}
    }
    stopTime();
    alert("clear");
}

function onDocumentMouseMove(e){
    e.preventDefault();
    if(clickFlg){
	mouse1.x = (e.pageX / WIDTH) * 2 - 1;
	mouse1.y = -(e.pageY / HEIGHT) * 2 + 1;
	var dx = mouse1.x - mouse0.x;
	var dy = mouse1.y - mouse0.y;
    }
}

function onDocumentMouseDown(e){
    e.preventDefault();

    // time
    if(timeFlg){
	startTime();
    }
    
    // find clicked face
    mouse0.x = (e.pageX / WIDTH) * 2 - 1;
    mouse0.y = -(e.pageY / HEIGHT) * 2 + 1;
    raycaster.setFromCamera(mouse0, camera);
    var intersects = raycaster.intersectObjects(planes);
    if(intersects.length > 0){
	pickFlg = true;
	clickedPlane = intersects[0].object;
    }
    clickFlg = true;
}

function onDocumentMouseUp(e){
    e.preventDefault();
    mouse1.x = (e.pageX / WIDTH) * 2 - 1;
    mouse1.y = -(e.pageY / HEIGHT) * 2 + 1;
    var dx = mouse1.x - mouse0.x;
    var dy = mouse1.y - mouse0.y;
    if(pickFlg){
	var axis;
	var val;
	var normal = clickedPlane.normal.clone();
	normal.applyQuaternion(clickedPlane.parent.quaternion);
	if(normal.x > 0.9){
	    if(dy < 1.732 * dx && dy > -0.577 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > 1.732 * dx && dy > -0.577 * dx){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, 1);
	    }else if(dy > 1.732 * dx && dy < -0.577 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, -1);
	    }else if(dy < 1.732 * dx && dy < -0.577 * dx){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
	    }
	}else if(normal.y > 0.9){
	    if(dx > 0 && dy > 0){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }else if(dx < 0 && dy > 0){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, 1);
	    }else if(dx < 0 && dy < 0){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, 1);
	    }else if(dx > 0 && dy < 0){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
	    }
	}else if(normal.z > 0.9){
	    if(dy < 0.577 * dx && dy > -1.732 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > 0.577 * dx && dy > -1.732 * dx){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }else if(dy > 0.577 * dx && dy < -1.732 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, -1);
	    }else if(dy < 0.577 * dx && dy < -1.732 * dx){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, 1);
	    }
	}
	pickFlg = false;
    }else{
	if(mouse0.y < 0.577 * mouse0.x && mouse0.y > -0.577 * mouse0.x){
	    if(dx > 0 && dy > 0){
		turn("y", 0, 1);
	    }else if(dx < 0 && dy > 0){
		turn("z", 0, 1);
	    }else if(dx < 0 && dy < 0){
		turn("y", 0, -1);
	    }else if(dx > 0 && dy < 0){
		turn("z", 0, -1);
	    }
	}
	if(mouse0.y > 0.577 * mouse0.x && mouse0.x > 0){
	    if(dy < 1.732 * dx && dy > -0.577 * dx){
		turn("x", 0, -1);
	    }else if(dy > 1.732 * dx && dy > -0.577 * dx){
		turn("z", 0, 1);
	    }else if(dy > 1.732 * dx && dy < -0.577 * dx){
		turn("x", 0, 1);
	    }else if(dy < 1.732 * dx && dy < -0.577 * dx){
		turn("z", 0, -1);
	    }
	}
	if(mouse0.y > -0.577 * mouse0.x && mouse0.x < 0){
	    if(dy < -1.732 * dx && dy > 0.577 * dx){
		turn("z", 0, 1);
	    }else if(dy > -1.732 * dx && dy > 0.577 * dx){
		turn("x", 0, -1);
	    }else if(dy > -1.732 * dx && dy < 0.577 * dx){
		turn("z", 0, -1);
	    }else if(dy < -1.732 * dx && dy < 0.577 * dx){
		turn("x", 0, 1);
	    }
	}
	if(mouse0.y > 0.577 * mouse0.x && mouse0.y < -0.577 * mouse0.x){
	    if(dx > 0 && dy > 0){
		turn("x", 0, -1);
	    }else if(dx < 0 && dy > 0){
		turn("y", 0, -1);
	    }else if(dx < 0 && dy < 0){
		turn("x", 0, 1);
	    }else if(dx > 0 && dy < 0){
		turn("y", 0, 1);
	    }
	}
	if(mouse0.y < 0.577 * mouse0.x && mouse0.x < 0){
	    if(dy < 1.732 * dx && dy > -0.577 * dx){
		turn("y", 0, 1);
	    }else if(dy > 1.732 * dx && dy > -0.577 * dx){
		turn("x", 0, -1);
	    }else if(dy > 1.732 * dx && dy < -0.577 * dx){
		turn("y", 0, -1);
	    }else if(dy < 1.732 * dx && dy < -0.577 * dx){
		turn("x", 0, 1);
	    }
	}
	if(mouse0.y < -0.577 * mouse0.x && mouse0.x > 0){
	    if(dy < -1.732 * dx && dy > 0.577 * dx){
		turn("y", 0, -1);
	    }else if(dy > -1.732 * dx && dy > 0.577 * dx){
		turn("z", 0, 1);
	    }else if(dy > -1.732 * dx && dy < 0.577 * dx){
		turn("y", 0, 1);
	    }else if(dy < -1.732 * dx && dy < 0.577 * dx){
		turn("z", 0, -1);
	    }
	}
    }
    clickFlg = false;
}

function startTime(){
    timeFlg = false;
    t0 = new Date();
    tmr2 = setInterval(function(){
	var t = new Date().getTime() - t0.getTime();
	var h = Math.floor(t / 3600000);
	var m = Math.floor((t - h * 3600000) / 60000);
	var s = Math.floor((t - h * 3600000 - m * 60000) / 1000);
	var ms = t - h * 3600000 - m * 60000 - s * 1000;
	var disptime = ("0" + m).slice(-2) + "'" + ("0" + s).slice(-2) + '"' + ("00" + ms).slice(-3);
	document.getElementById('time').innerHTML = disptime;
    }, 1)
}

function stopTime(){
    timeFlg = true;
    clearInterval(tmr2);
}

