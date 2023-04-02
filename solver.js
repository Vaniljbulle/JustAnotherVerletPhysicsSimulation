import {Ball} from './ball.js';

export class Solver {
    #balls;
    links;
    cWidth = 0;
    cHeight = 0;
    #context;
    #gravity;

    static #elasticity = 1;
    static store = false;
    static vector = false;


    #collisionNormal = null;
    #collisionPoint = null;
    #direction1 = null;
    #direction2 = null;

    constructor(ctx, [gravityX, gravityY] = [0, 0]) {
        this.#balls = [];
        this.links = [];
        this.#gravity = [gravityX, gravityY];
        this.#context = ctx;
    }

    // Add new ball to the simulation
    addBall([x, y] = [0, 0], [vx, vy] = [0, 0], radius = 10, color = 'black') {
        this.#balls.push(new Ball([x, y], [vx, vy], radius, color));
    }

    // Add new link to the simulation
    addLink(ball1, ball2, length = 100, strength = 0.1) {
        this.links.push({ball1, ball2, length, strength});
    }

    // Remove ball from the simulation
    removeBall(ball) {
        this.#balls = this.#balls.filter(b => b !== ball);
    }

    removeLink(link) {
        this.links = this.links.filter(l => l !== link);
    }

    destroyLink(index) {
        this.links = this.links.filter(l => l.ball1 !== index && l.ball2 !== index);
        this.removeBall(index)
    }

    reset() {
        this.#balls = [];
        this.links = [];
        this.cWidth = 0;
        this.cHeight = 0;
        this.drag = 0;
        this.store = false;
        this.vector = false;
        this.gravity = [0, 0];
        this.elasticity = 1;
    }

    ballLength() {
        return this.#balls.length;
    }

    set elasticity(value) {
        Solver.#elasticity = value;
    }

    set gravity([x, y]) {
        this.#gravity = [x, y];
    }

    get gravity() {
        return this.#gravity;
    }

    set drag(value) {
        Ball.drag = 1 - value / 100;
    }

    set store(value) {
        Solver.store = value;
    }

    set vector(value) {
        Solver.vector = value;
    }

    // Update the simulation
    update(dt) {
        for (let ball of this.#balls) {
            ball.applyForce([ball.mass * this.#gravity[0], ball.mass * this.#gravity[1]]);
            ball.update(dt);
            this.constrain(ball);
            this.collisions(ball);
        }
    }

    // Update with links
    updateLinks(dt) {
        for (let ball of this.#balls) {
            ball.applyForce([ball.mass * this.#gravity[0], ball.mass * this.#gravity[1]]);
            ball.update(dt);
            this.constrain(ball);
        }
        for (let link of this.links) {
            this.constrainLink(link);
        }
    }

    getBall(index) {
        return this.#balls[index];
    }

    moveBall(index, [x, y]) {
        this.#balls[index].position = [x, y];
    }

    fixed(index, value) {
        this.#balls[index].fixed = value;
    }

    clothInput(width, height) {
        this.cWidth = width;
        this.cHeight = height;
        // Add new ball
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                this.addBall([i * 10 + 200, j * 10 + 100], [0, 0], 10, `rgba(0, 0, 0, 0)`);
            }
        }

        // Add new link horizontally
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width - 1; j++) {
                const ball1 = this.#balls[i * width + j];
                const ball2 = this.#balls[i * width + j + 1];
                this.addLink(ball1, ball2, 10, 0.8);
            }
        }
        for (let j = 0; j < width; j++) {
            const ball1 = this.#balls[j];
            const ball2 = this.#balls[width + j];
            this.addLink(ball1, ball2, 10, 2);
        }
        for (let i = 1; i < height - 1; i++) {
            for (let j = 0; j < width; j++) {
                const ball1 = this.#balls[i * width + j];
                const ball2 = this.#balls[(i + 1) * width + j];
                this.addLink(ball1, ball2, 10, 0.8);
            }
        }
        /*
        // Add new link vertically
        for (let j = 0; j < width; j++) {
            const ball1 = this.#balls[j];
            const ball2 = this.#balls[width + j];
            this.addLink(ball1, ball2, 5, 2);
        }
        let strength = 1
        let length = 3;
        for (let i = 1; i < height - 1; i++) {
            for (let j = 0; j < width; j++) {
                const ball1 = this.#balls[i * width + j];
                const ball2 = this.#balls[(i + 1) * width + j];
                this.addLink(ball1, ball2, length, strength);
            }
            strength *= 0.98;
            length *= 1.01;
        }
*/
        for (let i = 0; i < width; i++) {
            this.fixed(i, true);
        }
    }

    renderLink(link) {
        const [x1, y1] = link.ball1.position;
        const [x2, y2] = link.ball2.position;
        this.#context.beginPath();
        this.#context.moveTo(x1, y1);
        this.#context.lineTo(x2, y2);
        this.#context.strokeStyle = 'red';
        this.#context.stroke();
    }


    renderCloth(pos1, pos2, pos3, pos4, color) {
        const [x1, y1] = pos1;
        const [x2, y2] = pos2;
        const [x3, y3] = pos3;
        const [x4, y4] = pos4;
        this.#context.beginPath();
        this.#context.moveTo(x1, y1);
        this.#context.lineTo(x2, y2);
        this.#context.lineTo(x3, y3);
        this.#context.lineTo(x4, y4);
        this.#context.lineTo(x1, y1);
        this.#context.closePath();
        this.#context.fillStyle = color;
        this.#context.fill();
    }

    // Render the simulation
    render() {
        this.#context.clearRect(0, 0, this.#context.canvas.width, this.#context.canvas.height);
        this.#balls.forEach(ball => ball.paint(this.#context));
        //this.links.forEach(link => this.renderLink(link));

        if (this.cWidth !== 0) {
            const squares = (this.cWidth - 1) * (this.cHeight - 1);
            for (let i = 0; i < squares; i++) {
                const rowIndex = Math.floor(i / (this.cWidth - 1));
                let c;
                if (rowIndex % 2 === 1) {
                    c = 'rgba(0, 255, 0, 0.3)'
                } else {
                    c = 'rgba(0, 0, 255, 0.3)'
                }
                const top = i;
                const bottom = i + this.cWidth - 1;

                this.renderCloth(
                    this.links[top].ball1.position,
                    this.links[top].ball2.position,
                    this.links[bottom].ball2.position,
                    this.links[bottom].ball1.position,
                    c)

            }
        }


        if (Solver.store) {
            this.renderCollisionInformation();
        }
        if (Solver.vector) {
            this.#balls.forEach(ball => this.renderVector(ball.position, ball.velocity, 'red'));
        }
    }

    constrainLink(link) {
        const [ball1, ball2] = [link.ball1, link.ball2];
        if (ball1.fixed && ball2.fixed) {
            return;
        }
        const [x1, y1] = ball1.position;
        const [x2, y2] = ball2.position;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let normal = [dx / distance, dy / distance];
        const d = link.length - distance;

        /*
        if (d < -500) {
            this.removeBall(ball1);
            this.removeBall(ball2);
            this.removeLink(link);
            return;
        }
*/
        // Ball 1 is fixed
        if (ball1.fixed) {
            ball2.position[0] += d * normal[0] * link.strength;
            ball2.position[1] += d * normal[1] * link.strength;
            return;
        }
        // Ball 2 is fixed
        if (ball2.fixed) {
            ball1.position[0] -= d * normal[0] * link.strength;
            ball1.position[1] -= d * normal[1] * link.strength;
            return;
        }
        ball1.position[0] -= d * normal[0] * link.strength;
        ball1.position[1] -= d * normal[1] * link.strength;
        ball2.position[0] += d * normal[0] * link.strength;
        ball2.position[1] += d * normal[1] * link.strength;
    }

    // Constrain the ball to the canvas
    constrain(ball) {
        if (ball.position[0] - ball.radius < 0) {
            ball.position[0] = ball.radius;
            ball.velocity[0] *= -1 * Solver.#elasticity;
        }
        if (ball.position[0] + ball.radius > this.#context.canvas.width) {
            ball.position[0] = this.#context.canvas.width - ball.radius;
            ball.velocity[0] *= -1 * Solver.#elasticity;
        }
        if (ball.position[1] - ball.radius < 0) {
            ball.position[1] = ball.radius;
            ball.velocity[1] *= -1 * Solver.#elasticity;
        }
        if (ball.position[1] + ball.radius > this.#context.canvas.height) {
            ball.position[1] = this.#context.canvas.height - ball.radius;
            ball.velocity[1] *= -1 * Solver.#elasticity;
        }
    }

    /*
        collisions() {
            // Sweep and prune
            const minX = this.#balls.map(ball => ball.position[0] - ball.radius * 2);
            const maxX = this.#balls.map(ball => ball.position[0] + ball.radius * 2);
            const minY = this.#balls.map(ball => ball.position[1] - ball.radius * 2);
            const maxY = this.#balls.map(ball => ball.position[1] + ball.radius * 2);

            const sortedMinX = [...minX].sort((a, b) => a - b);
            const sortedMinY = [...minY].sort((a, b) => a - b);

            const xIndices = minX.map(x => sortedMinX.indexOf(x));
            const yIndices = minY.map(y => sortedMinY.indexOf(y));

            const xPairs = [];
            const yPairs = [];

            for (let i = 0; i < this.#balls.length; i++) {
                for (let j = i + 1; j < this.#balls.length; j++) {
                    if (xIndices[i] < xIndices[j] && maxX[i] >= minX[j]) {
                        xPairs.push([i, j]);
                    }
                    if (yIndices[i] < yIndices[j] && maxY[i] >= minY[j]) {
                        yPairs.push([i, j]);
                    }
                }
            }

            const pairs = xPairs.filter(pair => yPairs.some(p => p[0] === pair[0] && p[1] === pair[1]));

            for (let pair of pairs) {
                this.resolveCollision(this.#balls[pair[0]], this.#balls[pair[1]]);
            }
        }
    */

    /*
    collisions() {
        // Sweep and prune
        const minX = this.#balls.map(ball => ball.position[0] - ball.radius * 2);
        const maxX = this.#balls.map(ball => ball.position[0] + ball.radius * 2);
        const minY = this.#balls.map(ball => ball.position[1] - ball.radius * 2);
        const maxY = this.#balls.map(ball => ball.position[1] + ball.radius * 2);

        const sortedMinX = [...minX].sort((a, b) => a - b);
        const sortedMinY = [...minY].sort((a, b) => a - b);

        const xIndices = minX.map(x => sortedMinX.indexOf(x));
        const yIndices = minY.map(y => sortedMinY.indexOf(y));

        const xPairs = [];
        const yPairs = [];

        for (let i = 0; i < this.#balls.length; i++) {
            for (let j = i + 1; j < this.#balls.length; j++) {
                if (xIndices[i] < xIndices[j] && maxX[i] >= minX[j]) {
                    xPairs.push([i, j]);
                }
                if (yIndices[i] < yIndices[j] && maxY[i] >= minY[j]) {
                    yPairs.push([i, j]);
                }
            }
        }

        const pairs = xPairs.filter(pair => yPairs.some(p => p[0] === pair[0] && p[1] === pair[1]));

        for (let pair of pairs) {
            this.resolveCollision(this.#balls[pair[0]], this.#balls[pair[1]]);
        }
    }
    */

    collisions(ball) {
        for (let other of this.#balls) {
            if (other !== ball) {
                this.resolveCollision(ball, other);
            }
        }
    }

    // Check if two balls are colliding and resolve
    resolveCollision(ball1, ball2) {
        const [x1, y1] = ball1.position;
        let [x2, y2] = ball2.position;
        if (x1 === x2 && y1 === y2) {
            x2 += 1;
            y2 += 1;
        }
        const [vx1, vy1] = ball1.velocity;
        const [vx2, vy2] = ball2.velocity;
        const [m1, m2] = [ball1.mass, ball2.mass];
        const [r1, r2] = [ball1.radius, ball2.radius];
        const e = Solver.#elasticity;

        const dx = x2 - x1;
        const dy = y2 - y1;
        let d = dx * dx + dy * dy;
        // Check if the balls are colliding
        if (d <= (r1 + r2) ** 2) {
            //const keBefore = this.kineticEnergy(m1, vx1, vy1, m2, vx2, vy2);

            // Solve collision
            d = d ** 0.5;
            const normal = [dx / d, dy / d];
            const momentum = 2 * (vx1 * normal[0] + vy1 * normal[1] - vx2 * normal[0] - vy2 * normal[1]) / (m1 + m2);
            const overlap = (r1 + r2 - d);
            ball1.position = [x1 - normal[0] * overlap, y1 - normal[1] * overlap];
            ball2.position = [x2 + normal[0] * overlap, y2 + normal[1] * overlap];
            ball1.velocity = [(vx1 - momentum * e * m2 * normal[0]), (vy1 - momentum * e * m2 * normal[1])];
            ball2.velocity = [(vx2 + momentum * e * m1 * normal[0]), (vy2 + momentum * e * m1 * normal[1])];

            if (Solver.store) {
                // Store collision information for rendering
                this.renderCollisionInformation();
                this.#collisionPoint = [(x1 * r2 + x2 * r1) / (r1 + r2), (y1 * r2 + y2 * r1) / (r1 + r2)];
                this.#collisionNormal = normal;
                this.#direction1 = [ball1.velocity[0], ball1.velocity[1]];
                this.#direction2 = [ball2.velocity[0], ball2.velocity[1]];
            }


            /*
            const keAfter = this.kineticEnergy(m1, ball1.velocity[0], ball1.velocity[1], m2, ball2.velocity[0], ball2.velocity[1]);
            console.log("B: "+keBefore);
            console.log("A: "+keAfter);
            console.log("S: "+this.kineticEnergySystem());
            */
        }
    }

    kineticEnergy(m1, v1x, v1y, m2, v2x, v2y) {
        const p1 = 0.5 * m1 * (v1x ** 2 + v1y ** 2);
        const p2 = 0.5 * m2 * (v2x ** 2 + v2y ** 2);
        return p1 + p2;
    }

    kineticEnergySystem() {
        let ke = 0;
        for (let ball of this.#balls) {
            ke += 0.5 * ball.mass * (ball.velocity[0] ** 2 + ball.velocity[1] ** 2);
        }
        return ke;
    }

    renderCollisionInformation() {
        if (this.#collisionPoint) {
            const [x, y] = this.#collisionPoint;
            this.renderCross([x, y], this.#collisionNormal);
            this.renderVector([x, y], this.#direction1);
            this.renderVector([x, y], this.#direction2);
        }
    }

    renderVector([x, y], vector, color = "green") {
        if (Math.abs(vector[0]) < 0.01 && Math.abs(vector[1]) <= 0.01) return;
        this.#context.beginPath();
        this.#context.moveTo(x, y);
        this.#context.lineTo(x + vector[0] * 0.5, y + vector[1] * 0.5);

        const arrowheadDirection = Math.atan2(vector[1], vector[0]); // Direction of arrowhead, in radians
        this.#context.lineTo(
            x + vector[0] * 0.5 - 15 * Math.cos(arrowheadDirection - Math.PI / 6),
            y + vector[1] * 0.5 - 15 * Math.sin(arrowheadDirection - Math.PI / 6)
        );
        this.#context.moveTo(x + vector[0] * 0.5, y + vector[1] * 0.5);
        this.#context.lineTo(
            x + vector[0] * 0.5 - 15 * Math.cos(arrowheadDirection + Math.PI / 6),
            y + vector[1] * 0.5 - 15 * Math.sin(arrowheadDirection + Math.PI / 6)
        );

        this.#context.strokeStyle = color;
        this.#context.stroke();
    }

    renderCross([x, y], normal) {
        this.#context.beginPath();
        this.#context.moveTo(x - normal[1] * 3000, y - -normal[0] * 3000);
        this.#context.lineTo(x + normal[1] * 3000, y + -normal[0] * 3000);
        this.#context.moveTo(x - normal[0] * 3000, y - normal[1] * 3000);
        this.#context.lineTo(x + normal[0] * 3000, y + normal[1] * 3000);
        this.#context.strokeStyle = "blue";
        this.#context.stroke();
    }
}
