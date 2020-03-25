
let oCanvas = document.getElementById("canvas");

let bRunning = false;
let bAging = true;

var oField = new Field(100, 100, oCanvas);

for (let i=0;i<oField.aField.length;i++) {
    let aRow = oField.aField[i];
    for (let j=0;j<aRow.length;j++) {
        if (Math.floor(Math.random() * 101) < 32) {
            oField.aField[i][j] = 1;
        }
    }
}

function regenerate() {
    bRunning = false;

    oField = new Field(100, 100, oCanvas);

    for (let i=0;i<oField.aField.length;i++) {
        let aRow = oField.aField[i];
        for (let j=0;j<aRow.length;j++) {
            if (Math.floor(Math.random() * 101) < 32) {
                oField.aField[i][j] = 1;
            }
        }
    }
    oField.draw();
}

function evaluateGeneration() {
        oField.draw();
        oField.evaluate();
}

evaluateGeneration();

setInterval(function() {
    if (bRunning) {
        evaluateGeneration();
    }
}, 100);


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
