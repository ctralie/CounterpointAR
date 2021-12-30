
// Below is some code showing more parameter options for the marker objects
let markerParameters = {
    type: "pattern",
    patternUrl: "data/letterA.patt",
    // turn on/off camera smoothing
    smooth: true,
    // number of matrices to smooth tracking over, more = smoother but slower follow
    smoothCount: 5,
    // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
    smoothTolerance: 0.01,
    // threshold for smoothing, will keep still unless enough matrices are over tolerance
    smoothThreshold: 2
};

