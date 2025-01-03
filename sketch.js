// Original: https://galileo-unbound.blog/2018/10/27/how-to-weave-a-tapestry-from-hamiltonian-chaos/
const DEFAULT_SIMULATION_SETTINGS = {
    seed: 1337,
    outerIterations: 1000,
    innerIterations: 1000,
    Q: 4,
    K: 1 - ((1 + Math.sqrt(5)) / 2),
    scale: 10,
    piFactor: 2,
    offsetMin: 0,
    offsetMax: 30,
};

let simulationSettingsPrevious = null;
let simulationSettings = structuredClone(DEFAULT_SIMULATION_SETTINGS);
let halfWidth = 0;
let halfHeight = 0;
let precomputedColors = [];
let cameraX = 0;
let cameraY = 0;
const MOVE_SPEED = 10;
let gui;

function updateColors() {
    precomputedColors = Array.from({
        length: simulationSettings.outerIterations
    }, (_, i) => {
        const hue = (i * 360) / simulationSettings.outerIterations;
        return HSBToRGB(hue, 100, 100);
    });
}

function drawChaos() {
    background(0);
    randomSeed(simulationSettings.seed);

    const angleStep = (simulationSettings.piFactor * Math.PI) / simulationSettings.Q;
    const cosAngle = Math.cos(angleStep);
    const sinAngle = Math.sin(angleStep);

    loadPixels();

    for (let i = 0; i < simulationSettings.outerIterations; i++) {
        let x = random(simulationSettings.offsetMin, simulationSettings.offsetMax);
        let y = random(simulationSettings.offsetMin, simulationSettings.offsetMax);
        const color = precomputedColors[i];

        for (let j = 0; j < simulationSettings.innerIterations; j++) {
            const tempX = x + simulationSettings.K * Math.sin(y);
            const newX = tempX * cosAngle + y * sinAngle;
            const newY = -tempX * sinAngle + y * cosAngle;

            x = newX;
            y = newY;

            const pixelX = Math.round(halfWidth + (x + cameraX) * simulationSettings.scale);
            const pixelY = Math.round(halfHeight + (y + cameraY) * simulationSettings.scale);

            if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                const pixelIndex = 4 * (pixelY * width + pixelX);
                pixels[pixelIndex] = color.r;
                pixels[pixelIndex + 1] = color.g;
                pixels[pixelIndex + 2] = color.b;
                pixels[pixelIndex + 3] = 255;
            }
        }
    }

    updatePixels();
}


function setupGUI() {
    if (gui) gui.destroy();
    gui = new dat.GUI({
        width: Math.min(400, width / 3)
    });

    gui.add(simulationSettings, 'seed', 0, 9999, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'scale', 1, 50, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'outerIterations', 1, 1000, 1).onChange(() => {
        updateColors();
        drawChaos();
    }).onFinishChange(saveHash);
    gui.add(simulationSettings, 'innerIterations', 1, 1000, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'Q', 1, 1000, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'K', -10, 10, 0.00001).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'piFactor', 1, 100, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'offsetMin', -50, 50, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add(simulationSettings, 'offsetMax', -50, 50, 1).onChange(drawChaos).onFinishChange(saveHash);
    gui.add({
        update: drawChaos
    }, 'update');
	 
    gui.add({
        reset: resetSettings
    }, 'reset');
	gui.add({
        previous: returnPreviousSettings
    }, 'previous');
    gui.add({
        randomize: randomizeSettings
    }, 'randomize');
}

function resetSettings() {
	simulationSettingsPrevious = structuredClone(simulationSettings);
    simulationSettings = structuredClone(DEFAULT_SIMULATION_SETTINGS);
    setupGUI();
    updateColors();
    drawChaos();
    saveHash();
}

function returnPreviousSettings() {
	if (simulationSettingsPrevious == null) return;
	let simulationSettingsPreviousNew = structuredClone(simulationSettings);
    simulationSettings = structuredClone(simulationSettingsPrevious);
	simulationSettingsPrevious = simulationSettingsPreviousNew;
    setupGUI();
    updateColors();
    drawChaos();
    saveHash();
}

function randomizeSettings() {
	simulationSettingsPrevious = structuredClone(simulationSettings);
    simulationSettings = structuredClone(DEFAULT_SIMULATION_SETTINGS);
    randomSeed(performance.now());

    simulationSettings.seed = Math.floor(random(0, 9999));
    simulationSettings.Q = Math.floor(random(1, 100));
    simulationSettings.K = 1 - ((1 + Math.sqrt(random(1, 100))) / random(1, 100));
    simulationSettings.piFactor = Math.floor(random(1, 100));
    simulationSettings.offsetMin = Math.floor(random(-50, 50));
    simulationSettings.offsetMax = Math.floor(random(-50, 50));

    setupGUI();
    updateColors();
    drawChaos();
    saveHash();
}


function updateStorage() {
	localStorage.setItem('hash', JSON.stringify(simulationSettings));	
}

function updateHash() {
    window.location.hash = btoa(JSON.stringify(simulationSettings));
}

function saveHash() {
	updateStorage();
	updateHash();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    halfWidth = width / 2;
    halfHeight = height / 2;
    gui.width = width / 3;
    drawChaos();
}

function handleCameraControls() {
    if (keyIsPressed) {
        if (keyIsDown(UP_ARROW) || keyIsDown(87)) cameraY += MOVE_SPEED / simulationSettings.scale;
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) cameraY -= MOVE_SPEED / simulationSettings.scale;
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) cameraX += MOVE_SPEED / simulationSettings.scale;
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) cameraX -= MOVE_SPEED / simulationSettings.scale;
        drawChaos();
    }
}

function HSBToRGB(h, s, b) {
    s /= 100;
    b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return {
        r: Math.round(255 * f(5)),
        g: Math.round(255 * f(3)),
        b: Math.round(255 * f(1)),
    };
}

function setup() {
    if (window.location.hash) {
        simulationSettings = JSON.parse(atob(window.location.hash.substring(1)));
		updateStorage();
    } else if (localStorage.getItem('hash')) {
		simulationSettings = JSON.parse(localStorage.getItem('hash'));
		updateHash();
	}

    createCanvas(windowWidth, windowHeight);
    halfWidth = width / 2;
    halfHeight = height / 2;

    colorMode(HSB, 360, 100, 100);
    noSmooth();
    noStroke();

    setupGUI();
    updateColors();
    drawChaos();
}

function draw() {
    handleCameraControls();
}