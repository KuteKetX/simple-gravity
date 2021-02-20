class GravityObject {
	constructor(mass, x, y, xSpeed, ySpeed, color) {
		this.mass = mass;
		this.pos = createVector(x, y);
		this.speed = createVector(xSpeed, ySpeed);
		this.color = color;
	}

	handleCollision(other) {
		var distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
		// console.log("----------------------------------------")
		// console.log(distance)
		// console.log(sqrt(this.mass / PI) + sqrt(other.mass / PI))
		// console.log("----------------------------------------")

		// Check if we're overlapping.
		if (distance < (sqrt(this.mass / PI) + sqrt(other.mass / PI))) {
			// Add the area of both objects together. (a = PI * r^2)
			// var sum = (PI * (sqrt(this.mass / PI) * sqrt(this.mass / PI))) + (PI * (sqrt(other.mass / PI) * sqrt(other.mass / PI)));

			// r = sqrt(a / PI)
			// this.mass = sqrt(sum / PI);

			return true;
		} else {
			return false;
		}
	}

	calculateForce(other) {
		const distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
		const force = 6.674 * this.mass * other.mass / distance ** 2;
		this.speed.add(force * (other.pos.x - this.pos.x) / distance / this.mass, force * (other.pos.y - this.pos.y) / distance / this.mass);
	}

	applyForce() {
		this.pos.add(this.speed);
	}

	show() {
		fill(this.color);
		noStroke();
		circle(this.pos.x, this.pos.y, sqrt(this.mass / PI) * 2);
	}
}
