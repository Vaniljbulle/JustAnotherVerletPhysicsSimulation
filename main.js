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
        canvas.addEventListener('mousedown', spawnBall);
        resizeCanvas();

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

        // Spawn initial balls
        for (let i = 0; i < 50; i++) {
            balls.push(new Ball(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                25,
                {x: Math.random() * 100 - 50, y: Math.random() * 100 - 50},
                `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
            ));
            document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
        }


        requestAnimationFrame(render)
    }
});

let t1_sb = performance.now();
let spawnRate = 100;
let initialVelocityX = 0;
let initialVelocityY = 0;
let initialRadius = 10;
function spawnBall(e) {
    if (e.buttons !== 1 || performance.now() - t1_sb < spawnRate) return;
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

function spawnBallC(velocityX, velocityY, posX, posY, radius, color) {
    balls.push(new Ball(
        posX,
        posY,
        radius,
        {x: velocityX, y: velocityY},
        color
    ));
    document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
}

let educ = false;
let mode2 = false;
function changeDropdown(e) {
    switch (e) {
        case '0':
            educ = false;
            // Playground
            clearBalls();
            Ball.gravity = {x: 0, y: 0};
            Ball.drag = 0.1;
            Ball.restitution = 0.98;
            Ball.rho = 0.1;
            document.getElementById('playground').style.display = 'block';
            document.getElementById('educational').style.display = 'none';
            canvas.addEventListener('mousemove', spawnBall);
            canvas.addEventListener('mousedown', spawnBall);
            break;
        case '1':
            educ = true;
            // Educational
            Ball.gravity = {x: 0, y: 0};
            Ball.drag = 0.0;
            Ball.restitution = 1;
            Ball.rho = 0.0;
            document.getElementById('playground').style.display = 'none';
            document.getElementById('educational').style.display = 'block';
            canvas.removeEventListener('mousemove', spawnBall);
            canvas.removeEventListener('mousedown', spawnBall);
            eduMode1();
            break;
    }
}

function eduMode1() {
    mode2 = false;
    clearBalls();
    let sped = 10;
    for (let i = 50; i < canvas.width - 50; i+=100) {
        spawnBallC(0, 0, i, canvas.height / 2, 50, 'orange');
        spawnBallC(0, sped+=5, i, 100, 50, 'blue');
    }
}

function eduMode2() {
    mode2 = true;
    clearBalls();
    spawnBallC(-30, -30, canvas.width / 2 + 100, canvas.height / 2 + 100, 100, 'purple');
    spawnBallC(30, 30, canvas.width / 2 - 100, canvas.height / 2 - 100, 100, 'orange');
    spawnBallC(30, 0, 0, canvas.height / 2, 100, 'pink');
}

function clearBalls() {
    balls = [];
    document.getElementById('totalBallsP').innerHTML = "Balls: " + balls.length;
}

function changeSpawnRate(e) {
    spawnRate = parseInt(e);
    //console.log("Spawn Interval: " + spawnRate);
    document.getElementById('spawnRateP').innerHTML = "Spawn Interval: " + e;
}

function changeInitialVelocityX(e) {
    initialVelocityX = parseInt(e * 10);
    //console.log("Velocity X: " + initialVelocityX);
    document.getElementById('initialVelocityXP').innerHTML = "Velocity X: " + e;
}

function changeInitialVelocityY(e) {
    initialVelocityY = parseInt(e * 10);
    //console.log("Velocity Y: " + initialVelocityY);
    document.getElementById('initialVelocityYP').innerHTML = "Velocity Y: " + e;
}

function changeRadius(e) {
    initialRadius = Math.trunc(e);
    // Change radius of all balls
    for (let i = 0; i < balls.length; i++) {
        balls[i].setRadius(initialRadius);
    }
    //console.log("Radius: " + initialRadius);
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
    //console.log("Rho: " + Ball.rho);
    document.getElementById('rhoP').innerHTML = "Rho: " + e;
}

function changeDrag(e) {
    Ball.drag = parseFloat(e);
    //console.log("Drag: " + Ball.drag);
    //console.log("isFloat: " + isFloat(Ball.drag));
    document.getElementById('dragP').innerHTML = "Drag: " + e;
}

function changeRestitution(e) {
    Ball.restitution = parseFloat(e);
    //console.log("Restituion: " + Ball.restitution);
    document.getElementById('restP').innerHTML = "Elasticity: " + Math.trunc(e * 100) + "%";
}


let t1 = 0;
const steps = 8;
const fps = 1000 / 60;

function PaintCollision() {
    if (educ && mode2) {
        context.beginPath();
        context.moveTo(0, Ball.horizontalCollisionLine);
        context.lineTo(canvas.width, Ball.horizontalCollisionLine);
        context.moveTo(Ball.verticalCollisionLine, 0);
        context.lineTo(Ball.verticalCollisionLine, canvas.height);
        context.strokeStyle = 'blue';
        context.lineWidth = 1;
        context.stroke();

        context.beginPath();
        context.moveTo(Ball.verticalCollisionLine, Ball.horizontalCollisionLine);
        context.lineTo(Ball.verticalCollisionLine + Ball.collisionOutput1[0] * 800, Ball.horizontalCollisionLine + Ball.collisionOutput1[1] * 800);
        context.moveTo(Ball.verticalCollisionLine, Ball.horizontalCollisionLine);
        context.lineTo(Ball.verticalCollisionLine + Ball.collisionOutput2[0] * 800, Ball.horizontalCollisionLine + Ball.collisionOutput2[1] * 800);

        context.strokeStyle = 'green';
        context.stroke();
    }
}

function PaintVelocity(i, v) {
    const p = balls[i].getPosition();
    context.beginPath();
    context.moveTo(p[0], p[1]);
    context.lineTo(p[0] + v[0] * 5, p[1] + v[1] * 5);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.stroke();
}

function render() {
    requestAnimationFrame(render)

    const t2 = performance.now();
    let dt = t2 - t1;
    if (dt > fps) {
        t1 = t2 - (dt % fps);
        dt /= (100 * steps);

        // Sub-steps
        for (let i = 0; i < steps; i++)
            updateBalls(dt);

        // Render
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < balls.length; i++) {
            balls[i].display();

            // Velocity lines
            const v = balls[i].getVelocity();
            if (v[0] === 0 && v[1] === 0 || !educ) continue;
            PaintVelocity(i, v);
        }
        // Collision lines
        PaintCollision();
    }
}

function updateBalls(dt) {
    for (let i = 0; i < balls.length; i++) {
        balls[i].update(dt);
    }
}

