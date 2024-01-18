// Original: https://galileo-unbound.blog/2018/10/27/how-to-weave-a-tapestry-from-hamiltonian-chaos/
function setup() {

    createCanvas(windowWidth, windowHeight);

    colorMode(HSB, 360, 100, 100);
    noSmooth();
    noStroke();

    const half_width = width / 2;
    const half_height = height / 2;

    background(0);

    const phi = (1 + Math.sqrt(random(0, 100))) / random(0, 10); // orig: (1 + Math.sqrt(5) / 2;

    // coupling constant
    const K = 1 - phi;

    // periodicity constant
    const q = random(0, 100); // orig: 4

    const v_alpha = (random(0, 100) * Math.PI) / q; // orig: (2 * Math.PI) / q;

    const outer_iterations = random(10, 1000);
    const inner_iterations = random(10, 1000);


    const cosAlpha = cos(v_alpha);
    const sinAlpha = sin(v_alpha);
    for (let i = 0; i < outer_iterations; ++i) {
        let xlast = random(0, 30);
        let ylast = random(0, 30);

        for (let j = 0; j < inner_iterations; ++j) {
            const sinYlast = xlast + K * sin(ylast);
            const x = (xlast = sinYlast * cosAlpha + ylast * sinAlpha);
            const y = (ylast = -sinYlast * sinAlpha + ylast * cosAlpha);
            set(
                half_width + x * 10,
                half_height + y * 10,
                color(i * (360 / outer_iterations), 100, 100)
            );
        }
    }
    updatePixels();
}