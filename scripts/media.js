var potrait = window.matchMedia("only screen and (orientation: portrait)");
var landscape = window.matchMedia("only screen and (orientation: landscape)");

potrait.addListener(mediaWatcher);
landscape.addListener(mediaWatcher)

function mediaWatcher() {
    if (potrait.matches) {
        // $("#canvasContainer").css({
        //     width: "100%"
        // })
        // $("#control-container").css({
        //     display: "none"
        // })
    } else if (landscape.matches) {
        console.log("landscape");
    }
}

mediaWatcher();