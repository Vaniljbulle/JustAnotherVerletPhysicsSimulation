let context = null;
let canvas = null;
let balls = [];

//render = render.bind();
window.addEventListener('load', () => {
    // Get the canvas element
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Could not find canvas element with id "canvas"');
    }
    // Get the 2D drawing context
    context = canvas.getContext('2d');
    if (!context) {
        console.error('Could not get 2D context for canvas element');
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context.fillStyle = "red";

        for (let i = 0; i < 1; i++) {
            balls.push(new Ball(
                900+50*i,
                50,
                Math.random() * 10 + 5,
                {x: 50, y: 0}
            ));
        }

        requestAnimationFrame(render)
    }
});


let t1 = 0;
const steps = 8;
const fps = 1000/60;
function render() {
    requestAnimationFrame(render)

    const t2 = performance.now();
    let dt = t2 - t1;
    if (dt > fps) {
        t1 = t2 - (dt % fps);
        dt /= (100*steps);

        // Sub-steps
        for (let i = 0; i < steps; i++) {
            updateBalls(dt);
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (let i = 0; i < balls.length; i++) {
            balls[i].display();
        }
        context.fill();
    }
}

function updateBalls(dt) {
    for (let i = 0; i < balls.length; i++) {
        balls[i].update(dt);
    }
}

