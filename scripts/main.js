
let oCanvas = document.getElementById("canvas");

let bRunning = false;

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



// oField.aField[30][20] = 1;
// oField.aField[29][20] = 1;
// oField.aField[31][20] = 1;
// oField.aField[31][21] = 1;
// oField.aField[31][22] = 1;
// oField.aField[29][21] = 1;
// oField.aField[29][22] = 1;

// oField.aField[31][24] = 1;
// oField.aField[31][25] = 1;
// oField.aField[29][24] = 1;
// oField.aField[29][25] = 1;
// oField.aField[29][26] = 1;
// oField.aField[30][26] = 1;
// oField.aField[31][26] = 1;

// oField.aField[30][40] = 1;
// oField.aField[29][40] = 1;
// oField.aField[31][40] = 1;
// oField.aField[31][41] = 1;
// oField.aField[31][42] = 1;
// oField.aField[29][41] = 1;
// oField.aField[29][42] = 1;

// oField.aField[31][44] = 1;
// oField.aField[31][45] = 1;
// oField.aField[29][44] = 1;
// oField.aField[29][45] = 1;
// oField.aField[29][46] = 1;
// oField.aField[30][46] = 1;
// oField.aField[31][46] = 1;


// oField.aField[40][40] = 1;
// oField.aField[39][40] = 1;
// oField.aField[41][40] = 1;
// oField.aField[41][41] = 1;
// oField.aField[41][42] = 1;
// oField.aField[39][41] = 1;
// oField.aField[39][42] = 1;

// oField.aField[41][44] = 1;
// oField.aField[41][45] = 1;
// oField.aField[39][44] = 1;
// oField.aField[39][45] = 1;
// oField.aField[39][46] = 1;
// oField.aField[40][46] = 1;
// oField.aField[41][46] = 1;


// oField.aField[70][70] = 1;
// oField.aField[71][68] = 1;
// oField.aField[70][69] = 1;
// oField.aField[69][69] = 1;

// oField.aField[70][68] = 1;


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
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI - 1][nJ]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI - 1][nJ + 1]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI][nJ - 1]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI][nJ + 1]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI + 1][nJ - 1]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI + 1][nJ]);
            } catch (err) {}
            try {
                aNeighbours.push(this.aField[nI + 1][nJ + 1]);
            } catch (err) {}
            return aNeighbours;
        }

        let liveCount = (aNeighbours) => {
            let nCount = 0;
            aNeighbours.forEach(oElement => {
                if (oElement == 1) {
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
                    this.oContext.fillStyle = "black";
                    this.oContext.fillRect(i * 6, j * 6, 6, 6);
                }
            }
        }
    }

}
