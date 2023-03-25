class Ball {
    #position;
    #velocity;
    #acceleration;
    #radius;
    #mass;

    static gravity = {x: 0, y: 9.82}
    static drag = 0.02;
    static friction = 4;
    static rho = 1.225;

    constructor(x, y, radius, initialVelocity = {x: 0, y: 0}) {
        this.#position = {x: x, y: y};
        this.#velocity = initialVelocity;
        this.#acceleration = {x: 0, y: 0};

        this.#radius = radius;
        this.#mass = (4 / 3 * Math.PI * Math.pow(radius, 3));
    }

    update(dt) {
        this.updatePosition(dt);
        this.updateAcceleration(dt);
        this.updateVelocity(dt)
        this.constrain(dt);
    }

    updatePosition(dt) {
        this.#position.x = this.#position.x + this.#velocity.x * dt + 0.5 * this.#acceleration.x * dt * dt;
        this.#position.y = this.#position.y + this.#velocity.y * dt + 0.5 * this.#acceleration.y * dt * dt;
    }

    updateVelocity(dt) {
        this.#velocity = {
            x: this.#velocity.x + this.#acceleration.x * dt * 0.5,
            y: this.#velocity.y + this.#acceleration.y * dt * 0.5
        }

        if (Math.abs(this.#velocity.x) < 0.6) {
            this.#velocity.x = 0;
        }
    }

    updateAcceleration() {
        // F = 0.5 * v^2 * Cd * rho * A
        // Cd = drag coefficient
        // rho = density of fluid
        // A = area of object
        let signX = Math.sign(this.#velocity.x);
        let signY = Math.sign(this.#velocity.y);
        let drag = (this.#position.y > canvas.height - this.#radius) ? Ball.friction : Ball.drag;
        let F = {
            x: 0.5 * this.#velocity.x * this.#velocity.x * drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * signX,
            y: 0.5 * this.#velocity.y * this.#velocity.y * drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * signY
        }

        /*
        if (this.#position.y >= canvas.height - this.#radius) {
            F.x -= Ball.friction * this.#mass * Ball.gravity.y;
            console.log(F.x);
        }
        */

        // a = F/m
        this.#acceleration = {
            x: Ball.gravity.x - F.x / this.#mass,
            y: Ball.gravity.y - F.y / this.#mass
        }
    }

    constrain() {
        if (this.#position.y > canvas.height - this.#radius) {
            this.#velocity.y = -this.#velocity.y;
            this.#position.y = canvas.height - this.#radius;
        }
        if (this.#position.x > canvas.width - this.#radius) {
            this.#velocity.x = -this.#velocity.x;
            this.#position.x = canvas.width - this.#radius - 1;
        }
        if (this.#position.x < this.#radius) {
            this.#velocity.x = -this.#velocity.x;
            this.#position.x = this.#radius + 1;
        }
    }

    display() {
        context.moveTo(this.#position.x, this.#position.y);
        context.arc(this.#position.x, this.#position.y, this.#radius, 0, 2 * Math.PI);
    }
}