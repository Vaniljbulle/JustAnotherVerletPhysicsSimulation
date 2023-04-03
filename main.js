import {Solver} from "./solver.js";

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let playground = false;
let cloth = false;
let solver;
const steps = 8;
const fps = 1000 / 65;
let t1 = 0;

let ballInfo = {
    vx: 0,
    vy: 0,
    radius: 25,
    spawnRate: 100
};

window.addEventListener("DOMContentLoaded", () => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    solver = new Solver(context, [0, 0]);
    document.getElementById('Mode2').click();

    requestAnimationFrame(FrameUpdate)
});

function defaults() {
    solver.reset();
    solver.gravity = [0, 0];
    solver.changeDrag(0);
    solver.store = false;
    solver.vector = false;
    solver.elasticity = 1;
    document.getElementById('drag').value = 0;
    document.getElementById('dragP').innerHTML = "Drag: 0%";
}

const modeDropDown = document.getElementById('dropdown');
modeDropDown.onchange = function (e) {
    solver.reset();
    defaults();
    cloth = false;
    if (e.target.value === '1') {
        playground = true;
        document.getElementById('playground').style.display = 'block';
        document.getElementById('educational').style.display = 'none';
    } else {
        playground = false;
        document.getElementById('playground').style.display = 'none';
        document.getElementById('educational').style.display = 'block';
    }

}

const mode1 = document.getElementById('Mode1');
mode1.onclick = () => {
    solver.reset();
    const radius = 50;
    solver.store = false;
    solver.vector = true;
    cloth = false;
    solver.gravity = [0, 0];
    solver.elasticity = 1;
    for (let i = radius; i < canvas.width - radius; i += radius * 2 + 5) {
        solver.addBall([i, canvas.height / 2 - radius * 2], [0, 0], radius, 'orange');
        solver.addBall([i, canvas.height - radius * 2], [0, -100 - i / 2], radius, 'blue');
    }
}

const mode2 = document.getElementById('Mode2');
mode2.onclick = () => {
    solver.reset();
    solver.store = true;
    solver.vector = true;
    cloth = false;
    solver.addBall([0, canvas.height / 2], [200, 0], 150, 'orange');
    solver.addBall([canvas.width, canvas.height / 2], [0, 0], 75, 'blue');
    solver.addBall([0, 0], [300, 300], 20, 'pink');
}

const mode3 = document.getElementById('Mode3');
mode3.onclick = () => {
    solver.reset();
    solver.vector = true;
    cloth = false;
    solver.gravity = [0, 100];
    solver.addBall([canvas.width / 2, canvas.height / 2], [0, 50], 150, 'orange');
    solver.addBall([canvas.width / 2, canvas.height / 2 - 166], [0, 50], 15, 'blue');
}

const mode4 = document.getElementById('Mode4');
mode4.onclick = () => {
    solver.reset();
    solver.vector = true;
    cloth = false;
    solver.addBall([0, canvas.height / 2], [1000, 0], 25, 'orange');
    solver.addBall([canvas.width / 2, canvas.height / 2], [0, 0], 250, 'blue');
}

const mode5 = document.getElementById('Mode5');
mode5.onclick = () => {
    solver.reset();
    cloth = false;
    solver.elasticity = 0;
    solver.addBall([canvas.width / 2, canvas.height / 2], [0, 0], 25, 'blue');
    solver.addBall([30, canvas.height / 2], [100, 0], 25, 'orange');
}

const mode6 = document.getElementById('Mode6');
mode6.onclick = () => {
    solver.reset();
    cloth = true;
    solver.gravity = [0, 500];
    solver.changeDrag(0.1);
    solver.clothInput(50, 40);
}

// Drag changed
const drag = document.getElementById('drag');
drag.oninput = (e) => {
    solver.changeDrag(parseFloat(e.target.value));
    document.getElementById('dragP').innerHTML = "Drag: " + Math.round((parseFloat(e.target.value) * 100 + Number.EPSILON) * 100) / 100 + "%";
};

// Elasticity changed
const elasticity = document.getElementById('elasticity');
elasticity.oninput = (e) => {
    solver.elasticity = parseFloat(e.target.value);
    document.getElementById('elasticityP').innerHTML = "Elasticity: " + Math.trunc(parseFloat(e.target.value) * 100) + "%";
}

// Radius changed
const radius = document.getElementById('radius');
radius.oninput = (e) => {
    ballInfo.radius = parseInt(e.target.value);
    document.getElementById('radiusP').innerHTML = "Radius: " + parseInt(e.target.value);
}

// velocityX changed
const velocityX = document.getElementById('velx');
velocityX.oninput = (e) => {
    ballInfo.vx = parseInt(e.target.value) * 10;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + parseInt(e.target.value) * 10 + ", " + ballInfo.vy + "]";
}

// velocityY changed
const velocityY = document.getElementById('vely');
velocityY.oninput = (e) => {
    ballInfo.vy = parseInt(e.target.value) * 10;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + ballInfo.vx + ", " + parseInt(e.target.value) * 10 + "]";
}

// Canvas clicked
canvas.onmousedown = (e) => {
    //console.log(e.buttons);
    if (e.buttons === 1) {
        if (playground)
            spawn(e);
        else
            selectBall(e);
    } else if (e.buttons === 4 && cloth) {
        solver.destroyLink(selectBall(e));
    }
}

canvas.onmouseup = (e) => {
    //console.log(e.buttons);
    if (e.buttons !== 0 || selectedBallIndex === -1) return;
    solver.fixed(selectedBallIndex, false);
    selectedBallIndex = -1;
}

// Canvas mouse move
canvas.onmousemove = (e) => {
    //console.log(e.buttons);
    if (e.buttons === 1) {
        if (playground)
            spawn(e);
        else if (selectedBallIndex !== -1)
            solver.moveBall(selectedBallIndex, [e.clientX, e.clientY]);
    } else if (e.buttons === 4 && cloth) {
        solver.destroyLink(selectBall(e));
    }
}

// Clear balls button clicked
const clearBalls = document.getElementById('clearBalls');
clearBalls.onclick = () => {
    solver.reset();
    document.getElementById('balls').innerHTML = "Balls: " + solver.balls.length;
}


// Gravity x
const gravityX = document.getElementById('gravX');
gravityX.oninput = (e) => {
    let g = solver.gravity;
    g[0] = parseInt(e.target.value) * 10;
    solver.gravity = g;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + parseInt(e.target.value) * 10 + ", " + g[1] + "]";
}

// Gravity y
const gravityY = document.getElementById('gravY');
gravityY.oninput = (e) => {
    let g = solver.gravity;
    g[1] = parseInt(e.target.value) * 10;
    solver.gravity = g;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + g[0] + ", " + parseInt(e.target.value) * 10 + "]";
}

// reset gravity
const resetGravity = document.getElementById('resetGrav');
resetGravity.onclick = () => {
    solver.gravity = [0, 0];
    document.getElementById('gravX').value = 0;
    document.getElementById('gravY').value = 0;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + 0 + ", " + 0 + "]";
}

// reset velocity
const resetVelocity = document.getElementById('resetVel');
resetVelocity.onclick = () => {
    ballInfo.vx = 0;
    ballInfo.vy = 0;
    document.getElementById('velx').value = 0;
    document.getElementById('vely').value = 0;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + 0 + ", " + 0 + "]";
}

// Spawn interval
const spawnRate = document.getElementById('spawnRate');
spawnRate.oninput = (e) => {
    ballInfo.spawnRate = parseInt(e.target.value);
    document.getElementById('spawnRateP').innerHTML = "Spawn Interval: " + parseInt(e.target.value) + "ms";
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let spawnT = performance.now();

function spawn(e) {
    if (performance.now() - spawnT < ballInfo.spawnRate) return;
    spawnT = performance.now();
    const x = e.clientX;
    const y = e.clientY;
    const color = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';
    solver.addBall([x, y], [ballInfo.vx, ballInfo.vy], ballInfo.radius, color);
    document.getElementById('balls').innerHTML = "Balls: " + solver.balls.length;
}

let selectedBallIndex = -1;

function selectBall(e) {
    const mouse = {
        x: e.clientX,
        y: e.clientY
    }
    const len = solver.balls.length;
    for (let i = 0; i < len; i++) {
        const ball = solver.getBall(i);
        const pos = ball.position;
        if (mouse.x > pos[0] - ball.radius && mouse.x < pos[0] + ball.radius && mouse.y > pos[1] - ball.radius && mouse.y < pos[1] + ball.radius) {
            selectedBallIndex = i;
            solver.fixed(selectedBallIndex, true);
            //console.log("Selected ball " + i);
            return i;
        }
    }
}

const dt = 1/6000*steps;
function FrameUpdate() {
    requestAnimationFrame(FrameUpdate)
    if (cloth) {
        for (let i = 0; i < steps; i++)
            solver.updateLinks(dt);
    } else {
        for (let i = 0; i < steps; i++)
            solver.update(dt);
    }
    solver.render();
    /*
    let dt = performance.now() - t1;
    if (dt >= fps) {
        dt /= (1000 * steps);

        if (cloth) {
            for (let i = 0; i < steps; i++)
                solver.updateLinks(dt);
        } else {
            for (let i = 0; i < steps; i++)
                solver.update(dt);
        }

        solver.render();
        t1 = performance.now();
    }
     */
}
