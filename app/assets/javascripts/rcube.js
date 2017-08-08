/*
課題
・画像ではなくthree.jsの機能で表面の色を描くようにする
・スタートボタン（シャッフル）
・元に戻すボタン
・ログイン機能
・記録保存機能
・記録グラフ機能
・デザインを整える
・CNUMを変更して4x4や5x5もできるようにする
・６面そろえるチュートリアル
*/

var camera, scene, renderer;
var WIDTH, HEIGHT;
var SCALE; // WIDTHとHEIGHTの小さい方
var cube = [[[],[],[]],[[],[],[]],[[],[],[]]];
var c0 = [];
var FLD;
var CNUM = 3;
var CSIZE = 14;
var DLT = (CNUM - 1) * 0.5;
var ZOOM = 2500;
var SPEED = 0.007;
var FPS = 60;
var SPF = 1000 / FPS;
var THREDRAG = 0.01; // 回転させるドラッグ距離閾値
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
            SCALE = wl;
	    FLD.style.width = SCALE + "px";
	    FLD.style.height = SCALE + "px";
	    camera = new THREE.PerspectiveCamera(1, 1, 1000, 5000);
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
	    renderer.setSize(SCALE, SCALE);
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
            for(var i = 0; i < c0.length; i++){
                var p = cube[c0[i].x][c0[i].y][c0[i].z].position;
                var q = cube[c0[i].x][c0[i].y][c0[i].z].quaternion;
                if(axis == "x"){
                    p.y = c0[i].p0.y * Math.cos(dir * rad) - c0[i].p0.z * Math.sin(dir * rad);
                    p.z = c0[i].p0.z * Math.cos(dir * rad) + c0[i].p0.y * Math.sin(dir * rad);
                }else if(axis == "y"){
                    p.z = c0[i].p0.z * Math.cos(dir * rad) - c0[i].p0.x * Math.sin(dir * rad);
                    p.x = c0[i].p0.x * Math.cos(dir * rad) + c0[i].p0.z * Math.sin(dir * rad);
                }else if(axis == "z"){
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
                judgeClear();
                c0 = [];
            }
            t > 0 ? t++ : t--;
        }, SPF);
    }
}

function qcorrect(qelement){
    var elm = Math.round(qelement * 10) / 10;
    if([0, 1, -1, 0.5, -0.5].includes(elm)){
	return elm;
    }else if(elm > 0){
	return 1 / Math.sqrt(2);
    }else if(elm < 0){
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
//    if(!clickFlg){
//        turn(axis, val, dir);
//    }
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
    //alert("clear");
    console.log("clear");
}

function onDocumentMouseMove(e){
    e.preventDefault();
    // クリック中かつ回転アニメ済の場合
    if(clickFlg && turnFinishFlg){ 
	mouse1.x = (e.pageX / SCALE) * 2 - 1;
	mouse1.y = -(e.pageY / SCALE) * 2 + 1;
	var dx = mouse1.x - mouse0.x;
	var dy = mouse1.y - mouse0.y;
	// キューブをクリック中の場合
        if(pickFlg){
	    var axis;
	    var val;
            // クリック中だけどまだドラッグしてない場合
	    if(!dragFlg){
		clickedPlaneNormal = clickedPlane.normal.clone();
		clickedPlaneNormal.applyQuaternion(clickedPlane.parent.quaternion);
                var p = clickedPlaneNormal;
		p.x = Math.round(p.x * 1000000) / 1000000;
		p.y = Math.round(p.y * 1000000) / 1000000;
		p.z = Math.round(p.z * 1000000) / 1000000;
	    }
            // x軸に垂直な面をクリックした場合
	    if(clickedPlaneNormal.x == 1){
                // 2時または8時方向にドラッグした場合
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
		}else{
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
            // y軸に垂直な面をクリックした場合
	    }else if(clickedPlaneNormal.y == 1){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
		}else{
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
		}
            // z軸に垂直な面をクリックした場合
	    }else if(clickedPlaneNormal.z == 1){
		if(dy < 1 / R3 * dx && dy > -R3 * dx || dy > 1 / R3 * dx && dy < -R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
		}else{
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
        // キューブの外をクリック中の場合
	}else if (true){
	    if(mouse0.y < 1 / R3 * mouse0.x && mouse0.y > -1 / R3 * mouse0.x){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else{
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", 0, -1);
		}
	    }else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.x > 0){
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", 0, -1);
		}else{
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
	    }else if(mouse0.y > -1 / R3 * mouse0.x && mouse0.x < 0){
		if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "z" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "z";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("z", 0, -1);
		}else{
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
	    }else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.y < -1 / R3 * mouse0.x){
		if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		    if(turnAxis != "x" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "x";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("x", 0, -1);
		}else{
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", 0, 1);
		}
	    }else if(mouse0.y < 1 / R3 * mouse0.x && mouse0.x < 0){
		if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx + 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx + 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else{
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
	    }else if(mouse0.y < -1 / R3 * mouse0.x && mouse0.x > 0){
		if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		    if(turnAxis != "y" && c0.length > 0){
			for(var i = 0; i < c0.length; i++){
			    cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
			    cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
			}
			dragFlg = false;
		    }
		    turnAxis = "y";
		    rate = (0.5 * R3 * dx - 0.5 * dy) > 1 ? 1 : 0.5 * R3 * dx - 0.5 * dy;
		    dragTurn("y", 0, 1);
		}else{
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
        // ドラッグ距離が一定値を超えた場合
        if(dx * dx + dy * dy > THREDRAG){
            onDocumentMouseUp(e);
            return;
        }
    }
}

function onDocumentMouseDown(e){
    e.preventDefault();
    if(!turnFinishFlg){
	return;
    }
    clickFlg = true;

    // find clicked face
    mouse0.x = (e.pageX / SCALE) * 2 - 1;
    mouse0.y = -(e.pageY / SCALE) * 2 + 1;
    var mousez = new THREE.Vector2();
    mousez.x = (e.pageX / SCALE) * 2 - 1;
    mousez.y = -(e.pageY / SCALE) * 2 + 1;
    raycaster.setFromCamera(mousez, camera);
    var intersects = raycaster.intersectObjects(planes);
    if(intersects.length > 0){
	pickFlg = true;
	clickedPlane = intersects[0].object;
    }
}

function onDocumentMouseUp(e){
    e.preventDefault();
    // 回転中の場合は何もしない
    if(!turnFinishFlg){
	return;
    }
    // クリック中でないときは何もしない
    if(!clickFlg){
        return;
    }
    clickFlg = false;
    dragFlg = false;
    mouse1.x = (e.pageX / SCALE) * 2 - 1;
    mouse1.y = -(e.pageY / SCALE) * 2 + 1;
    var dx = mouse1.x - mouse0.x;
    var dy = mouse1.y - mouse0.y;
    if(pickFlg){
	pickFlg = false;
	var axis;
	var val;
	if(clickedPlaneNormal.x == 1){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > R3 * dx && dy > -1 / R3 * dx || dy < R3 * dx && dy < -1 / R3 * dx){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, 1);
	    }
	}else if(clickedPlaneNormal.y == 1){
	    if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }else if(dx < 0 && dy > 0 || dx > 0 && dy < 0){
		turn("z", clickedPlane.parent.position.z/CSIZE+2, -1);
	    }
	}else if(clickedPlaneNormal.z == 1){
	    if(dy < 1 / R3 * dx && dy > -R3 * dx || dy > 1 / R3 * dx && dy < -R3 * dx){
		turn("y", clickedPlane.parent.position.y/CSIZE+2, 1);
	    }else if(dy > 1 / R3 * dx && dy > -R3 * dx || dy < 1 / R3 * dx && dy < -R3 * dx){
		turn("x", clickedPlane.parent.position.x/CSIZE+2, -1);
	    }
	}
    }else{
        // クリック地点が3時方向の場合
        if(mouse0.y < 1 / R3 * mouse0.x && mouse0.y > -1 / R3 * mouse0.x){
	    if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		turn("y", 0, 1);
	    }else{
		turn("z", 0, -1);
	    }
        // クリック地点が1時方向
	}else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.x > 0){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("x", 0, -1);
	    }else{
		turn("z", 0, 1);
	    }
        // クリック地点が11時方向
	}else if(mouse0.y > -1 / R3 * mouse0.x && mouse0.x < 0){
	    if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		turn("z", 0, -1);
	    }else{
		turn("x", 0, -1);
	    }
        // クリック地点が9時方向
	}else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.y < -1 / R3 * mouse0.x){
	    if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
		turn("x", 0, -1);
	    }else{
		turn("y", 0, 1);
	    }
        // クリック地点が7時方向
	}else if(mouse0.y < 1 / R3 * mouse0.x && mouse0.x < 0){
	    if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
		turn("y", 0, 1);
	    }else{
		turn("x", 0, -1);
	    }
        // クリック地点が5時方向
	}else if(mouse0.y < -1 / R3 * mouse0.x && mouse0.x > 0){
	    if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
		turn("y", 0, 1);
	    }else{
		turn("z", 0, 1);
	    }
	}
    }
}




