class GravityObject {
	constructor(mass, x, y, xSpeed, ySpeed) {
		this.mass = mass;
		this.pos = createVector(x, y);
		this.speed = createVector(xSpeed, ySpeed);
	}

	handleCollision(other) {
		var distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

		// Check if we're overlapping.

		// we don't need to make such an expensive call if they're obviously far away.
		// TODO: replace with bounding boxes.
		if (distance > this.mass * 2) {
			return false;
		}

		if (distance < (sqrt(this.mass / PI) + sqrt(other.mass / PI))) {
			return true;
		} else {
			return false;
		}
	}

	calculateForce(other) {
		// TODO: Don't do this if the object isn't visible and if the game is running at low framerates.
		const distance = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
		const force = 6.674 * this.mass * other.mass / distance ** 2;
		this.speed.add(force * (other.pos.x - this.pos.x) / distance / this.mass, force * (other.pos.y - this.pos.y) / distance / this.mass);
	}

	calculateMouseForce(x, y) {
		const distance = dist(this.pos.x, this.pos.y, x, y);
		const force = 6.674 * this.mass * 100000 / distance ** 2;
		this.speed.add(force * (x - this.pos.x) / distance / this.mass, force * (y - this.pos.y) / distance / this.mass);
	}

	applyForce() {
		this.pos.add(this.speed);
	}

	show() {
		fill("#CCC");
		noStroke();
		circle(this.pos.x, this.pos.y, sqrt(this.mass / PI) * 2);
	}
}
