/*
課題
・画像ではなくthree.jsの機能で表面の色を描く
・スタートボタン（シャッフル）
・元に戻すボタン
・ログイン機能
・記録保存機能
・記録グラフ機能
・デザインを整える
*/


var camera, scene, renderer;
var WIDTH, HEIGHT;
var cube = [[[],[],[]],[[],[],[]],[[],[],[]]];
var c0 = [];
var FLD;
var CNUM = 3;
var CSIZE = 10;
var DLT = (CNUM - 1) * 0.5;
var ZOOM = 2500;
var SPEED = 0.007;
var FPS = 60;
var SPF = 1000 / FPS;
var nloaded = 0;
var anm;
var anmFlg = true;
var rate;
var raycaster;
var pickFlg = false;
var clickFlg = false;
var dragFlg = false;
var turnDirFlg = false;
var turnFinishFlg = true;
var clickedPlane;
var clickedPlaneNormal;
var timeFlg = true;
var turnAxis = "";
var tmr2;
var t0;
var mouse0;
var mouse1;
var planes = [];
var R3 = Math.sqrt(3);

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
		addFace(x, y, z, "z", 0       , orange, [0, 0, -CSIZE / 2], [0, 1, 0, 0] , [0, 0, -1]);
		addFace(x, y, z, "x", CNUM - 1, blue  , [CSIZE / 2, 0, 0] , [0, 1, 0, 1] , [1, 0, 0] );
		addFace(x, y, z, "z", CNUM - 1, red   , [0, 0, CSIZE / 2] , [0, 0, 0, 1] , [0, 0, 1] );
		addFace(x, y, z, "x", 0       , green , [-CSIZE / 2, 0, 0], [0, 1, 0, -1], [-1, 0, 0]);
		addFace(x, y, z, "y", CNUM - 1, white , [0, CSIZE / 2, 0] , [1, 0, 0, -1], [0, 1, 0] );
		addFace(x, y, z, "y", 0       , yellow, [0, -CSIZE / 2, 0], [1, 0, 0, 1] , [0, -1, 0]);
                cube[x][y][z].position.set((x - DLT) * CSIZE, (y - DLT) * CSIZE, (z - DLT) * CSIZE);
		if(z == 0 && y != 0 && y != CNUM - 1 && x != 0 && x != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 0;
		}else if(x == CNUM - 1 && y != 0 && y != CNUM - 1 && z != 0 && z != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 1;
		}else if(z == CNUM - 1 && y != 0 && y != CNUM - 1 && x != 0 && x != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 2;
		}else if(x == 0 && y != 0 && y != CNUM - 1 && z != 0 && z != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 3;
		}else if(y == CNUM - 1 && z != 0 && z != CNUM - 1 && x != 0 && x != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 4;
		}else if(y == 0 && z != 0 && z != CNUM - 1 && x != 0 && x != CNUM - 1){
		    cube[x][y][z].colorFaceIndex = 5;
		}
		//console.log(x + "," + y + "," + z + " " + cube[x][y][z].colorFaceIndex);
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
	    //WIDTH = ww > wh ? 0.83 * wl : wl;
	    //HEIGHT = ww > wh ? wl - 16 : 1.2 * wl;
	    WIDTH = ww;
	    HEIGHT = wh - 20;
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
	    renderer.setSize(WIDTH, HEIGHT);
	    console.log(window, WIDTH, HEIGHT, FLD.style);
	    console.log(FLD);
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
	// calculate goal of quaternion (q1)
	if(!anmFlg){
	    var t = rate / SPF / SPEED;
	    turnFinishFlg = false;
	    // animate turn
	    anm = setInterval(function(){
		var rad = 0.5 * Math.PI * t * SPF * SPEED;
		if(Math.abs(t) > 1 / SPF / SPEED){
		    turnFinishFlg = true;
		    rad = t > 0 ? 0.5 * Math.PI : -0.5 * Math.PI;
		    anmFlg = false;
		    clearInterval(anm);
		    t = t > 0 ? 1 / SPF / SPEED : -1 / SPF / SPEED;
		}
		//console.log("t = "+t);
		for(var i = 0; i < c0.length; i++){
		    var p = cube[c0[i].x][c0[i].y][c0[i].z].position;
		    var q = cube[c0[i].x][c0[i].y][c0[i].z].quaternion;
		    if(axis == "x"){
			p.y = c0[i].p0.y * Math.cos(dir * rad) - c0[i].p0.z * Math.sin(dir * rad);
			p.z = c0[i].p0.z * Math.cos(dir * rad) + c0[i].p0.y * Math.sin(dir * rad);
		    } else if (axis == "y"){
			p.z = c0[i].p0.z * Math.cos(dir * rad) - c0[i].p0.x * Math.sin(dir * rad);
			p.x = c0[i].p0.x * Math.cos(dir * rad) + c0[i].p0.z * Math.sin(dir * rad);
		    } else if (axis == "z"){
			p.x = c0[i].p0.x * Math.cos(dir * rad) - c0[i].p0.y * Math.sin(dir * rad);
			p.y = c0[i].p0.y * Math.cos(dir * rad) + c0[i].p0.x * Math.sin(dir * rad);
		    }
		    THREE.Quaternion.slerp(c0[i].q0, c0[i].q1, q, t * SPF * SPEED);
		    if(turnFinishFlg){
			p.x = Math.round(p.x * 1000000) / 1000000;
			p.y = Math.round(p.y * 1000000) / 1000000;
			p.z = Math.round(p.z * 1000000) / 1000000;
			q.x = qcorrect(q.x);
			q.y = qcorrect(q.y);
			q.z = qcorrect(q.z);
			q.w = qcorrect(q.w);
		    }
		}
		renderer.render(scene, camera);
		if(turnFinishFlg){
		    console.log(cube[2][0][0].quaternion);
		    /*console.log(cube[2][0][0].quaternion);
		    console.log(cube[2][0][1].quaternion);
		    console.log(cube[2][0][2].quaternion);
		    console.log(cube[2][1][0].quaternion);
		    console.log(cube[2][1][1].quaternion);
		    console.log(cube[2][1][2].quaternion);
		    console.log(cube[2][2][0].quaternion);
		    console.log(cube[2][2][1].quaternion);
		    console.log(cube[2][2][2].quaternion);
		    var w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][0][0].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][0][1].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][0][2].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][1][0].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][1][1].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][1][2].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][2][0].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][2][1].quaternion));
		    w = cube[0][0][0].children[0].normal.clone();
		    console.log(w.applyQuaternion(cube[2][2][2].quaternion));*/
		    judgeClear();
		    c0 = [];
		}
		//t += t / Math.abs(t);
		//t++;
		t > 0 ? t++ : t--;
		//console.log(t)
		//console.log("*"+cube[1][1][2].position.x+","+cube[1][1][2].position.z);
		//console.log(cube[1][1][2].quaternion);
		//alert();
	    }, SPF);
	}
}

function qcorrect(qelement){
    var elm = Math.round(qelement * 10) / 10;
    if([0, 1, -1, 0.5, -0.5].includes(elm)){
	return elm;
    }else if(elm == 0.7){
	return 1 / Math.sqrt(2);
    }else if(elm == -0.7){
	return -1 / Math.sqrt(2);
    }
    return qelement;
}
       
function dragTurn(axis, val, dir){
    if(!dragFlg){
	// calculate goal of quaternion (q1)
	dragFlg = true;
	c0 = [];
	var tval = (val - 1 - DLT) * CSIZE;
	for(var x = 0; x < CNUM; x++){
	    for(var y = 0; y < CNUM; y++){
		for(var z = 0; z < CNUM; z++){
		    var p = cube[x][y][z].position;
		    var q = cube[x][y][z].quaternion;
		    var p0 = p.clone();
		    var q0 = q.clone();
		    if(axis == "x" && (p.x == tval || val == 0)){
			var q1 = new THREE.Quaternion().set(1, 0, 0, dir).normalize().multiply(q.clone());
			c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
		    } else if (axis == "y" && (p.y == tval || val == 0)){
			var q1 = new THREE.Quaternion().set(0, 1, 0, dir).normalize().multiply(q.clone());
			c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
		    } else if (axis == "z" && (p.z == tval || val == 0)){
			var q1 = new THREE.Quaternion().set(0, 0, 1, dir).normalize().multiply(q.clone());
			c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
		    }
		}
	    }
	}
    }
    // animate turn
    var rad = 0.5 * Math.PI * rate;
    //console.log(rate + "    " + rad);
    //console.log(c0);
    for(var i = 0; i < c0.length; i++){
	var p = cube[c0[i].x][c0[i].y][c0[i].z].position;
	var q = cube[c0[i].x][c0[i].y][c0[i].z].quaternion;
	// position
	if(axis == "x"){
	    p.y = c0[i].p0.y * Math.cos(dir * rad) - c0[i].p0.z * Math.sin(dir * rad);
	    p.z = c0[i].p0.z * Math.cos(dir * rad) + c0[i].p0.y * Math.sin(dir * rad);
	} else if (axis == "y"){
	    p.z = c0[i].p0.z * Math.cos(dir * rad) - c0[i].p0.x * Math.sin(dir * rad);
	    p.x = c0[i].p0.x * Math.cos(dir * rad) + c0[i].p0.z * Math.sin(dir * rad);
	} else if (axis == "z"){
	    p.x = c0[i].p0.x * Math.cos(dir * rad) - c0[i].p0.y * Math.sin(dir * rad);
	    p.y = c0[i].p0.y * Math.cos(dir * rad) + c0[i].p0.x * Math.sin(dir * rad);
	}
	// quaternion
	THREE.Quaternion.slerp(c0[i].q0, c0[i].q1, q, rate);
    }
    renderer.render(scene, camera);
}

function judgeClear(){
    var c = cube[0][0][0];
    var normal = c.children[0].normal.clone();
    normal.applyQuaternion(c.quaternion);
    var target0 = Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
    normal = c.children[1].normal.clone();
    normal.applyQuaternion(c.quaternion);
    target0 += ", " + Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
    //console.log("----");
    //console.log("*" + target0);
    for(var x = 0; x < CNUM; x++){
	for(var y = 0; y < CNUM; y++){
	    for(var z = 0; z < CNUM; z++){
		var c = cube[x][y][z];
		if(z == 0 && y != 0 && y != CNUM - 1 && x != 0 && x != CNUM - 1 ||
		   x == CNUM - 1 && y != 0 && y != CNUM - 1 && z != 0 && z != CNUM - 1 ||
		   z == CNUM - 1 && y != 0 && y != CNUM - 1 && x != 0 && x != CNUM - 1 ||
		   x == 0 && y != 0 && y != CNUM - 1 && z != 0 && z != CNUM - 1 ||
		   y == CNUM - 1 && z != 0 && z != CNUM - 1 && x != 0 && x != CNUM - 1 ||
		   y == 0 && z != 0 && z != CNUM - 1 && x != 0 && x != CNUM - 1){ // edge
		    normal = c.children[c.colorFaceIndex].normal.clone();
		    normal.applyQuaternion(c.quaternion);
		    var target = Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
		    var normalc = cube[0][0][0].children[cube[x][y][z].colorFaceIndex].normal.clone();
		    normalc.applyQuaternion(cube[0][0][0].quaternion);
		    var targetc = Math.round(normal.x) + ", " + Math.round(normal.y) + ", " + Math.round(normal.z);
		    if(target != targetc){
			return;
		    }
		} else { //not edge
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
    }
    stopTime();
    //alert("clear");
    console.log("clear");
}

function onDocumentMouseMove(e){
    e.preventDefault();
    if(clickFlg && turnFinishFlg){
	//console.log("***" + turnDirFlg + " ***" + turnAxis);
	mouse1.x = (e.pageX / WIDTH) * 2 - 1;
	mouse1.y = -(e.pageY / HEIGHT) * 2 + 1;
	var dx = mouse1.x - mouse0.x;
	var dy = mouse1.y - mouse0.y;
	//console.log("dx: " + dx + " CSIZE * CNUM: " + (CSIZE * CNUM) + " rate: " + rate);
	//console.log(clickedPlane.parent.position.x + ", " + clickedPlane.parent.position.y + ", " + clickedPlane.parent.position.z);
	if(pickFlg){
	    var axis;
	    var val;
	    if(!dragFlg){
		clickedPlaneNormal = clickedPlane.normal.clone();
		clickedPlaneNormal.applyQuaternion(clickedPlane.parent.quaternion);
	    }
	    //console.log("normal = (" + normal.x + ", " + normal.y + ", " + normal.z + ")");
	    if(clickedPlaneNormal.x > 0.9){
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
		}else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("z", clickedPlane.parent.position.z/CSIZE+2, 1);
		}
	    }else if(clickedPlaneNormal.y > 0.9){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
		}else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
		}
	    }else if(clickedPlaneNormal.z > 0.9){
		if(dy < 1 / R3 * dx && dy > -R3 * dx || dy > 1 / R3 * dx && dy < -R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
		}else if(dy > 1 / R3 * dx && dy > -R3 * dx || dy < 1 / R3 * dx && dy < -R3 * dx){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
		}
	    }
	}else if (true){
	    if(mouse0.y < 1 / R3 * mouse0.x && mouse0.y > -1 / R3 * mouse0.x){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", 0, -1);
		}
	    }
	    if(mouse0.y > 1 / R3 * mouse0.x && mouse0.x > 0){
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", 0, -1);
		}else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("z", 0, 1);
		}
	    }
	    if(mouse0.y > -1 / R3 * mouse0.x && mouse0.x < 0){
		if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", 0, -1);
		}else if(dy > -R3 * dx && dy > 1 / R3 * dx || dy < -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("x", 0, -1);
		}
	    }
	    if(mouse0.y > 1 / R3 * mouse0.x && mouse0.y < -1 / R3 * mouse0.x){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", 0, -1);
		}else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", 0, 1);
		}
	    }
	    if(mouse0.y < 1 / R3 * mouse0.x && mouse0.x < 0){
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("x", 0, -1);
		}
	    }
	    if(mouse0.y < -1 / R3 * mouse0.x && mouse0.x > 0){
		if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    var h = cube[c0[i].x][c0[i].y][c0[i].z].position;
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else if(dy > -R3 * dx && dy > 1 / R3 * dx || dy < -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = dy > 1 ? 1 : dy;
		    dragTurn("z", 0, 1);
		}
	    }
	}


    }
}

function onDocumentMouseDown(e){
    e.preventDefault();
    if(!turnFinishFlg){
	return;
    }
    clickFlg = true;

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
}

function onDocumentMouseUp(e){
    e.preventDefault();
    if(!turnFinishFlg){
	return;
    }
    clickFlg = false;
    dragFlg = false;
    mouse1.x = (e.pageX / WIDTH) * 2 - 1;
    mouse1.y = -(e.pageY / HEIGHT) * 2 + 1;
    var dx = mouse1.x - mouse0.x;
    var dy = mouse1.y - mouse0.y;
    //console.log(dx + ", " + dy);
    if(pickFlg){
	pickFlg = false;
	var axis;
	var val;
	if(clickedPlaneNormal.x > 0.9){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, 1);
	    }
	}else if(clickedPlaneNormal.y > 0.9){
	    if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
	    }
	}else if(clickedPlaneNormal.z > 0.9){
	    if(dy < 1 / R3 * dx && dy > -R3 * dx || dy > 1 / R3 * dx && dy < -R3 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > 1 / R3 * dx && dy > -R3 * dx || dy < 1 / R3 * dx && dy < -R3 * dx){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }
	}
    }else{
	if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
	    if(mouse0.y < 1 / R3 * mouse0.x && mouse0.y > -1 / R3 * mouse0.x){
		turn("y", 0, 1);
	    }else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		turn("z", 0, -1);
	    }
	}
	if(mouse0.y > 1 / R3 * mouse0.x && mouse0.x > 0){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("x", 0, -1);
	    }else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		turn("z", 0, 1);
	    }
	}
	if(mouse0.y > -1 / R3 * mouse0.x && mouse0.x < 0){
	    if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		turn("z", 0, -1);
	    }else if(dy > -R3 * dx && dy > 1 / R3 * dx || dy < -R3 * dx && dy < 1 / R3 * dx){
		turn("x", 0, -1);
	    }
	}
	if(mouse0.y > 1 / R3 * mouse0.x && mouse0.y < -1 / R3 * mouse0.x){
	    if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		turn("x", 0, -1);
	    }else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		turn("y", 0, 1);
	    }
	}
	if(mouse0.y < 1 / R3 * mouse0.x && mouse0.x < 0){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("y", 0, 1);
	    }else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		turn("x", 0, -1);
	    }
	}
	if(mouse0.y < -1 / R3 * mouse0.x && mouse0.x > 0){
	    if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		turn("y", 0, 1);
	    }else if(dy > -R3 * dx && dy > 1 / R3 * dx || dy < -R3 * dx && dy < 1 / R3 * dx){
		turn("z", 0, 1);
	    }
	}
    }
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

