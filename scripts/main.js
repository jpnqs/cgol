if (!Boolean(window.HTMLCanvasElement)) {
    alert("Your'e browser does not support this application!");
    throw new Error("No canvas support");
}

let color = localStorage.getItem("color") || "#be0000"
if (color) {
    document.documentElement.style.setProperty('--color', color);
    document.getElementById("colorPicker").value = color;
}

let oCanvas = document.getElementById("canvas");
let oGen = document.getElementById("generation");
let sActiveTool = "PEN";
let bRunning = false;
let bRunningSave = false;
let bAging = true;
let bWaitDuration = 100;
let nAutoRetry = 500;
let nGeneration = 0;
let bAutoRetry = false;
let nGenerationPercentage = 31;

let bDraw = true;
let bMouseDown = false;
var oField = new Field(100, 100, oCanvas);
let oProbOut = document.getElementById("prob-out");

for (let i=0;i<oField.aField.length;i++) {
    let aRow = oField.aField[i];
    for (let j=0;j<aRow.length;j++) {
        if (Math.floor(Math.random() * 101) < nGenerationPercentage) {
            oField.aField[i][j] = 1;
        }
    }
}

let oEraser = document.getElementById("eraser");
let oPen = document.getElementById("pen");

function exportImage(el) {
    let data = oCanvas.toDataURL("image/jpg");
    el.href = data;
}

function exportFile(el) {
    el.href = "data:application/octet-stream," + oField.createExportData();
}

document.onkeypress = function(ev) {
    if (ev.code == "Space") {
        $("#runner").click()
    } 
    else if (ev.code == "KeyR") {
        $("#retry").click();
    }
    else if (ev.code == "KeyF") {
        if((window.fullScreen) ||
            (window.innerWidth == screen.width && window.innerHeight == screen.height)) {

                exitFullscreen()
            } else {
                openFullscreen()
        }

    }
}


function uploadAndApplyFile() {
    let inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".cgol";
    inp.style.display = "none";
    inp.addEventListener("change", (ev) => {
        let file = ev.srcElement.files[0];
        let fr = new FileReader();
        fr.addEventListener("load", event => {
            oField.loadExportedData(event.srcElement.result);
        });
        fr.readAsText(file);
    })
    document.body.appendChild(inp);
    $(inp).click();
    
}

function activateTool(el, tool) {

    let tools = document.getElementsByClassName("tool");

    for(let i=0; i<tools.length; i++) {
        tools[i].classList.remove("draw-button-active");
    }
    sActiveTool = tool;
    switch (tool) {
        case 'PEN':
            penActive()
            break;
        case 'ERA':
            eraserActive()
            break;
    }
    el.classList.add("draw-button-active");
}

function hideDrawing() {
    let cont = document.getElementById("drawing-content");

    if (!window.drawingContentOpen) {
        window.drawingContentOpen = true; 
        $("#drawing-expand").text("expand_more")

            $("#drawing-content").animate({
                height: "0px"
            }, 250)

    } else {
        window.drawingContentOpen = false;
        // cont.style.display = "block";
        $("#drawing-expand").text("expand_less")
        $("#drawing-content").animate({
            height: "13rem"
        }, 250)

    }

}

function hideImportExport() {
    if (!window.importExportContentOpen) {
        window.importExportContentOpen = true; 
        $("#import_export-expand").text("expand_more")

            $("#import_export-content").animate({
                height: "0px"
            }, 250)

    } else {
        window.importExportContentOpen = false;
        // cont.style.display = "block";
        $("#import_export-expand").text("expand_less")
        $("#import_export-content").animate({
            height: "10rem"
        }, 250)

    }

}

function hideTemplateTools() {
    if (!window.toolsContentOpen) {
        window.toolsContentOpen = true; 
        $("#template-tool-expand").text("expand_more")

            $("#template-tool-content").animate({
                height: "0px"
            }, 250)

    } else {
        window.toolsContentOpen = false;
        // cont.style.display = "block";
        $("#template-tool-expand").text("expand_less")
        $("#template-tool-content").animate({
            height: "13rem"
        }, 250)

    }
}

function hideSettingsTools() {
    if (!window.toolsSettingsOpen) {
        window.toolsSettingsOpen = true; 
        $("#setting-tool-expand").text("expand_more")

            $("#setting-tool-content").animate({
                height: "0px"
            }, 250)

    } else {
        window.toolsSettingsOpen = false;
        // cont.style.display = "block";
        $("#setting-tool-expand").text("expand_less")
        $("#setting-tool-content").animate({
            height: "13rem"
        }, 250)

    }
}

var colorPicker = document.getElementById("colorPicker");

colorPicker.addEventListener("change", () => {
    document.documentElement.style.setProperty('--color', colorPicker.value);
    window.localStorage.setItem("color", colorPicker.value);
})

function openFullscreen() {
    if (oCanvas.requestFullscreen) {
        oCanvas.requestFullscreen();
    } else if (oCanvas.mozRequestFullScreen) { /* Firefox */
        oCanvas.mozRequestFullScreen();
    } else if (oCanvas.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        oCanvas.webkitRequestFullscreen();
    } else if (oCanvas.msRequestFullscreen) { /* IE/Edge */
        oCanvas.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  

function penActive() {
    oEraser.classList.remove("draw-button-active");
    oPen.classList.add("draw-button-active");
    bDraw = true
}

function eraserActive() {
    oPen.classList.remove("draw-button-active");
    oEraser.classList.add("draw-button-active");
    bDraw = false
}

function startStop(bool = undefined) {
    if (bool == undefined) {
        bRunning = !bRunning;

    } else {
        bRunning = bool;
    }
    if (bRunning) {
        if (potrait.matches) {
            openCloseMobileSettings();
        }
        document.getElementById("play").innerText = "pause_circle_outline" 

    } else {
        document.getElementById("play").innerText = "play_circle_outline" 

    }
}

function drawWithTool(oEvent, click) {
    let width = getComputedStyle(oCanvas).width;
    let div = width.substring(0, width.length - 2) / 100;
    if (bMouseDown || click) {
        let x = Math.floor( oEvent.offsetX / div );
        let y = Math.floor( oEvent.offsetY / div );
        if (sActiveTool == "PEN" || sActiveTool == "ERA") {
            try {
                if (bDraw) {
                    oField.aField[x][y] = 1;
                } else {
                    oField.aField[x][y] = 0;
                }
            oField.draw();
        
            } catch (err) {}
        } else if (sActiveTool == "G1" && click) {
            oField.aField[x][y] = 1;
            oField.aField[x + 1][y + 1] = 1;
            oField.aField[x + 2][y + 1] = 1;
            oField.aField[x + 2][y] = 1;
            oField.aField[x + 2][y - 1] = 1
            // oField.oContext.fillRect(x * 6, y * 6, 6, 6);
            // oField.oContext.fillRect((x + 1) * 6, (y + 1) * 6, 6, 6);
            // oField.oContext.fillRect((x + 2) * 6, (y + 1) * 6, 6, 6);
            // oField.oContext.fillRect((x + 2) * 6, (y) * 6, 6, 6);
            // oField.oContext.fillRect((x + 2) * 6, (y - 1) * 6, 6, 6);
        } else if (sActiveTool == "G2" && click) {
            const setXY = (x, y) => oField.aField[x][y] = 1;
            setXY(x, y);
            setXY(x + 3, y);
            setXY(x + 4, y - 1);
            setXY(x + 4, y - 2);
            setXY(x + 4, y - 3);
            setXY(x + 3, y - 3);
            setXY(x + 2, y - 3);
            setXY(x + 1, y - 3);
            setXY(x, y - 2);
        } else if (sActiveTool == "G3" && click) {
            const setXY = (x, y) => oField.aField[x][y] = 1;

            setXY(x + 1, y);
            setXY(x, y + 1);
            setXY(x, y + 2);
            setXY(x + 2, y + 1);
            setXY(x + 3, y + 2);
            setXY(x + 2, y + 3);
            setXY(x + 2, y + 4);
            setXY(x + 3, y + 4);
            setXY(x + 5, y + 4);
            setXY(x + 6, y + 4);
            setXY(x + 6, y + 3);
            setXY(x + 5, y + 2);
            setXY(x + 6, y + 1);
            setXY(x + 7, y);
            setXY(x + 8, y + 1);
            setXY(x + 8, y + 2);
        } else if (sActiveTool == "G4" && click) {
            const setXY = (x, y) => oField.aField[x][y] = 1;

            setXY(x, y + 1);
            setXY(x + 1, y + 1);
            setXY(x + 1, y + 2);
            setXY(x + 1, y);
            setXY(x + 2, y);

        }
    } else {
        let x = Math.floor( oEvent.offsetX / div );
        let y = Math.floor( oEvent.offsetY / div );
        if (sActiveTool == "PEN" || sActiveTool == "ERA") {
            try {
                oField.draw();
                    oField.oContext.fillStyle = "gray";
                    oField.oContext.fillRect(x * 6, y * 6, 6, 6);
            // 
        
            } catch (err) {}

        } else if (sActiveTool == "G1") {
            oField.draw();
            oField.oContext.fillStyle = "gray";
            oField.oContext.fillRect(x * 6, y * 6, 6, 6);
            oField.oContext.fillRect((x + 1) * 6, (y + 1) * 6, 6, 6);
            oField.oContext.fillRect((x + 2) * 6, (y + 1) * 6, 6, 6);
            oField.oContext.fillRect((x + 2) * 6, (y) * 6, 6, 6);
            oField.oContext.fillRect((x + 2) * 6, (y - 1) * 6, 6, 6);



        } else if (sActiveTool == "G2") {
            const drawXY = (x,y) => oField.oContext.fillRect(x * 6, y * 6, 6, 6);

            oField.draw();
            oField.oContext.fillStyle = "gray";
            drawXY(x, y);
            drawXY(x + 3, y);
            drawXY(x + 4, y - 1);
            drawXY(x + 4, y - 2);
            drawXY(x + 4, y - 3);
            drawXY(x + 3, y - 3);
            drawXY(x + 2, y - 3);
            drawXY(x + 1, y - 3);
            drawXY(x, y - 2);
        } else if (sActiveTool == "G3") {
            const drawXY = (x,y) => oField.oContext.fillRect(x * 6, y * 6, 6, 6);

            oField.draw();
            oField.oContext.fillStyle = "gray";
            drawXY(x + 1, y);
            drawXY(x, y + 1);
            drawXY(x, y + 2);
            drawXY(x + 2, y + 1);
            drawXY(x + 3, y + 2);
            drawXY(x + 2, y + 3);
            drawXY(x + 2, y + 4);
            drawXY(x + 3, y + 4);
            drawXY(x + 5, y + 4);
            drawXY(x + 6, y + 4);
            drawXY(x + 6, y + 3);
            drawXY(x + 5, y + 2);
            drawXY(x + 6, y + 1);
            drawXY(x + 7, y);
            drawXY(x + 8, y + 1);
            drawXY(x + 8, y + 2);

        } else if (sActiveTool == "G4") {
            const drawXY = (x,y) => oField.oContext.fillRect(x * 6, y * 6, 6, 6);

            oField.draw();
            oField.oContext.fillStyle = "gray";

            drawXY(x, y + 1);
            drawXY(x + 1, y + 1);
            drawXY(x + 1, y + 2);
            drawXY(x + 1, y);
            drawXY(x + 2, y);




        }
            
    }
}

oCanvas.addEventListener("click", oEvent => {
    // let width = getComputedStyle(oCanvas).width;
    // let div = width.substring(0, width.length - 2) / 100;
    // let x = Math.floor( oEvent.offsetX / div );
    // let y = Math.floor( oEvent.offsetY / div );
    // try {
    //     if (bDraw) {
    //         oField.aField[x][y] = 1;
    //     } else {
    //         oField.aField[x][y] = 0;
    //     }
    // oField.draw();

    // } catch (err) {}
    drawWithTool(oEvent, true);
});

oCanvas.addEventListener("mousedown", () => {
    bRunningSave = bRunning;
    bRunning = false;
    bMouseDown = true
});
oCanvas.addEventListener("mouseup", () => {
    bMouseDown = false
    bRunning = bRunningSave;
});
oCanvas.addEventListener("touchstart", () => {
    var mouseEvent = new MouseEvent("mousedown", {});
    oCanvas.dispatchEvent(mouseEvent);
});
oCanvas.addEventListener("touchend", () => {
    var mouseEvent = new MouseEvent("mouseup", {});
    oCanvas.dispatchEvent(mouseEvent);
})

oCanvas.addEventListener("touchmove", (oEvent) => {
    var touch = oEvent.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
})

oCanvas.addEventListener("mousemove", (oEvent) => {
    drawWithTool(oEvent);
});

function probability(val) {
    nGenerationPercentage = val;
    oProbOut.innerText = val;
    if (!bRunning) {
        regenerate();
    }
} 

function regenerate() {
    nGeneration = 0;
    updateGen();
    startStop(false);

    oField = new Field(100, 100, oCanvas);

    for (let i=0;i<oField.aField.length;i++) {
        let aRow = oField.aField[i];
        for (let j=0;j<aRow.length;j++) {
            if (Math.floor(Math.random() * 101) < nGenerationPercentage) {
                oField.aField[i][j] = 1;
            }
        }
    }
    oField.draw();
}

function clearCanvas() {
    for (let i=0;i<oField.aField.length;i++) {
        let aRow = oField.aField[i];
        for (let j=0;j<aRow.length;j++) {
            oField.aField[i][j] = 0;
        }
    }
    oField.draw();
    bRunning = false;
    nGeneration = 0;
    updateGen();
}

function evaluateGeneration() {
        oField.draw();
        oField.evaluate();
}

evaluateGeneration();
updateGen();


function updateGen() {
    oGen.innerText = nGeneration.toLocaleString();
}

function worker() {
    if (bAutoRetry) {
        if (nGeneration > nAutoRetry) {
            regenerate();
            bRunning = true;
        }
    }
    if (bRunning) {
        nGeneration++;
        updateGen();
        evaluateGeneration();
    }
    setTimeout(function() {
        worker()
    }, bWaitDuration);
}

worker()

let oTimeOut = document.getElementById("ms-out");
function timeChange(val) {
    bWaitDuration = parseInt(val);
    oTimeOut.innerText = val;
}

function erosion() {
    
    oField.aField = oField.erosion();

    oField.draw();
}

function findEdges() {

    let aNewField = [];
    for (let i=0; i<oField.nHeight; i++) {
        let aRow = oField.aField[i];
        let aNewRow = [];
        for (let j=0; j<oField.nWidth; j++) {
            aNewRow.push(aRow[j]);
        }
        aNewField.push(aNewRow);
    }

    let aErosion = oField.erosion();

    for (let i=0; i<oField.nHeight; i++) {
        for (let j=0; j<oField.nWidth; j++) {
            let before = oField.aField[i][j];
            let after = aErosion[i][j];
            if (before == after) {
                aNewField[i][j] = 0;
            } 
        }

    }
    oField.aField = aNewField

    oField.draw();
}

function Field(nWidth, nHeight, oCanvas) {

    this.nWidth = nWidth;
    this.nHeight = nHeight;
    this.aField = [];
    this.oCanvas = oCanvas;
    this.oContext = oCanvas.getContext("2d");

    for (let i=0; i<nHeight; i++) {
        let aRow = [];
        for (let j=0; j<nWidth; j++) {
            aRow.push(0);
        }
        this.aField.push(aRow);
    }

    this.getNeighbours = (nI, nJ) => {
        let aNeighbours = [];
        try {
            aNeighbours.push(this.aField[nI - 1][nJ - 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI - 1][nJ]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI - 1][nJ + 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI][nJ - 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI][nJ + 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI + 1][nJ - 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI + 1][nJ]);
        } catch (err) {
            aNeighbours.push(0);
        }
        try {
            aNeighbours.push(this.aField[nI + 1][nJ + 1]);
        } catch (err) {
            aNeighbours.push(0);
        }
        return aNeighbours;
    }

    this.createExportData = function() {
        let data = []
        for (let i=0; i<oField.nHeight; i++) {
            for (let j=0; j<oField.nWidth; j++) {
                data.push(this.aField[i][j])
            }
    
        }

        let last = "";
        let count = 0;
        let out = "";
        data.forEach((el, i) => {
            if (i === 0) {
                last = el;
                count = 1;
            } else {
                if (last === el) {
                    count += 1;
                } else {
                    out += `{${count}:${last}}`;
                    count = 1;
                    last = el;
                }
            }
        });
        out += `{${count}:${last}}`;

        return out;
    }

    this.erosion = function() {
        let aNewField = [];
        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            let aNewRow = [];
            for (let j=0; j<this.nWidth; j++) {
                aNewRow.push(aRow[j]);
            }
            aNewField.push(aNewRow);
        }

        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            for (let j=0; j<this.nWidth; j++) {
                let aNeighbours = this.getNeighbours(i, j);
                let v = this.aField[i][j];
                if (v > 0) {
                    let ok = false;
                    // any neigbour white?
                    aNeighbours.forEach(el => {
                        if (el == 0) {
                            ok = true;
                            return;
                        }
                    });
                    if (ok) {
                        aNewField[i][j] = 0;
                    }
                }
            }
        }
       return aNewField;
    }

    this.loadExportedData = function(data) {
        let matches = data.match(/\{.+?\:.+?\}/g);
        let output = [];
        matches.forEach(el => {
            let raw = el.replace(/(^\{|\}$)/g, "");
            let splits = raw.split(":");
            let count = parseInt(splits[0]);
            for (let i=0;i<count;i++) {
                output.push(parseInt(splits[1]));
            }
        });

        let index = -1;
        for (let i=0; i<this.nHeight; i++) {
            for (let j=0; j<this.nWidth; j++) {
                index += 1;
                this.aField[i][j] = output[index];
            }
        }
        this.draw();

    }

    this.dilatation = function() {
        let aNewField = [];
        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            let aNewRow = [];
            for (let j=0; j<this.nWidth; j++) {
                aNewRow.push(aRow[j]);
            }
            aNewField.push(aNewRow);
        }

        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            for (let j=0; j<this.nWidth; j++) {
                let aNeighbours = this.getNeighbours(i, j);
                let v = this.aField[i][j];
                if (v == 0) {
                    let ok = false;
                    // any neigbour white?
                    aNeighbours.forEach(el => {
                        if (el > 0) {
                            ok = true;
                            return;
                        }
                    });
                    if (ok) {
                        aNewField[i][j] = 1;
                    }
                }
            }
        }
        this.aField = aNewField;
        this.draw();
    }


    this.evaluate = function() {
        let aNewField = [];

        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            let aNewRow = [];
            for (let j=0; j<this.nWidth; j++) {
                aNewRow.push(aRow[j]);
            }
            aNewField.push(aNewRow);
        }
        

        let getNeighbours = (nI, nJ) => {
            let aNeighbours = [];
            try {
                aNeighbours.push(this.aField[nI - 1][nJ - 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI - 1][nJ]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI - 1][nJ + 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI][nJ - 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI][nJ + 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI + 1][nJ - 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI + 1][nJ]);
            } catch (err) {
                aNeighbours.push(0);
            }
            try {
                aNeighbours.push(this.aField[nI + 1][nJ + 1]);
            } catch (err) {
                aNeighbours.push(0);
            }
            return aNeighbours;
        }

        let liveCount = (aNeighbours) => {
            let nCount = 0;
            aNeighbours.forEach(oElement => {
                if (oElement > 0) {
                    nCount++;
                } 
            });
            return nCount;
        }

        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            for (let j=0; j<this.nWidth; j++) {
                let aNeighbours = getNeighbours(i, j);
                let nCount = liveCount(aNeighbours);
                if (this.aField[i][j] == 0) {
                    if (nCount == 3) {
                        aNewField[i][j] = 1;
                    } 
                } else {
                    if (nCount < 2) {
                        aNewField[i][j] = 0;
                    } else if(nCount > 3) {
                        aNewField[i][j] = 0;
                    } else if(bAging) {
                        aNewField[i][j] += 1;
                        if (aNewField[i][j] > 25) {
                            aNewField[i][j] = 0;
                        }
                    }
                }
            }
        }
        this.aField = aNewField;
    }

    this.draw = function() {
        this.oContext.fillStyle = "white";
        this.oContext.fillRect(0, 0, oCanvas.width * 6, oCanvas.height * 6);
    
        for (let i=0; i<this.nHeight; i++) {
            let aRow = this.aField[i];
            for (let j=0; j<this.nWidth; j++) {
                if (aRow[j]) {
                    this.oContext.fillStyle = "rgb(" + aRow[j] * 10 + ", 0, 0)";
                    this.oContext.fillRect(i * 6, j * 6, 6, 6);
                }
            }
        }
    }



}


 function drawGrid(canv){
    var p = 0;
    var ctx = canv.getContext("2d");
    var bw = canv.width;
    var bh = canv.height;

    for (var x = 0; x <= bw; x += 6) {
        ctx.moveTo(0.5 + x + p, p);
        ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 6) {
        ctx.moveTo(p, 0.5 + x + p);
        ctx.lineTo(bw + p, 0.5 + x + p);
    }
    ctx.strokeStyle = "#eaeaea"
    ctx.stroke();
}

function openCloseMobileSettings() {
    var cc = document.getElementById("cc");
    if (cc.classList.contains("openWidth")) {
        cc.classList.remove("openWidth");
    } else {
        startStop(false);
        cc.classList.add("openWidth");
    }
}