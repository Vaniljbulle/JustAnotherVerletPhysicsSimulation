class Ball {
    #positionOld;
    #positionNow;
    #radius;
    #color;
    #mass;

    constructor(x, y, radius, color) {
        this.#positionOld = {x: x, y: y};
        this.#positionNow = {x: x, y: y};
        this.#radius = radius;
        this.#color = color;
    }

    update(dt) {
        const velocity = {
            x: this.#positionNow.x - this.#positionOld.x,
            y: this.#positionNow.y - this.#positionOld.y
        };
        this.#positionOld = this.#positionNow;

        this.#positionNow.x += velocity.x;
        this.#positionNow.y += 5;

    }

    display() {
        context.arc(this.#positionNow.x, this.#positionNow.y, this.#radius, 0, 2 * Math.PI);
        //context.arc(this.#positionNow.x+100, this.#positionNow.y+100, this.#radius, 0, 2 * Math.PI);
    }
}