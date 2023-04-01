export class Ball {
    #position;
    #velocity;
    #acceleration;
    #force;

    static drag = 1;

    #radius;
    #mass;
    #color

    constructor([posX, posY] = [0,0], [velX, velY] = [0,0], radius = 10, color = 'black') {
        this.#position = [posX, posY]
        this.#velocity = [velX, velY]
        this.#acceleration = [0, 0]
        this.#force = [0, 0]
        this.#color = color;
        this.#radius = radius;

        //this.#mass = (4/3) * Math.PI * this.#radius ** 3;
        this.#mass = 4 * Math.PI * this.#radius ** 2;
        // this.#mass = this.#radius ** 2;
    }

    update(dt) {
        this.updatePosition(dt);
        this.updateVelocity(dt/2);
        this.updateAcceleration();
        this.updateVelocity(dt);
    }

    // x(t+dt) = x(t) + v(t)dt + 1/2a(t)dt^2
    updatePosition(dt) {
        const [x, y] = this.#position;
        const [vx, vy] = this.#velocity;
        const [ax, ay] = this.#acceleration;
        this.#position = [
            x + vx * dt + 0.5 * ax * dt * dt,
            y + vy * dt + 0.5 * ay * dt * dt];
    }

    // v(t+dt/2) = v(t) + 1/2a(t)dt
    updateVelocity(dt) {
        const [vx, vy] = this.#velocity;
        const [ax, ay] = this.#acceleration;
        this.#velocity = [
            Ball.drag*(vx + 0.5 * ax * dt),
            Ball.drag*(vy + 0.5 * ay * dt)];
    }

    // a(t+dt) = f(x(t+dt))/m
    updateAcceleration() {
        const [fx, fy] = this.#force;
        this.#acceleration = [
            fx / this.#mass,
            fy / this.#mass];
        this.#force = [0, 0];
    }

    applyForce(force) {
        this.#force = [
            this.#force[0] = force[0],
            this.#force[1] = force[1]
        ];
    }

    get mass() {
        return this.#mass;
    }

    get radius() {
        return this.#radius;
    }

    get position() {
        return this.#position;
    }

    get velocity() {
        return this.#velocity;
    }

    set velocity(velocity) {
        this.#velocity = velocity;
    }

    set position(position) {
        this.#position = position;
    }

    paint(context) {
        context.beginPath();
        context.moveTo(this.#position[0], this.#position[1]);
        context.arc(this.#position[0], this.#position[1], this.#radius, 0, 2 * Math.PI);
        context.fillStyle = this.#color;
        context.fill();
    }
}

