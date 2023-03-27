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
    static drag = 0.1;
    static restitution = 0.98; // 1 = no loss of energy (100% elastic), 0 = no bounce
    static rho = 0.5;

    constructor(x, y, radius, initialVelocity = {x: 0, y: 0}, color = 'black') {
        this.#positionX = x;
        this.#positionY = y;
        this.#velocityX = initialVelocity.x;
        this.#velocityY = initialVelocity.y;
        this.#accelerationX = 0;
        this.#accelerationY = 0;
        this.#color = color;

        this.#radius = radius;
        this.#mass = 4 / 3 * Math.PI * Math.pow(this.#radius * 5, 3);
        //this.#mass = Math.PI * Math.pow(this.#radius, 2);
        //this.#mass = this.#radius ** 2;
    }

    update(dt) {
        this.updatePosition(dt);
        const [accelX, accelY] = this.newAcceleration();
        [this.#velocityX, this.#velocityY] = this.newVelocity(dt, accelX, accelY);
        this.#accelerationX = accelX;
        this.#accelerationY = accelY;
        this.solveCollision();
        //this.updatePosition(dt);
        this.constrain();
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

    newVelocity(dt, accelX, accelY) {
        const velX = this.#velocityX + (this.#accelerationX + accelX) * dt * 0.5;
        const velY = this.#velocityY + (this.#accelerationY + accelY) * dt * 0.5;
        return [velX, velY];
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

    solveCollision() {
        const [thisVelX, thisVelY, thisAccX, thisAccY, thisPosX, thisPosY] = [this.#velocityX, this.#velocityY, this.#accelerationX, this.#accelerationY, this.#positionX, this.#positionY];
        const thisMass = this.#mass;
        for (let ball of balls) {
            if (ball === this) continue;
            const dx = thisPosX - ball.#positionX;
            const dy = thisPosY - ball.#positionY;
            const dsqr = dx * dx + dy * dy;
            if (dsqr < (this.#radius + ball.#radius) ** 2) {
                const distance = Math.sqrt(dsqr);
                const theta = Math.atan2(dy, dx);
                const totalEnergyBefore = 0.5 * thisMass * (thisVelX * thisVelX + thisVelY * thisVelY) + 0.5 * ball.#mass * (ball.#velocityX * ball.#velocityX + ball.#velocityY * ball.#velocityY);

                let thisVel = thisVelX * Math.cos(theta) + thisVelY * Math.sin(theta);
                let ballVel = ball.#velocityX * Math.cos(theta) + ball.#velocityY * Math.sin(theta);

                let thisVelPrime = (thisVel * (thisMass - ball.#mass) + 2 * ball.#mass * ballVel) / (thisMass + ball.#mass);
                let ballVelPrime = (ballVel * (ball.#mass - thisMass) + 2 * thisMass * thisVel) / (thisMass + ball.#mass);

                this.#velocityX += (thisVelPrime - thisVel) * Math.cos(theta);
                this.#velocityY += (thisVelPrime - thisVel) * Math.sin(theta);
                ball.#velocityX += (ballVelPrime - ballVel) * Math.cos(theta);
                ball.#velocityY += (ballVelPrime - ballVel) * Math.sin(theta);

                const totalEnergyAfter = 0.5 * thisMass * (this.#velocityX * this.#velocityX + this.#velocityY * this.#velocityY) + 0.5 * ball.#mass * (ball.#velocityX * ball.#velocityX + ball.#velocityY * ball.#velocityY);
                if (Math.trunc(totalEnergyBefore) !== Math.trunc(totalEnergyAfter))
                console.log(totalEnergyBefore, totalEnergyAfter);

                const overlap = (this.#radius + ball.#radius - distance);
                const overlapX = overlap * Math.cos(theta);
                const overlapY = overlap * Math.sin(theta);
                this.#positionX += overlapX;
                this.#positionY += overlapY;
                ball.#positionX -= overlapX;
                ball.#positionY -= overlapY;
            }
        }
    }

    display() {
        context.beginPath();
        //context.moveTo(this.#position.x, this.#position.y);
        context.arc(this.#positionX, this.#positionY, this.#radius, 0, 2 * Math.PI);
        context.fillStyle = this.#color;
        context.fill();
    }
}