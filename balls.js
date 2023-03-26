class Ball {
    #position;
    #velocity;
    #acceleration;
    #radius;
    #mass;
    #color

    //static maxVelocity = 1000;
    static gravity = {x: 0, y: 0.0}
    static drag = 0.1;
    static restitution = 0.98; // 1 = no loss of energy (100% elastic), 0 = no bounce
    static rho = 0.5;

    constructor(x, y, radius, initialVelocity = {x: 0, y: 0}, color = 'black') {
        this.#position = {x: x, y: y};
        this.#velocity = initialVelocity;
        this.#acceleration = {x: 0, y: 0};
        this.#color = color;

        this.#radius = radius;
        this.#mass = 4/3 * Math.PI * Math.pow(this.#radius, 3);
        //this.#mass = Math.PI * Math.pow(this.#radius, 2);
        //this.#mass = this.#radius ** 2;
    }

    update(dt) {
        this.updatePosition(dt);
        this.updateAcceleration(dt);
        this.updateVelocity(dt);
        this.solveCollisions();
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
        /*
        if (Math.abs(this.#velocity.x) > Ball.maxVelocity) {
            this.#velocity.x = Math.sign(this.#velocity.x) * Ball.maxVelocity;
        }
        if (Math.abs(this.#velocity.y) > Ball.maxVelocity) {
            this.#velocity.y = Math.sign(this.#velocity.y) * Ball.maxVelocity;
        }
        */

    }

    touchingBall(ball) {
        let distance = Math.sqrt(Math.pow(this.#position.x - ball.#position.x, 2) + Math.pow(this.#position.y - ball.#position.y, 2));
        return distance <= this.#radius + ball.#radius;
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
        else if (this.#position.y < this.#radius) {
            this.#velocity.y = -this.#velocity.y * Ball.restitution;
            this.#position.y = this.#radius;
        }
        if (this.#position.x > canvas.width - this.#radius) {
            this.#velocity.x = -this.#velocity.x * Ball.restitution;
            this.#position.x = canvas.width - this.#radius;
        }
        else if (this.#position.x < this.#radius) {
            this.#velocity.x = -this.#velocity.x * Ball.restitution;
            this.#position.x = this.#radius;
        }
    }

    solveCollisions() {
        const thisVelocityX = this.#velocity.x
        const thisVelocityY = this.#velocity.y
        const thisMass = this.#mass;
        const thisRadius = this.#radius;
        for (const ball of balls) {
            if (ball !== this) {
                const dx = this.#position.x - ball.#position.x;
                const dy = this.#position.y - ball.#position.y;

                const dsqr = dx * dx + dy * dy;
                const sizesum = this.#radius + ball.#radius;
                if (dsqr < sizesum * sizesum) {
                    const d = Math.sqrt(dsqr);
                    const normal1 = dx / d
                    const normal2 = dy / d
                    const tangent1 = -normal2;
                    const tangent2 = normal1;

                    const dpNormal1 = thisVelocityX * normal1 + thisVelocityY * normal2;
                    const dpNormal2 = ball.#velocity.x * normal1 + ball.#velocity.y * normal2;
                    const dpTangent1 = thisVelocityX * tangent1 + thisVelocityY * tangent2;
                    const dpTangent2 = ball.#velocity.x * tangent1 + ball.#velocity.y * tangent2;

                    const impulse1 = (dpNormal1 * (thisMass - ball.#mass) + 2 * ball.#mass * dpNormal2) / (thisMass + ball.#mass);
                    const impulse2 = (dpNormal2 * (ball.#mass - thisMass) + 2 * thisMass * dpNormal1) / (thisMass + ball.#mass);

                    const rest = (1 - Ball.restitution);
                    const thisTemp1 = Ball.restitution * (tangent1 * dpTangent1 + normal1 * impulse1) + rest * thisVelocityX;
                    const thisTemp2 = Ball.restitution * (tangent2 * dpTangent1 + normal2 * impulse1) + rest * thisVelocityY;
                    const otherTemp1 = Ball.restitution * (tangent1 * dpTangent2 + normal1 * impulse2) + rest * ball.#velocity.x;
                    const otherTemp2 = Ball.restitution * (tangent2 * dpTangent2 + normal2 * impulse2) + rest * ball.#velocity.y;

                    const angle1 = Math.atan2(thisTemp2, thisTemp1);
                    const angle2 = Math.atan2(otherTemp2, otherTemp1);
                    const magnitude1 = Math.sqrt(thisTemp1 * thisTemp1 + thisTemp2 * thisTemp2);
                    const magnitude2 = Math.sqrt(otherTemp1 * otherTemp1 + otherTemp2 * otherTemp2);

                    this.#velocity.x = Math.cos(angle1) * magnitude1;
                    this.#velocity.y = Math.sin(angle1) * magnitude1;
                    ball.#velocity.x = Math.cos(angle2) * magnitude2;
                    ball.#velocity.y = Math.sin(angle2) * magnitude2;

                    const overlap = 0.5 * (d - thisRadius - ball.#radius);
                    this.#position.x -= overlap * normal1;
                    this.#position.y -= overlap * normal2;
                    ball.#position.x += overlap * normal1;
                    ball.#position.y += overlap * normal2;
                }
            }
        }
    }


    display() {
        context.beginPath();
        //context.moveTo(this.#position.x, this.#position.y);
        context.arc(this.#position.x, this.#position.y, this.#radius, 0, 2 * Math.PI);
        context.fillStyle = this.#color;
        context.fill();
    }
}