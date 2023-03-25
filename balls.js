class Ball {
    #position;
    #velocity;
    #acceleration;
    #radius;
    #mass;

    static gravity = {x: 0, y: 9.82}
    static drag = 0.02;
    static restitution = 0.97; // 1 = no loss of energy (100% elastic), 0 = no bounce
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
        this.collisionsWithBalls();
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
        let F = {
            x: 0.5 * this.#velocity.x * this.#velocity.x * Ball.drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * Math.sign(this.#velocity.x),
            y: 0.5 * this.#velocity.y * this.#velocity.y * Ball.drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * Math.sign(this.#velocity.y)
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
            this.#velocity.y = -this.#velocity.y * Ball.restitution;
            this.#position.y = canvas.height - this.#radius;
        }
        if (this.#position.x > canvas.width - this.#radius) {
            this.#velocity.x = -this.#velocity.x * Ball.restitution;
            this.#position.x = canvas.width - this.#radius;
        }
        if (this.#position.x < this.#radius) {
            this.#velocity.x = -this.#velocity.x * Ball.restitution;
            this.#position.x = this.#radius;
        }
    }

    collisionsWithBalls() {
        // Don't judge, math isn't my forte
        for (let i = 0; i < balls.length; i++) {
            if (this !== balls[i]) {
                const dx = this.#position.x - balls[i].#position.x;
                const dy = this.#position.y - balls[i].#position.y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < this.#radius + balls[i].#radius) {
                    const normal = {x: dx / d, y: dy / d};
                    const dpNormal = {
                        x: this.#velocity.x * normal.x + this.#velocity.y * normal.y,
                        y: balls[i].#velocity.x * normal.x + balls[i].#velocity.y * normal.y
                    }

                    const tangent = {x: -normal.y, y: normal.x};
                    const dpTangent = {
                        x: this.#velocity.x * tangent.x + this.#velocity.y * tangent.y,
                        y: balls[i].#velocity.x * tangent.x + balls[i].#velocity.y * tangent.y
                    }

                    const impulse = {
                        x: (dpNormal.x * (this.#mass - balls[i].#mass) + 2 * balls[i].#mass * dpNormal.y) / (this.#mass + balls[i].#mass),
                        y: (dpNormal.y * (balls[i].#mass - this.#mass) + 2 * this.#mass * dpNormal.x) / (this.#mass + balls[i].#mass)
                    }

                    this.#velocity.x = Ball.restitution * (tangent.x * dpTangent.x + normal.x * impulse.x) + (1 - Ball.restitution) * this.#velocity.x;
                    this.#velocity.y = Ball.restitution * (tangent.y * dpTangent.x + normal.y * impulse.x) + (1 - Ball.restitution) * this.#velocity.y;
                    balls[i].#velocity.x = Ball.restitution * (tangent.x * dpTangent.y + normal.x * impulse.y) + (1 - Ball.restitution) * balls[i].#velocity.x;
                    balls[i].#velocity.y = Ball.restitution * (tangent.y * dpTangent.y + normal.y * impulse.y) + (1 - Ball.restitution) * balls[i].#velocity.y;

                    const angle = {
                        x: Math.atan2(this.#velocity.y, this.#velocity.x),
                        y: Math.atan2(balls[i].#velocity.y, balls[i].#velocity.x)
                    }
                    const magnitude = {
                        x: Math.sqrt(this.#velocity.x * this.#velocity.x + this.#velocity.y * this.#velocity.y),
                        y: Math.sqrt(balls[i].#velocity.x * balls[i].#velocity.x + balls[i].#velocity.y * balls[i].#velocity.y)
                    }

                    this.#velocity.x = Math.cos(angle.x) * magnitude.x;
                    this.#velocity.y = Math.sin(angle.x) * magnitude.x;
                    balls[i].#velocity.x = Math.cos(angle.y) * magnitude.y;
                    balls[i].#velocity.y = Math.sin(angle.y) * magnitude.y;

                    let overlap = 0.5 * (d - this.#radius - balls[i].#radius);
                    this.#position.x -= overlap * normal.x;
                    this.#position.y -= overlap * normal.y;
                    balls[i].#position.x += overlap * normal.x;
                    balls[i].#position.y += overlap * normal.y;
                }
            }
        }
    }


    display() {
        context.moveTo(this.#position.x, this.#position.y);
        context.arc(this.#position.x, this.#position.y, this.#radius, 0, 2 * Math.PI);
    }
}