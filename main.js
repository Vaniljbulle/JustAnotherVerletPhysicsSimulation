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
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousemove', spawnBall);
        resizeCanvas();

/*
        balls.push(new Ball(
            400,
            400,
            //Math.random() * 25 + 5,
            50,
            {x: 0, y: 30},
        ));
        balls[0].mass = 10000000000000

        /*
        let t = setInterval(() => {
            balls.push(new Ball(
                400,
                400,
                //Math.random() * 25 + 5,
                5,
                {x: 50, y: 0},
            ));
            document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
            // clear interval after 1000 balls
            if (balls.length > 200) {
                clearInterval(t);
            }
        }, 50);

         */

        requestAnimationFrame(render)
    }
});

let t1_sb = performance.now();
let spawnRate = 100;
let initialVelocityX = 0;
let initialVelocityY = 0;
let initialRadius = 10;

function spawnBall(e) {
    if (e.buttons !== 1) return;
    if (performance.now() - t1_sb < spawnRate) return;
    t1_sb = performance.now();
    balls.push(new Ball(
        e.clientX,
        e.clientY,
        initialRadius,
        {x: initialVelocityX, y: initialVelocityY},
        `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
    ));
    document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
}

function clearBalls() {
    balls = [];
    document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
}

function changeSpawnRate(e) {
    spawnRate = parseInt(e);
    console.log("Spawn Interval: " + spawnRate);
    document.getElementById('spawnRateP').innerHTML = "Spawn Interval: " + e;
}

function changeInitialVelocityX(e) {
    initialVelocityX = parseInt(e * 10);
    console.log("Velocity X: " + initialVelocityX);
    document.getElementById('initialVelocityXP').innerHTML = "Velocity X: " + e;
}

function changeInitialVelocityY(e) {
    initialVelocityY = parseInt(e * 10);
    console.log("Velocity Y: " + initialVelocityY);
    document.getElementById('initialVelocityYP').innerHTML = "Velocity Y: " + e;
}

function changeRadius(e) {
    initialRadius = Math.trunc(e);
    console.log("Radius: " + initialRadius);
    document.getElementById('radiusP').innerHTML = "Radius: " + e;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

function changeRho(e) {
    Ball.rho = parseFloat(e);
    console.log("Rho: " + Ball.rho);
    document.getElementById('rhoP').innerHTML = "Rho: " + e;
}

function changeDrag(e) {
    Ball.drag = parseFloat(e);
    console.log("Drag: " + Ball.drag);
    console.log("isFloat: " + isFloat(Ball.drag));
    document.getElementById('dragP').innerHTML = "Drag: " + e;
}

function changeRestitution(e) {
    Ball.restitution = parseFloat(e);
    console.log("Restituion: " + Ball.restitution);
    document.getElementById('restP').innerHTML = "Elasticity: " + Math.trunc(e * 100) + "%";
}


let t1 = 0;
const steps = 8;
const fps = 1000 / 60;

function render() {
    requestAnimationFrame(render)

    const t2 = performance.now();
    let dt = t2 - t1;
    if (dt > fps) {
        t1 = t2 - (dt % fps);
        dt /= (10 * steps);

        // Sub-steps
        for (let i = 0; i < steps; i++) {
            updateBalls(dt);
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        //context.beginPath();
        for (let i = 0; i < balls.length; i++) {
            balls[i].display();
        }
        //context.fill();
    }
}

function updateBalls(dt) {
    for (let i = 0; i < balls.length; i++) {
        balls[i].update(dt);
    }
}

