let objects = []

//  Camera.
let camera;
let camMouseX = 0;
let camMouseY = 0;
let camSpeed = 25;

let zoom = 0.5;

const debugEnabled = true;
const crosshairSize = 10;

function setup() {
	createCanvas(windowWidth, windowHeight);

	for (var i = 0; i < 10; i++) {
		objects[i] = new GravityObject(random(50, 1000), random(-width / 4, -width * 4), random(-height / 4, -height * 4), random(-16, 16), random(-16, 16), "#CCC");
	}

	// camera = createVector(height / 2, width / 2);
	camera = createVector(0, 0);

	// if (debugEnabled) {
	// 	frameRate(20);
	// }
}

function draw() {
	background(22);
	// translate((width / 2) - objects[0].pos.x, (height / 2) - objects[0].pos.y);

	if (debugEnabled) {
		// Draw small crosshair.
		stroke(255, 0, 0);
		line((width / 2) - crosshairSize, (height / 2), (width / 2) + crosshairSize, (height / 2));
		line((width / 2), (height / 2) - crosshairSize, (width / 2), (height / 2) + crosshairSize);

		noStroke();
		fill(255, 0, 0);
		textSize(16);
		textAlign(LEFT, TOP);

		text(`FPS: ${frameRate()}`, 0, 0);
		text(`GravityObject Count: ${objects.length}`, 0, 16);
		text(`Camera Position: ${camera.x}, ${camera.y}`, 0, 32);
		text(`Mouse Position: ${mouseX}, ${mouseY}`, 0, 48);
		text(`Mouse To World: ${camMouseX}, ${camMouseY}`, 0, 64);
		text(`Zoom Amount: ${zoom}`, 0, 80);
	}

	translate(width / 2, height / 2);

	// Set our zoom.
	scale(zoom);

	// Translate screen to the camera position.
	translate(-camera.x, -camera.y);

	camMouseX = camera.x + (mouseX - width / 2) / zoom;
	camMouseY = camera.y + (mouseY - height / 2) / zoom;

	if (debugEnabled) {
		// For testing.
		// circle(camMouseX, camMouseY, 1000);
	}

	// TODO: Optimize this trash as it's very expensive and can slow down
	//       performance when there's lots of objects in the game world.
	for (var i = objects.length - 1; i >= 0; i--) {
		for (var j = 0; j < objects.length; j++) {
			// Ensure both objects are defined.
			if (objects[i] == undefined || objects[j] == undefined) {
				continue;
			}

			// We don't want to check collision with ourselves.
			if (objects[j] == objects[i]) {
				continue;
			}

			if (objects[i].handleCollision(objects[j])) {
				if (debugEnabled) {
					console.log("object collided!");
				}

				// Add the area of both objects together. (a = PI * r^2)
				var sum = (PI * (sqrt(objects[i].mass / PI) * sqrt(objects[i].mass / PI))) + (PI * (sqrt(objects[j].mass / PI) * sqrt(objects[j].mass / PI)));

				// Check which GravityObject is bigger.
				if (objects[i].mass > objects[j].mass) {
					objects[i].mass = sum;

					objects.splice(j, 1);
				} else {
					objects[j].mass = sum;

					objects.splice(i, 1);
				}
			}
		}
	}

	// TODO: Find a way to put this in the first array without breaking anything.
	for (let a = 0; a < objects.length; a++) {
		for (let b = 0; b < objects.length; b++) {
			// Calculate the iterated GravityObject's force with other existing GravityObjects.
			objects[a].calculateForce(objects[b]);
		}
	}

	// Apply the force for every GravityObject then render it.
	for (const obj of objects) {
		obj.applyForce();
		obj.show();
	}

	if (debugEnabled) {
		// Show debug info for every GravityObject existing.
		for (var i = 0; i < objects.length; i++) {
			noStroke();
			fill(255, 0, 0);
			textSize(16);
			textAlign(CENTER, CENTER);
			text(i, objects[i].pos.x, objects[i].pos.y);

			let direction = createVector(objects[i].pos.x, objects[i].pos.y);
			let vel = createVector(objects[i].speed.x, objects[i].speed.y);
			vel.mult(2);
			direction.add(vel);

			stroke(255, 0, 0);
			line(objects[i].pos.x, objects[i].pos.y, direction.x, direction.y);
		}
	}

	// Handle camera movement.
	if (keyIsPressed) {
		// Speed up the camera when the player is holding shift.
		if (keyIsDown(16)) {
			camSpeed = 50;
		} else {
			camSpeed = 25;
		}

		if (keyIsDown(87)) { camera.y -= camSpeed; } // Move up.
		if (keyIsDown(65)) { camera.x -= camSpeed; } // Move left.
		if (keyIsDown(83)) { camera.y += camSpeed; } // Move down.
		if (keyIsDown(68)) { camera.x += camSpeed; } // Move right.
	}

	// if (debugEnabled) {
	// 	// For testing.
	// 	circle(camera.x + (mouseX - width / 2) / zoom, camera.y + (mouseY - height / 2) / zoom, 1000);
	// }
}

// Called when a button on the keyboard is pressed.
function keyPressed() {
	if (keyIsDown(70)) { // F key.
		let objCount = objects.length;

		for (var i = objCount; i < (objCount + 10); i++) {
			if (debugEnabled) {
				console.log("Created new GravityObject.");
			}

			objects[i] = new GravityObject(random(50, 10000), random(camMouseX / 2, camMouseX * 2), random(camMouseY / 2, camMouseY * 2), random(-16, 16), random(-16, 16), "#CCC");
		}
	}
}

// Called every time the user scrolls.
function mouseWheel(event) {
	if (zoom > 0) {
		if (zoom - (event.delta / 100) <= 0.01) {
			zoom = 0.01;
		} else {
			zoom -= event.delta / 100;
		}
	} else {
		zoom = 0.01;
	}

	// if (debugEnabled) {
	// 	console.log(event.delta);
	// 	console.log(zoom);
	// 	console.log("-------------------------------");
	// }

	// returning false in this function disables page scrolling.
	return false;
}
