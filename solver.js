import {Ball} from './ball.js';

export class Solver {
    #balls;
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
        this.#gravity = [gravityX, gravityY];
        this.#context = ctx;
    }

    // Add new ball to the simulation
    addBall([x,y] = [0,0], [vx, vy] = [0,0], radius = 10, color = 'black') {
        this.#balls.push(new Ball([x,y], [vx, vy], radius, color));
    }

    // Remove ball from the simulation
    removeBall(ball) {
        this.#balls = this.#balls.filter(b => b !== ball);
    }

    reset() {
        this.#balls = [];
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

    // Render the simulation
    render() {
        this.#context.clearRect(0, 0, this.#context.canvas.width, this.#context.canvas.height);
        this.#balls.forEach(ball => ball.paint(this.#context));
        if (Solver.store) {
            this.renderCollisionInformation();
        }
        if (Solver.vector) {
            this.#balls.forEach(ball => this.renderVector(ball.position, ball.velocity, 'red'));
        }
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

    // Iterate over all balls and check for collisions (Will be optimized at some point)
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

            if(Solver.store){
                // Store collision information for rendering
                this.renderCollisionInformation();
                this.#collisionPoint = [(x1 * r2 + x2 * r1) / (r1 + r2), (y1 * r2 + y2 * r1) / (r1 + r2)];
                this.#collisionNormal = normal;
                this.#direction1 = [ball1.velocity[0],ball1.velocity[1]];
                this.#direction2 = [ball2.velocity[0],ball2.velocity[1]];
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
        const p1 = 0.5 * m1 * (v1x**2 + v1y**2);
        const p2 = 0.5 * m2 * (v2x**2 + v2y**2);
        return p1 + p2;
    }

    kineticEnergySystem() {
        let ke = 0;
        for (let ball of this.#balls) {
            ke += 0.5 * ball.mass * (ball.velocity[0]**2 + ball.velocity[1]**2);
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