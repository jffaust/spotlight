export class Center {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Charge {
    enabled: boolean;
    strength: number;
    distanceMin: number;
    distanceMax: number;
    constructor(enabled: boolean, strength: number, distanceMin: number, distanceMax: number) {
        this.enabled = enabled;
        this.strength = strength;
        this.distanceMin = distanceMin;
        this.distanceMax = distanceMax;
    }
}

export class Collide {
    enabled: boolean;
    strength: number;
    iterations: number;
    radius: number;
    constructor(enabled: boolean, strength: number, iterations: number, radius: number) {
        this.enabled = enabled;
        this.strength = strength;
        this.iterations = iterations;
        this.radius = radius;
    }
}

export class Link {
    enabled: boolean;
    distance: number;
    iterations: number;
    constructor(enabled: boolean, distance: number, iterations: number) {
        this.enabled = enabled;
        this.distance = distance;
        this.iterations = iterations;
    }
}

export class Position {
    enabled: boolean;
    position: number;
    strength: number;
    constructor(enabled: boolean, position: number, strength: number) {
        this.enabled = enabled;
        this.position = position;
        this.strength = strength;
    }
}

export class Radial {
    enabled: boolean;
    x: number;
    y: number;
    radius: number;
    strength: number;
    constructor(enabled: boolean, x: number, y: number, radius: number, strength: number) {
        this.enabled = enabled;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.strength = strength;
    }
}