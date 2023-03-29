class Ball {
    #positionX;
    #positionY;

    #accelerationX;
    #accelerationY;
    #velocityX;
    #velocityY;

    #radius;
    #mass;
    #color

    //static maxVelocity = 1000;
    static gravity = {x: 0, y: 0}
    static drag = 0.0;
    static restitution = 1; // 1 = no loss of energy (100% elastic), 0 = no bounce
    static rho = 0.0;

    static horizontalCollisionLine = null;
    static verticalCollisionLine = null;
    static collisionOutput1 = null;
    static collisionOutput2 = null;

    constructor(x, y, radius, initialVelocity = {x: 0, y: 0}, color = 'black') {
        this.#positionX = x;
        this.#positionY = y;
        this.#velocityX = initialVelocity.x;
        this.#velocityY = initialVelocity.y;
        this.#accelerationX = 0;
        this.#accelerationY = 0;
        this.#color = color;

        this.#radius = radius;

        //this.#mass = (4 / 3) * Math.PI * Math.pow(this.#radius, 3);
        //this.#mass = Math.PI * Math.pow(this.#radius, 3);
        this.#mass = this.#radius * 5;
    }

    update(dt) {
        this.updatePosition(dt);
        this.constrain();
        this.solveCollision(dt);
        this.updateVelocity(dt);
        //this.solveCollision(dt);
        //this.constrain();
    }

    newAcceleration() {
        // F = 0.5 * v^2 * Cd * rho * A
        // Cd = drag coefficient
        // rho = density of fluid
        // A = area of object
        const Fx = 0.5 * this.#velocityX * this.#velocityX * Ball.drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * Math.sign(this.#velocityX);
        const Fy = 0.5 * this.#velocityY * this.#velocityY * Ball.drag * Ball.rho * Math.PI * Math.pow(this.#radius, 2) * Math.sign(this.#velocityY);
        const ax = Fx / this.#mass;
        const ay = Fy / this.#mass;

        return [Ball.gravity.x - ax, Ball.gravity.y - ay];
    }

    updateVelocity(dt) {
        [this.#accelerationX, this.#accelerationY] = this.newAcceleration();
        this.#velocityX += this.#accelerationX * dt * 0.5;
        this.#velocityY += this.#accelerationY * dt * 0.5;

        if (Math.abs(this.#velocityX) < 0.00000001)
            this.#velocityX = 0;
        if (Math.abs(this.#velocityY) < 0.00000001)
            this.#velocityY = 0;

        //this.#accelerationX = 0;
        //this.#accelerationY = 0;
    }

    updatePosition(dt) {
        this.#positionX = this.#positionX + this.#velocityX * dt + this.#accelerationX * 0.5 * dt ** 2;
        this.#positionY = this.#positionY + this.#velocityY * dt + this.#accelerationY * 0.5 * dt ** 2;
    }


    constrain() {
        if (this.#positionY > canvas.height - this.#radius) {
            this.#positionY = canvas.height - this.#radius;
            this.#velocityY *= -Ball.restitution;
        } else if (this.#positionY < this.#radius) {
            this.#positionY = this.#radius;
            this.#velocityY *= -Ball.restitution;
        }
        if (this.#positionX > canvas.width - this.#radius) {
            this.#positionX = canvas.width - this.#radius;
            this.#velocityX *= -Ball.restitution;
        } else if (this.#positionX < this.#radius) {
            this.#positionX = this.#radius;
            this.#velocityX *= -Ball.restitution;
        }
    }


    kineticEnergy(m1, m2, v1, v2) {
        return 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
    }

    momentum(m1, m2, v1, v2) {
        return Math.trunc(m1 * Math.abs(v1) + m2 * Math.abs(v2));
    }

    getMass() {
        return this.#mass;
    }

    getVelocity() {
        return [this.#velocityX, this.#velocityY]
    }

    getAcceleration() {
        return [this.#accelerationX, this.#accelerationY]
    }

    getPosition() {
        return [this.#positionX, this.#positionY]
    }

    setRadius(radius) {
        this.#radius = radius;
        //this.#mass = (4 / 3) * Math.PI * Math.pow(this.#radius, 3);
        //this.#mass = Math.PI * Math.pow(this.#radius, 3);
        this.#mass = this.#radius * 5;
    }

    // Dot product
    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }

    solveCollision() {
        const educational = educ;
        const [v1x, v1y, thisPosX, thisPosY, m1] = [this.#velocityX, this.#velocityY, this.#positionX, this.#positionY, this.#mass];
        const elastic = Ball.restitution === 1 && Ball.rho === 0 && Ball.drag === 0;
        for (let ball of balls) {
            if (ball === this) continue;
            const dx = thisPosX - ball.#positionX;
            const dy = thisPosY - ball.#positionY;
            const dsqr = dx * dx + dy * dy;
            if (dsqr < (this.#radius + ball.#radius) ** 2) {
                // Momentum before collision
                const momentX = this.momentum(m1, ball.#mass, v1x, ball.#velocityX);
                const momentY = this.momentum(m1, ball.#mass, v1y, ball.#velocityY);

                const theta = Math.atan2(dy, dx);
                const col_vec = [Math.cos(theta), Math.sin(theta)];
                const col_vec_perp = [-Math.sin(theta), Math.cos(theta)];

                const v1_col = this.dot([v1x, v1y], col_vec);
                const v2_col = this.dot([ball.#velocityX, ball.#velocityY], col_vec);

                const v1_perp = this.dot([v1x, v1y], col_vec_perp);
                const v2_perp = this.dot([ball.#velocityX, ball.#velocityY], col_vec_perp);

                const v1_col_f = ((ball.#mass - m1) * v1_col + 2 * ball.#mass * v2_col) / (m1 + ball.#mass);
                const v2_col_f = ((m1 - ball.#mass) * v2_col + 2 * m1 * v1_col) / (m1 + ball.#mass);

                const v1_f = [v1_col_f * col_vec[0] + v1_perp * col_vec_perp[0], v1_col_f * col_vec[1] + v1_perp * col_vec_perp[1]];
                const v2_f = [v2_col_f * col_vec[0] + v2_perp * col_vec_perp[0], v2_col_f * col_vec[1] + v2_perp * col_vec_perp[1]];

                // update velocity
                this.#velocityX = v1_f[0] * Ball.restitution;
                this.#velocityY = v1_f[1] * Ball.restitution;
                ball.#velocityX = v2_f[0] * Ball.restitution;
                ball.#velocityY = v2_f[1] * Ball.restitution;

                // Momentum after the collision
                const momentX2 = this.momentum(m1, ball.#mass, this.#velocityX, ball.#velocityX);
                const momentY2 = this.momentum(m1, ball.#mass, this.#velocityY, ball.#velocityY);
                if ((elastic && momentX2+momentY2 !== momentX+momentY) || (momentX2+momentY2 > momentX+momentY)) {
                    const ratio = (momentX+momentY)/(momentX2+momentY2);
                    this.#velocityX *= ratio;
                    this.#velocityY *= ratio;
                    ball.#velocityX *= ratio;
                    ball.#velocityY *= ratio;
                }

                if (educational) {
                    Ball.verticalCollisionLine = (this.#positionX * ball.#radius + ball.#positionX * this.#radius) / (this.#radius + ball.#radius);
                    Ball.horizontalCollisionLine = (this.#positionY * ball.#radius + ball.#positionY * this.#radius) / (this.#radius + ball.#radius);
                    Ball.collisionOutput1 = [this.#velocityX, this.#velocityY];
                    Ball.collisionOutput2 = [ball.#velocityX, ball.#velocityY];
                }

                const overlap = (this.#radius + ball.#radius) - Math.sqrt(dsqr);
                this.#positionX += col_vec[0] * overlap;
                this.#positionY += col_vec[1] * overlap;
                ball.#positionX -= col_vec[0] * overlap;
                ball.#positionY -= col_vec[1] * overlap;
            }
        }
    }

    display() {
        context.beginPath();
        context.moveTo(this.#positionX, this.#positionY);
        context.arc(this.#positionX, this.#positionY, this.#radius, 0, 2 * Math.PI);
        context.fillStyle = this.#color;
        context.fill();
    }
}

