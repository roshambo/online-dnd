/*
Left Click to add players
Right Click to draw shapes
Middle Click to delete shapes
Hover over character and press backspace to delete character
Drag images to customize characters
Note: Need to clean up code and need to implement custom board
*/

var resCount = 2;

var img = new Image();
img.onload = launchMe;
img.src = 'https://40.media.tumblr.com/7162784067e2c5f1e0186056ab8eeabd/tumblr_nib79rj5Sh1qb5gkjo5_1280.jpg';

var imgList = new Array();
var imgListLength = 0;

window.onload = launchMe;

function launchMe() {
    if (--resCount == 0) main();
}

function main() {
    hookKeys();

    // ----------------------------------------
    //     Canvas Setup
    // ----------------------------------------

    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    c.textBaseline = 'top';
    c.font = '10px sans-serif';
    c.fillStyle = '#00FFFF';

    // ----------------------------------------
    //     Tiles Setup
    // ----------------------------------------

    var x_tiles = 25;
    var y_tiles = 25;
    document.getElementById("xScale").onchange = function(event){
        x_tiles = event.target.value
    };
    document.getElementById("yScale").onchange = function(event){
        y_tiles = event.target.value
    };
    

    var tileCount = 0;
    var tileMap = new Array();
    for (x = 0; x < x_tiles; x++) {
        var row = new Array();
        for (y = 0; y < y_tiles; y++) {
            //row[y] = x * 20 + y * 30 + 0 | (Math.random() * 20);
            row[y] = x*20;
            tileCount++;
        }
        tileMap[x] = row;
    }

    // ----------------------------------------
    //     Display parameters
    // ----------------------------------------

    // center of the display on screen
    var displayCenterX = 1 * canvas.width / 3;
    var displayCenterY = 2 * canvas.height / 3;
    // angle of the x axis. Should be in [0, PI/2]
    var angleX = Math.PI/4; // Math.PI/6
    // angle of the y axis. Should be in [PI/2, PI]
    var angleY = Math.PI/2 + Math.PI/4; //2.8
    // scale for the tiles
    var scale = 50.0;
    // relative scale for the x of the tile. use it to stretch tiles.
    var relScaleX = 1;
    //for textures
    var experimental_useBitmapTiles = false;
    // how many tiles do we show in the back ?
    var viewBackDepth = 20;  //20
    // how many tiles do we show in the front ?
    var viewFrontDepth = 18;  //18
    // how many tiles do we show on the left ?
    var viewLeftDepth = 9;  //9
    // how many tiles do we show on the right ?
    var viewRightDepth = 20; //20
    // tile offset from 0,0 at which we start shadowing.
    var shadowStart = 9; //9
    // at shadowStart + shadowLength, tiles are black.
    var shadowLength = 12; //12
    // for 3D
    var enable3dEffect = true;
    // zShift : bigger means less influence for z
    var zShift = 1.0; // 1.0
    // zStrength bigger means more influence for z
    var zStrength = 2 / 10; // 2 / 10

    // ----------------------------------------
    //     Transforms
    // ----------------------------------------

    var transfMatrix = [Math.cos(angleX), Math.sin(angleX),
    Math.cos(angleY), Math.sin(angleY)];
    var _norm = relScaleX + 1;
    relScaleX /= _norm;
    transfMatrix[0] *= scale * relScaleX;
    transfMatrix[1] *= scale  * relScaleX;
    transfMatrix[2] *= scale / _norm;
    transfMatrix[3] *= scale / _norm;
    var determinant = transfMatrix[0] * transfMatrix[3] - transfMatrix[2] * transfMatrix[1];
    var transfMatrixRev = [transfMatrix[3], -transfMatrix[1], -transfMatrix[2], transfMatrix[0]];
    transfMatrixRev[0] /= determinant;
    transfMatrixRev[1] /= determinant;
    transfMatrixRev[2] /= determinant;
    transfMatrixRev[3] /= determinant;  
    
    // project on place vector from world to screen coordinates
    // not 3D-compliant
    function projectVector(v) {
        var col = v[0],
            row = v[1];
        v[0] = (transfMatrix[0] * col + transfMatrix[2] * row);
        v[1] = (transfMatrix[1] * col + transfMatrix[3] * row);
    }

    // project on place vector from screen to world coordinates
    // not 3D-compliant
    function revertVector(v) {
        var col = v[0],
            row = v[1];
        v[0] = (transfMatrixRev[0] * col + transfMatrixRev[2] * row);
        v[1] = (transfMatrixRev[1] * col + transfMatrixRev[3] * row);
    }

    // project on place the screen point into world coordinates
    function revertPoint(v, center) {
        v[0] -= displayCenterX;
        v[1] -= displayCenterY;
        // if handling 3D
        if (enable3dEffect) {
                var unScaledV1 = v[1] / scale;
                var drawBaseY = unScaledV1 / (zShift + unScaledV1 * zStrength);
                // compute zEffect
                v[2] = 1 / (zShift - zStrength * drawBaseY);
                v[0] /= v[2];
                v[1] /= v[2];
        }
        revertVector(v);
        v[0] += center[0];
        v[1] += center[1];
    }
    
    // project centered world coordinates (col, row) into screen coordinates
    // col and row do not have to be rounded.
    function projectFromCenter(col, row, pt) {
        var drawBaseX = (transfMatrix[0] * col + transfMatrix[2] * row);
        var drawBaseY = (transfMatrix[1] * col + transfMatrix[3] * row);
        if (enable3dEffect) {
              var zEffect = pt[2] = 1 / (zShift - zStrength * drawBaseY / scale);
              drawBaseX *= zEffect;
              drawBaseY *= zEffect;
        }
        pt[0] = displayCenterX + drawBaseX;
        pt[1] = displayCenterY + drawBaseY;
    }

    // ----------------------------------------
    //     Rendering
    // ----------------------------------------

    function setWorldTransform() {
         c.setTransform(transfMatrix[0],transfMatrix[1],
                         transfMatrix[2],transfMatrix[3],
                         displayCenterX, displayCenterY);
    }
    
    // draw player at point coord. 
    // if 3d, third coord is understood as scale.
    var playerPos = [];
    function drawPlayer(pt, alpha, imgNum, highlightBool) {
        c.save();
        c.translate(pt[0], pt[1]);
        if (enable3dEffect) {
                c.scale(pt[2], pt[2]);
        }
        if (alpha < 1.0) c.globalAlpha = alpha;
        if(highlightBool){
            c.fillStyle = "rgba(255, 255, 255, 1.0)";
            c.fillRect(-14, -19, 26, 26);
        }
        if(imgListLength > 0 && imgNum < imgListLength ){
            if (imgList[imgNum] != undefined){
                c.drawImage(imgList[imgNum], -12, -17, 22, 22);
            }
        }
        else{
            c.fillStyle = "rgba(150, 150, 150, 1.0)";
            c.fillRect(-12, -17, 22, 22);
        }   
        c.restore();
    }

    var shapePos = [];

    function drawFilledTile(colOffset, rowOffset, tileValue) {
        tileValue = tileValue  % 16;
        var pt = [colOffset - 0.5, rowOffset - 0.5];
        var tileBitmapX =  (0 | (tileValue / 4))*32*2;
        var tileBitmapY = (tileValue %4)*32*3;
        c.drawImage(img, tileBitmapX,tileBitmapY, 32,32, 
                colOffset - 0.5, rowOffset - 0.5, 1, 1);
                //c.drawImage(img, 0, 0, 32,32, 
                //colOffset - 0.5, rowOffset - 0.5, 1, 1);
    }

    // draw a tile at (colOffset, rowOffset ) centered world coordinates.
    function drawTile(colOffset, rowOffset, tileValue) {
        var pt = [0, 0];
        c.beginPath();
        for(var i = 0; i < shapePos.length; i += 2){
            if(colOffset == shapePos[i] && rowOffset == shapePos[i + 1]){
                c.fillStyle = "rgba(0, 100, 150, 1.0)";
                break;
            }
            else{
                c.fillStyle = 'hsl(' + (tileValue) + ',75%,75%)';
            }
        }
        if(shapePos.length == 0){
            c.fillStyle = 'hsl(' + (tileValue) + ',75%,75%)';
        }
        projectFromCenter(colOffset - 0.5, rowOffset - 0.5, pt);
        if (pt[1] > canvasHeight) return;
        c.moveTo(pt[0], pt[1]);
        projectFromCenter(colOffset + 0.5, rowOffset - 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        projectFromCenter(colOffset + 0.5, rowOffset + 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        projectFromCenter(colOffset - 0.5, rowOffset + 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        if (pt[1] < displayCenterY) {
            var dist = Math.max(Math.abs(colOffset), Math.abs(rowOffset));
            var alpha = 1.0;
            if (dist >= shadowStart) alpha = 1 - Math.pow((dist - shadowStart) / shadowLength, 0.8);
            c.globalAlpha = alpha;
        }
        c.fill();
        c.closePath();
        c.fillStyle = '#000';
        c.globalAlpha = 1.0;
        projectFromCenter(colOffset, rowOffset, pt);
        for(var i = 0; i < playerPos.length; i += 3){
            if(colOffset == playerPos[i] && rowOffset == playerPos[i + 1]){
                if(playerPos[i + 2] == 1){
                    drawPlayer(pt, alpha + 0.05, i/3, true);
                }
                else{
                    drawPlayer(pt, alpha + 0.05, i/3, false);
                }                   
            }
        }
    }

    // draw all tiles of the tileMap, with a view centered on
    // newCenterPoint
    function drawTiles(newCenterPoint) {
        // get rounded coordinates and floating part.
        var centerPoint = [0, 0];
        centerPoint[0] = Math.floor(newCenterPoint[0]);
        centerPoint[1] = Math.floor(newCenterPoint[1]);
        var remains = [newCenterPoint[0] - centerPoint[0],
        newCenterPoint[1] - centerPoint[1]];
        // compute start/end for loops on col/row
        var colStart = centerPoint[0] - viewBackDepth;
        var colEnd = centerPoint[0] + viewFrontDepth;
        var rowStart = centerPoint[1] - viewRightDepth;
        var rowEnd = centerPoint[1] + viewLeftDepth;
        // clamp start/end values
        if ((colEnd < 0) || (colStart >= x_tiles)) return;
        if (colStart < 0) colStart = 0;
        if (colEnd >= x_tiles) colEnd = x_tiles;
        if ((rowEnd < 0) || (rowStart >= y_tiles)) return;
        if (rowStart < 0) rowStart = 0;
        if (rowEnd >= y_tiles) rowEnd = y_tiles;
        
        if (experimental_useBitmapTiles) {
            c.save();
            setWorldTransform();
        }
        var drawTileMethod = (experimental_useBitmapTiles) ? 
                                    drawFilledTile
        : drawTile ;
        // iterate on col/rows
        var pt = [0, 0];
        for (var colIndex = colStart; colIndex < colEnd; colIndex++) {
            var colOffset = colIndex - centerPoint[0];
            for (rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
                var rowOffset = rowIndex - centerPoint[1];
                var thisTile = tileMap[colIndex][rowIndex];
                drawTileMethod(colOffset - remains[0],
                rowOffset - remains[1], thisTile);
            }
        }
        if (experimental_useBitmapTiles) c.restore();

    }

    var center = [x_tiles - 5, y_tiles - 5];
    drawTiles(center);

    // ----------------------------------------
    //     Mouse handling
    // ----------------------------------------
    var mousePos = [0, 0];
    var mousePosNorm = [0, 0];
    var mouseDown = false;
    var rightMouseDown = false;
    var middleMouseDown = false;

    var rect = canvas.getBoundingClientRect();

    function getMousePos(canvas, evt) {
        mousePos[0] = evt.clientX - rect.left;
        mousePos[1] = evt.clientY - rect.top;
    }

    canvas.addEventListener('mousedown', function (evt) {
        getMousePos(canvas, evt);
        if(evt.which == 1){
            mouseDown = true;
        }
        else if(evt.which == 2){
            middleMouseDown = true;
        }
        else if(evt.which == 3){
            rightMouseDown = true;
        }
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        mouseDown = false;
        rightMouseDown = false;
        middleMouseDown = false;
        getMousePos(canvas, evt);
    }, false);

    canvas.addEventListener('mouseout', function (evt) {
        mouseDown = false;
        rightMouseDown = false;
        middleMouseDown = false;
    }, false);

    canvas.addEventListener('mousemove', function (evt) {
        getMousePos(canvas, evt);
    }, false);


    // ----------------------------------------
    //     Text / for debugging
    // ----------------------------------------

    function text(){
        c.lineWidth = 10;
        c.fillStyle = 'rgba(255, 255, 255, 0.75)';
        c.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        c.font = "25px Arial";
        c.strokeText("x: " + x_tiles, (25), (canvasHeight) - 50);
        c.fillText("x: " + x_tiles, (25), (canvasHeight) - 50);
        c.strokeText("y: " + y_tiles, (100), (canvasHeight) - 50);
        c.fillText("y: " + y_tiles, (100), (canvasHeight) - 50);
        c.strokeText("x: " + playerPos[0], (200), (canvasHeight) - 50);
        c.fillText("x: " + playerPos[0], (200), (canvasHeight) - 50);
        c.strokeText("y: " + playerPos[1], (300), (canvasHeight) - 50);
        c.fillText("y: " + playerPos[1], (300), (canvasHeight) - 50);
        c.strokeText("x: " + mousePosNorm[0], (400), (canvasHeight) - 50);
        c.fillText("x: " + mousePosNorm[0], (400), (canvasHeight) - 50);
        c.strokeText("y: " + mousePosNorm[1], (500), (canvasHeight) - 50);
        c.fillText("y: " + mousePosNorm[1], (500), (canvasHeight) - 50);
    }
    text();

    // ----------------------------------------
    //     Key codes / key commands
    // ----------------------------------------

    var keys = {
        LEFT: 65,
        UP: 87,
        RIGHT: 68,
        DOWN: 83,
        PLAYERLEFT: 37,
        PLAYERUP: 38,
        PLAYERRIGHT: 39,
        PLAYERDOWN: 40,
        REMOVEPLAYER: 8
    };

    window.addEventListener("keydown", function(e) {
    // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    function hookKeys() {
        window.addEventListener('keydown', function (evt) {
            switch (evt.keyCode) {
                case keys.UP:
                    center[1] -= 1;
                    center[0] -= 1;
                    for(var i = 1; i < playerPos.length; i += 3){
                        playerPos[i] += 1;
                        playerPos[i - 1] += 1;
                    }
                    for(var i = 0; i < shapePos.length; i += 2){
                        shapePos[i] += 1;
                        shapePos[i + 1] += 1;
                    }
                    break;
                case keys.DOWN:
                    center[1] += 1;
                    center[0] += 1;
                    for(var i = 1; i < playerPos.length; i += 3){
                        playerPos[i] -= 1;
                        playerPos[i - 1] -= 1;
                    }
                    for(var i = 0; i < shapePos.length; i += 2){
                        shapePos[i] -= 1;
                        shapePos[i + 1] -= 1;
                    }
                    break;
                case keys.LEFT:
                    center[0] -= 1;
                    center[1] += 1;
                    for(var i = 0; i < playerPos.length; i += 3){
                        playerPos[i] += 1;
                        playerPos[i + 1] -= 1;
                    }
                    for(var i = 0; i < shapePos.length; i += 2){
                        shapePos[i] += 1;
                        shapePos[i + 1] -= 1;
                    }
                    break;
                case keys.RIGHT:
                    center[0] += 1;
                    center[1] -= 1;
                    for(var i = 0; i < playerPos.length; i += 3){
                        playerPos[i] -= 1;
                        playerPos[i + 1] += 1;
                    }
                    for(var i = 0; i < shapePos.length; i += 2){
                        shapePos[i] -= 1;
                        shapePos[i + 1] += 1;
                    }
                    break;
                case keys.PLAYERUP:
                    for(var i = 2; i < playerPos.length; i += 3){
                        if(playerPos[i] == 1 && playerPos[i - 1] + center[1] > 0){
                            for(var k = 0; k < playerPos.length; k += 3){
                                if(playerPos[i - 2] == playerPos[k] && playerPos[i - 1] - 1 == playerPos[k + 1]){
                                    return;
                                }
                            }
                            playerPos[i - 1] -= 1;
                        }
                    }
                    break;
                case keys.PLAYERDOWN:
                    for(var i = 2; i < playerPos.length; i += 3){
                        if(playerPos[i] == 1 && playerPos[i - 1] + center[1] < y_tiles - 1){
                            for(var k = 0; k < playerPos.length; k += 3){
                                if(playerPos[i - 2] == playerPos[k] && playerPos[i - 1] + 1 == playerPos[k + 1]){
                                    return;
                                }
                            }
                            playerPos[i - 1] += 1;
                        }
                    }
                    break;
                case keys.PLAYERLEFT:
                    for(var i = 2; i < playerPos.length; i += 3){
                        if(playerPos[i] == 1 && playerPos[i - 2] + center[0] > 0){
                            for(var k = 0; k < playerPos.length; k += 3){
                                if(playerPos[i - 2] - 1 == playerPos[k] && playerPos[i - 1] == playerPos[k + 1]){
                                    return;
                                }
                            }
                            playerPos[i - 2] -= 1;
                        }
                    }
                    break;
                case keys.PLAYERRIGHT:
                    for(var i = 2; i < playerPos.length; i += 3){
                        if(playerPos[i] == 1 && playerPos[i - 2] + center[0] < x_tiles - 1){
                            for(var k = 0; k < playerPos.length; k += 3){
                                if(playerPos[i - 2] + 1 == playerPos[k] && playerPos[i - 1] == playerPos[k + 1]){
                                    return;
                                }
                            }
                            playerPos[i - 2] += 1;
                        }
                    }
                    break;
                case keys.REMOVEPLAYER:
                    removePlayer = true;
                    break;
            };
        }, false);
    }

    // ----------------------------------------
    //     Character / Shape Manipulation
    // ----------------------------------------

    function putCharacters(){
        var dropChar = true;
        // if player wants to select an already existing character
        for(var i = 0; i < playerPos.length; i += 3){
            if(playerPos[i] == mousePosNorm[0] && playerPos[i + 1] == mousePosNorm[1]){
                for(var k = 2; k < playerPos.length; k += 3){
                    playerPos[k] = 0;
                } 
                dropChar = false;
                playerPos[i + 2] = 1;
                break;
            }
        }
        // if player wants to drop another character
        if(dropChar && center[0] + mousePosNorm[0] < x_tiles && center[1] + mousePosNorm[1] < y_tiles){
            if(center[0] + mousePosNorm[0] >= 0 && center[1] + mousePosNorm[1] >= 0){
                for(var k = 2; k < playerPos.length; k += 3){
                    playerPos[k] = 0;
                } 
                playerPos.push(mousePosNorm[0]);
                playerPos.push(mousePosNorm[1]);
                playerPos.push(1);
            }
        }
    }

    function drawShapes(){
        var drawShape = true;
        for (var i = 0; i < shapePos.length; i += 2){
            if(shapePos[i] == mousePosNorm[0] && shapePos[i + 1] == mousePosNorm[1]){
                drawShape = false;
                break;
            }
        }
        if(drawShape && center[0] + mousePosNorm[0] < x_tiles && center[1] + mousePosNorm[1] < y_tiles){
            if(center[0] + mousePosNorm[0] >= 0 && center[1] + mousePosNorm[1] >= 0){
                shapePos.push(mousePosNorm[0]);
                shapePos.push(mousePosNorm[1]);
            }
        }
    }

    function removeShapes(){
        for (var i = 0; i < shapePos.length; i += 2){
            if(shapePos[i] == mousePosNorm[0] && shapePos[i + 1] == mousePosNorm[1]){
                shapePos.splice(i, 2);
                break;
            }
        }
    }

    // ----------------------------------------
    //     Animation / keeps running
    // ----------------------------------------

    var landMoveSpeed = 0.07;
    var removePlayer = false;

    function animate(){
        requestAnimationFrame(animate);
        var pt = [0, 0];
        pt[0] = mousePos[0] - displayCenterX;
        pt[1] = mousePos[1] - displayCenterY;
        var origPt = [mousePos[0], mousePos[1]];
        var norm = Math.sqrt(sq(pt[0]) + sq(pt[1]));
        pt[0] /= norm;
        pt[1] /= norm;
        revertVector(pt);

        if(mouseDown){
            putCharacters();
            mouseDown = false;
        }
        if(rightMouseDown){
            drawShapes();
        }
        if(middleMouseDown){
            removeShapes();
        } 
        if(removePlayer){
            for (var i = 0; i < playerPos.length; i += 3){
                if(playerPos[i] == mousePosNorm[0] && playerPos[i + 1] == mousePosNorm[1]){
                    playerPos.splice(i, 3);
                    break;
                }
            }
        }
        for(var i = 0; i < playerPos.length; i += 3){
            if(playerPos[i] + center[0] >= x_tiles){
                playerPos[i]--;
            }
            if(playerPos[i + 1] + center[1] >= y_tiles){
                playerPos[i + 1]--;
            }
        }

        c.clearRect(0, 0, canvasWidth, canvasHeight);
        drawTiles(center);
        revertPoint(origPt, center);
        drawTile(origPt[0] - center[0], origPt[1] - center[1], 155.5);
        mousePosNorm[0] = Math.floor(origPt[0] - center[0] + 0.5);
        mousePosNorm[1] = Math.floor(origPt[1] - center[1] + 0.5);
        removePlayer = false;
        //text();
    }
    animate();
}

// ----------------------------------------
//     Utilities
// ----------------------------------------

function sq(x) {
    return x * x
};

// ----------------------------------------
//     Drag and drop image 
//     http://www.html5rocks.com/en/tutorials/dnd/basics/
// ----------------------------------------

if(window.FileReader) { 
    var drop; 
    addEventHandler(window, 'load', function() {
    var status = document.getElementById('status');
    drop   = document.getElementById('drop');
    var list   = document.getElementById('list');
    
    function cancel(e) {
        if (e.preventDefault) { e.preventDefault(); }
        return false;
    }
  
    // Tells the browser that we *can* drop on this target
    addEventHandler(drop, 'dragover', cancel);
    addEventHandler(drop, 'dragenter', cancel);

    addEventHandler(drop, 'drop', function (e) {
        e = e || window.event; // get window.event if e argument missing (in IE)   
        if (e.preventDefault) { e.preventDefault(); } // stops the browser from redirecting off to the image.
        var dt    = e.dataTransfer;
        var files = dt.files;
        for (var i=0; i<files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
      
            //attach event handlers here...
   
            reader.readAsDataURL(file);
            addEventHandler(reader, 'loadend', function(e, file) {
                var bin           = this.result; 
                var newFile       = document.createElement('div');
                newFile.innerHTML = 'Loaded : '+file.name+' size '+file.size+' B';
                list.appendChild(newFile);  
                var fileNumber = list.getElementsByTagName('div').length;
                status.innerHTML = fileNumber < files.length 
                    ? 'Loaded 100% of file '+fileNumber+' of '+files.length+'...' 
                    : 'Done loading. processed '+fileNumber+' files.';

                var image = document.createElement("img"); 
                image.file = file;   
                image.src = bin;
                //list.appendChild(img);
                imgList[imgListLength] = new Image();
                imgList[imgListLength] = image;
                imgListLength++;
            }.bindToEventHandler(file));
        }
        return false;
    });
    Function.prototype.bindToEventHandler = function bindToEventHandler() {
        var handler = this;
        var boundParameters = Array.prototype.slice.call(arguments);
        //create closure
        return function(e) {
            e = e || window.event; // get window.event if e argument missing (in IE)   
            boundParameters.unshift(e);
            handler.apply(this, boundParameters);
        }
    };
});
} else { 
    document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
}

function addEventHandler(obj, evt, handler) {
    if(obj.addEventListener) {
        // W3C method
        obj.addEventListener(evt, handler, false);
    } else if(obj.attachEvent) {
        // IE method.
        obj.attachEvent('on'+evt, handler);
    } else {
        // Old school method.
        obj['on'+evt] = handler;
    }
}
