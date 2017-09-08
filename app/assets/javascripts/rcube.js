/*
課題
・スタートボタン（シャッフル）
・元に戻すボタン
・ログイン機能
・記録保存機能
・記録グラフ機能
・デザインを整える
・６面そろえるチュートリアル
・画像ではなくthree.jsの機能で表面の色を描くようにする
・CNUMを大きくしてもカクカクにならないように計算量削減
*/

// parameters
var CNUM = 3; // 1辺のキューブ数
var SIZE = 42; // キューブの大きさ
var SPEED = 0.005; // 回転速度
var FPS = 60; // 回転時のFramesPerSecond
var THREDRAG = 0.01; // 回転させるドラッグ距離閾値

// constants
var camera, scene, renderer;
var SCALE; // canvasの横幅および高さ
var cube = [[[]]];
var c0 = [];
var FLD;
var CSIZE = SIZE / CNUM;
var DLT = (CNUM - 1) * 0.5;
var ZOOM = 2500;
var MSPF = 1000 / FPS;
var rate;
var raycaster;
var pickFlg = false;
var clickFlg = false;
var dragFlg = false;
var turnFinishFlg = true;
var clickedPlane;
var clickedPlaneNormal;
var timeFlg = true;
var turnAxis = "";
var turnDir = 0;
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
    var nloaded = 0; // ロード完了した色の数
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
        if(x != 0) cube.push([[]]);
        for(var y = 0; y < CNUM; y++){
            if(y != 0) cube[x].push([]);
            for(var z = 0; z < CNUM; z++){
                //cube[x][y][z] = new THREE.Object3D();
                cube[x][y].push(new THREE.Object3D());
                addFace(x, y, z, "z", 0       , orange, [0, 0, -CSIZE / 2], [0, 1, 0, 0] , [0, 0, -1]);
                addFace(x, y, z, "x", CNUM - 1, blue  , [CSIZE / 2, 0, 0] , [0, 1, 0, 1] , [1, 0, 0] );
                addFace(x, y, z, "z", CNUM - 1, red   , [0, 0, CSIZE / 2] , [0, 0, 0, 1] , [0, 0, 1] );
                addFace(x, y, z, "x", 0       , green , [-CSIZE / 2, 0, 0], [0, 1, 0, -1], [-1, 0, 0]);
                addFace(x, y, z, "y", CNUM - 1, white , [0, CSIZE / 2, 0] , [1, 0, 0, -1], [0, 1, 0] );
                addFace(x, y, z, "y", 0       , yellow, [0, -CSIZE / 2, 0], [1, 0, 0, 1] , [0, -1, 0]);
                cube[x][y][z].position.set((x - DLT) * CSIZE, (y - DLT) * CSIZE, (z - DLT) * CSIZE);
                cube[x][y][z].positionLogical = new THREE.Vector3(x, y, z);
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
//console.log(cube);

    // initial render
    var tmr = setInterval(function(){
        if(nloaded >= 7){
            clearInterval(tmr);
            FLD = document.getElementById('canvas-frame');
            //var ww = window.innerWidth;
            var ww = FLD.clientWidth;
            var wh = window.innerHeight - 100;
            //FLD.style.height = window.innerHeight - 200;
            console.log(document.getElementById('wrapper').clientWidth);
            //console.log(FLD.clientWidth);
            //console.log(window.innerHeight);
            //console.log(FLD.clientHeight);
            //var ww = FLD.style.width;
            //var wh = FLD.style.height;
            SCALE = ww > wh ? wh : ww;
            //document.getElementById('wrapper').style.width = (SCALE + 20) + "px";
            //FLD.style.width = (SCALE + 2) + "px";
            FLD.style.height = SCALE + "px";
            //FLD.style.height = (SCALE + 2) + "px";
            //SCALE = SCALE - 2;
            camera = new THREE.PerspectiveCamera(1, 1, 1000, 5000);
            camera.position.set(ZOOM, ZOOM, ZOOM);
            camera.lookAt({x: 0, y: 0, z: 0});
            FLD.innerHTML = "";
            FLD.addEventListener('mousemove'  , onDocumentMouseMove, false);
            FLD.addEventListener('mousedown'  , onDocumentMouseDown, false);
            FLD.addEventListener('mouseup'    , onDocumentMouseUp  , false);
            FLD.addEventListener('mouseout'   , onDocumentMouseOut , false);
            FLD.addEventListener('touchmove'  , onDocumentMouseMove, false);
            FLD.addEventListener('touchstart' , onDocumentMouseDown, false);
            FLD.addEventListener('touchend'   , onDocumentMouseUp  , false);
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(SCALE, SCALE);
            FLD.appendChild(renderer.domElement);
            renderer.setClearColor(0xffffff, 1.0);
            renderer.render(scene, camera);
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

function onDocumentMouseMove(e){
    e.preventDefault();
    // クリック中かつ回転アニメ済の場合
    if(clickFlg && turnFinishFlg){ 
        mouse1.x = (e.layerX / SCALE) * 2 - 1;
        mouse1.y = -(e.layerY / SCALE) * 2 + 1;
        var dx = mouse1.x - mouse0.x;
        var dy = mouse1.y - mouse0.y;
        // キューブをクリック中の場合
        if(pickFlg){
            var val;
            // クリック中だけどまだドラッグしてない場合
            if(!dragFlg){
                clickedPlaneNormal = clickedPlane.normal.clone();
                clickedPlaneNormal.applyQuaternion(clickedPlane.parent.quaternion);
                clickedPlaneNormal.round();
            }
            // x軸に垂直な面をクリックした場合
            if(clickedPlaneNormal.x == 1){
                if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
                    dragTurnAction("y", 1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("z", 1, dy);
                }
            }else if(clickedPlaneNormal.y == 1){
                if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
                    dragTurnAction("x", -1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("z", -1, 0.5 * R3 * dx - 0.5 * dy);
                }
            }else if(clickedPlaneNormal.z == 1){
                if(dy < 1 / R3 * dx && dy > -R3 * dx || dy > 1 / R3 * dx && dy < -R3 * dx){
                    dragTurnAction("y", 1, 0.5 * R3 * dx - 0.5 * dy);
                }else{
                    dragTurnAction("x", -1, dy);
                }
            }
        // キューブの外をクリック中の場合
        }else if (true){
            if(mouse0.y < 1 / R3 * mouse0.x && mouse0.y > -1 / R3 * mouse0.x){
                if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
                    dragTurnAction("y", 1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("z", -1, 0.5 * R3 * dx - 0.5 * dy);
                }
            }else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.x > 0){
                if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
                    dragTurnAction("x", -1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("z", 1, dy);
                }
            }else if(mouse0.y > -1 / R3 * mouse0.x && mouse0.x < 0){
                if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
                    dragTurnAction("z", -1, 0.5 * R3 * dx - 0.5 * dy);
                }else{
                    dragTurnAction("x", -1, dy);
                }
            }else if(mouse0.y > 1 / R3 * mouse0.x && mouse0.y < -1 / R3 * mouse0.x){
                if(dx > 0 && dy > 0 || dx < 0 && dy < 0){
                    dragTurnAction("x", -1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("y", 1, 0.5 * R3 * dx - 0.5 * dy);
                }
            }else if(mouse0.y < 1 / R3 * mouse0.x && mouse0.x < 0){
                if(dy < R3 * dx && dy > -1 / R3 * dx || dy > R3 * dx && dy < -1 / R3 * dx){
                    dragTurnAction("y", 1, 0.5 * R3 * dx + 0.5 * dy);
                }else{
                    dragTurnAction("x", -1, dy);
                }
            }else if(mouse0.y < -1 / R3 * mouse0.x && mouse0.x > 0){
                if(dy < -R3 * dx && dy > 1 / R3 * dx || dy > -R3 * dx && dy < 1 / R3 * dx){
                    dragTurnAction("y", 1, 0.5 * R3 * dx - 0.5 * dy);
                }else{
                    dragTurnAction("z", 1, dy);
                }
            }
        }
        // ドラッグ距離が一定値を超えた場合
        if(dx * dx + dy * dy > THREDRAG){
            turnAction();
        }
    }
}

function onDocumentMouseDown(e){
    //console.log("onDocumentMouseDown");
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
    mouse0.x = (e.layerX / SCALE) * 2 - 1;
    mouse0.y = -(e.layerY / SCALE) * 2 + 1;
    var mousez = new THREE.Vector2();
    mousez.x = (e.layerX / SCALE) * 2 - 1;
    mousez.y = -(e.layerY / SCALE) * 2 + 1;
    raycaster.setFromCamera(mousez, camera);
    var intersects = raycaster.intersectObjects(planes);
    if(intersects.length > 0){
        pickFlg = true;
        clickedPlane = intersects[0].object;
    }
}

function onDocumentMouseUp(e){
    //console.log("onDocumentMouseUp");
    e.preventDefault();
    turnAction();
}

function onDocumentMouseOut(e){
    //console.log("onDocumentMouseOut");
    if(clickFlg){
        turnAction();
    }
}

function dragTurnAction(axis, dir, rateArg){
    if(turnAxis != axis && c0.length > 0){
        for(var i = 0; i < c0.length; i++){
            cube[c0[i].x][c0[i].y][c0[i].z].position.copy(c0[i].p0);
            cube[c0[i].x][c0[i].y][c0[i].z].quaternion.copy(c0[i].q0);
        }
        dragFlg = false;
    }
    turnAxis = axis;
    rate = rateArg;
    if(pickFlg){
        switch(turnAxis){
            case "x": dragTurn(clickedPlane.parent.positionLogical.x, dir);
            case "y": dragTurn(clickedPlane.parent.positionLogical.y, dir);
            case "z": dragTurn(clickedPlane.parent.positionLogical.z, dir);
        }
    }else{
        dragTurn(-1, dir);
    }
}

function dragTurn(val, dir){
    turnDir = dir;
    if(!dragFlg){
        // calculate goal of quaternion (q1)
        dragFlg = true;
        c0 = [];
        var tval = (val - 1 - DLT) * CSIZE;
        for(var x = 0; x < CNUM; x++){
            for(var y = 0; y < CNUM; y++){
                for(var z = 0; z < CNUM; z++){
                    var p = cube[x][y][z].position;
                    var pl = cube[x][y][z].positionLogical;
                    var q = cube[x][y][z].quaternion;
                    var p0 = p.clone();
                    var q0 = q.clone();
                    if(turnAxis == "x" && (pl.x == val || val == -1)){
                        var q1 = new THREE.Quaternion().set(1, 0, 0, turnDir).normalize().multiply(q.clone());
                        c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                    } else if (turnAxis == "y" && (pl.y == val || val == -1)){
                        var q1 = new THREE.Quaternion().set(0, 1, 0, turnDir).normalize().multiply(q.clone());
                        c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                    } else if (turnAxis == "z" && (pl.z == val || val == -1)){
                        var q1 = new THREE.Quaternion().set(0, 0, 1, turnDir).normalize().multiply(q.clone());
                        c0.push({x: x, y: y, z: z, p0: p0, q0: q0, q1: q1});
                    }
                }
            }
        }
    }
    // animate turn
    var rad = 0.5 * Math.PI * rate;
    turnAllCubes();
    renderer.render(scene, camera);
}

function turnAction(){
    //console.log("turnAction");
    if(!turnFinishFlg){
        return;
    }
    if(!clickFlg){
        return;
    }
    clickFlg = false;
    dragFlg = false;
    pickFlg = false;
    turn();
}

function turn(){
    turnFinishFlg = false;
    // animate turn
    var anm = setInterval(function(){
        // if turn finish
        if(Math.abs(rate) >= 1){
            turnFinishFlg = true;
            clearInterval(anm);
            rate = rate > 0 ? 1 : -1;
        }
        turnAllCubes();
        renderer.render(scene, camera);
        if(turnFinishFlg){
            for(var i = 0; i < c0.length; i++){
                var p = cube[c0[i].x][c0[i].y][c0[i].z].position;
                var pl = cube[c0[i].x][c0[i].y][c0[i].z].positionLogical;
                var q = cube[c0[i].x][c0[i].y][c0[i].z].quaternion;
                pl.set(p.x / CSIZE + DLT, p.y / CSIZE + DLT, p.z / CSIZE + DLT).round();
                p.set((pl.x - DLT) * CSIZE, (pl.y - DLT) * CSIZE, (pl.z - DLT) * CSIZE);
                q.x = qcorrect(q.x);
                q.y = qcorrect(q.y);
                q.z = qcorrect(q.z);
                q.w = qcorrect(q.w);
            }
            judgeClear();
            c0 = [];
        }
        rate = rate > 0 ? rate + MSPF * SPEED : rate - MSPF * SPEED;
    }, MSPF);
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
       
function turnAllCubes(){
    var rad = 0.5 * Math.PI * rate;
    for(var i = 0; i < c0.length; i++){
        var p = cube[c0[i].x][c0[i].y][c0[i].z].position;
        var q = cube[c0[i].x][c0[i].y][c0[i].z].quaternion;
        if(turnAxis == "x"){
            p.y = c0[i].p0.y * Math.cos(turnDir * rad) - c0[i].p0.z * Math.sin(turnDir * rad);
            p.z = c0[i].p0.z * Math.cos(turnDir * rad) + c0[i].p0.y * Math.sin(turnDir * rad);
        }else if(turnAxis == "y"){
            p.z = c0[i].p0.z * Math.cos(turnDir * rad) - c0[i].p0.x * Math.sin(turnDir * rad);
            p.x = c0[i].p0.x * Math.cos(turnDir * rad) + c0[i].p0.z * Math.sin(turnDir * rad);
        }else if(turnAxis == "z"){
            p.x = c0[i].p0.x * Math.cos(turnDir * rad) - c0[i].p0.y * Math.sin(turnDir * rad);
            p.y = c0[i].p0.y * Math.cos(turnDir * rad) + c0[i].p0.x * Math.sin(turnDir * rad);
        }
        THREE.Quaternion.slerp(c0[i].q0, c0[i].q1, q, rate);
    }
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
    stopTime();
    //alert("clear");
    console.log("clear");
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



