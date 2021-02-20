let objects = [];
let nearbyObjects = [];
let farObjects = [];

//  Camera.
let camera;
let camMouseX = 0;
let camMouseY = 0;
let camSpeed = 25;
let camSpeedDefault = camSpeed;

let zoom = 0.5;
let debugConnections = 0;

const debugEnabled = true;
const debugShowFarConnections = false;
const hudEnabled = true;
const maxObjects = 50;
const crosshairSize = 10; // hudEnabled needs to be true.

function setup() {
	createCanvas(windowWidth, windowHeight);

	// Hide the cursor.
	noCursor();

	for (var i = 0; i < 50; i++) {
		objects[i] = new GravityObject(random(50, 10000), random(-width * 32, width * 32), random(-height * 32, height * 32), random(-32, 32), random(-32, 32));
	}

	// camera = createVector(height / 2, width / 2);
	camera = createVector(0, 0);

	// if (debugEnabled) {
	// 	frameRate(20);
	// }
}

function draw() {
	background(15);

	if (hudEnabled) {
		// Draw small crosshair at the center.
		stroke(255, 0, 0);
		line((width / 2) - crosshairSize, (height / 2), (width / 2) + crosshairSize, (height / 2));
		line((width / 2), (height / 2) - crosshairSize, (width / 2), (height / 2) + crosshairSize);

		// Draw small crosshair at the mouse position.
		stroke(255, 0, 255);

		if (mouseIsPressed) {
			line(mouseX + (crosshairSize / 2), mouseY - (crosshairSize / 2), mouseX - (crosshairSize / 2), mouseY + (crosshairSize / 2));
			line(mouseX - (crosshairSize / 2), mouseY - (crosshairSize / 2), mouseX + (crosshairSize / 2), mouseY + (crosshairSize / 2));
		} else {
			line(mouseX - (crosshairSize / 2), mouseY, mouseX + (crosshairSize / 2), mouseY);
			line(mouseX, mouseY - (crosshairSize / 2), mouseX, mouseY + (crosshairSize / 2));
		}

		noStroke();
		fill(255, 255, 0);
		textSize(16);
		textAlign(LEFT, TOP);

		let yAlign = 0;

		text(`FPS: ${frameRate()}`, 0, yAlign); yAlign += 16;

		if (debugEnabled) {
			text(`deltaTime: ${deltaTime}`, 0, yAlign); yAlign += 16;
			text(`GravityObject Count: ${objects.length}`, 0, yAlign); yAlign += 16;
			text(`Nearby GravityObjects: ${nearbyObjects.length}`, 0, yAlign); yAlign += 16;
			text(`Far GravityObjects: ${farObjects.length}`, 0, yAlign); yAlign += 16;
			text(`debugConnections: ${debugConnections}`, 0, yAlign); yAlign += 16;
			text(`Camera Position: ${camera.x}, ${camera.y}`, 0, yAlign); yAlign += 16;
			text(`Mouse Position: ${mouseX}, ${mouseY}`, 0, yAlign); yAlign += 16;
			text(`Mouse To World: ${camMouseX}, ${camMouseY}`, 0, yAlign); yAlign += 16;
			text(`World To Mouse: ${camMouseX - camera.x}, ${camMouseY - camera.y}`, 0, yAlign); yAlign += 16;
			text(`Zoom Amount Doubled: ${zoom * 2}`, 0, yAlign); yAlign += 16;

		}

		text(`Zoom Amount: ${zoom}`, 0, yAlign); yAlign += 16;
	}

	translate(width / 2, height / 2);

	// Set our zoom.
	scale(zoom);

	// Translate screen to the camera position.
	translate(-camera.x, -camera.y);

	camMouseX = camera.x + (mouseX - width / 2) / zoom;
	camMouseY = camera.y + (mouseY - height / 2) / zoom;

	// if (debugEnabled) {
	// 	// For testing.
	// 	circle(camera.x / 2, camera.y / 2, 100);
	// }

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
					console.log(`object ${i} collided with object ${j}`);
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

		if (mouseIsPressed) {
			objects[a].calculateMouseForce(camMouseX, camMouseY);
		}
	}

	// Apply the force for every GravityObject then render it.
	for (const obj of objects) {
		obj.applyForce();
		obj.show();
	}

	if (debugEnabled) {
		nearbyObjects = [];
		farObjects = [];

		// Reset counter.
		debugConnections = 0;

		// Show debug info for every GravityObject existing.
		for (var i = 0; i < objects.length; i++) {
			noStroke();
			fill(255, 0, 0);
			textSize(16);
			textAlign(CENTER, CENTER);
			text(i, objects[i].pos.x, objects[i].pos.y);

			let direction = createVector(objects[i].pos.x, objects[i].pos.y);
			let vel = createVector(objects[i].speed.x, objects[i].speed.y);
			vel.mult(10);
			direction.add(vel);

			stroke(255, 0, 0);
			line(objects[i].pos.x, objects[i].pos.y, direction.x, direction.y);

			let distance = dist(camera.x, camera.y, objects[i].pos.x, objects[i].pos.y);

			if (distance < 1500 / (zoom * 2)) {
				stroke(255, 0, 0);
				line(camera.x, camera.y, objects[i].pos.x, objects[i].pos.y);

				stroke(255, 0, 255);
				line(camMouseX, camMouseY, objects[i].pos.x, objects[i].pos.y);

				nearbyObjects.push(i);
				debugConnections++;
			} else {
				if (debugShowFarConnections) {
					stroke(255, 0, 0);
					line(camera.x, camera.y, objects[i].pos.x, objects[i].pos.y);
				}

				farObjects.push(i);
			}
		}
	}

	// Handle camera movement.
	if (keyIsPressed) {
		// Speed up the camera when the player is holding shift.
		if (keyIsDown(16)) {
			camSpeed = ((camSpeedDefault * 2) / zoom) * (deltaTime / 30);
		} else {
			camSpeed = (camSpeedDefault / zoom) * (deltaTime / 30);
		}

		if (keyIsDown(87)) { camera.y -= camSpeed; } // Move up.
		if (keyIsDown(65)) { camera.x -= camSpeed; } // Move left.
		if (keyIsDown(83)) { camera.y += camSpeed; } // Move down.
		if (keyIsDown(68)) { camera.x += camSpeed; } // Move right.

		// this will execute once every 60 frames.
		if (frameCount % 30 == 0) {
			nearbyObjects = [];
			farObjects = [];

			for (var i = 0; i < objects.length; i++) {
				let distance = dist(camera.x, camera.y, objects[i].pos.x, objects[i].pos.y);

				if (distance < 1500 / zoom) {
					nearbyObjects.push(i);
				} else {
					farObjects.push(i);
				}
			}

			for (var i = objects.length - 1; i >= 0; i--) {
				for (var j = 0; j < farObjects.length; j++) {
					if (i == farObjects[j]) {
						if (debugEnabled) {
							console.log(`Deleted GravityObject [${i}]`);
						}

						objects.splice(i, 1);
						farObjects.splice(j, 1);
					}
				}
			}

			let objCount = objects.length;

			for (var i = objCount; i < (objCount + 10); i++) {
				if (objects.length > maxObjects) {
					break;
				}

				objects[i] = new GravityObject(random(50 / (zoom * 2), 10000 / zoom), random(camera.x - (1500 / zoom), camera.x + (1500 / zoom)), random(camera.y - (1500 / zoom), camera.y + (1500 / zoom)), random(-32, 32), random(-32, 32));

				if (debugEnabled) {
					console.log("Created new GravityObject.");
				}
			}
		}
	}

	if (objects.length > maxObjects) {
		for (var i = objects.length - 1; i >= 0; i--) {
			if (objects.length > maxObjects) {
				objects.splice(i, 1);
			}
		}
	}
}

// Called when a button on the keyboard is pressed.
function keyPressed() {
	if (keyIsDown(70)) { // F Key.
		nearbyObjects = [];

		for (var i = 0; i < objects.length; i++) {
			let distance = dist(camera.x, camera.y, objects[i].pos.x, objects[i].pos.y);

			if (distance < 1500) {
				nearbyObjects.push(i);
			}
		}

		for (var i = objects.length - 1; i >= 0; i--) {
			for (var j = 0; j < farObjects.length; j++) {
				if (i == farObjects[j]) {
					console.log(`Deleted GravityObject [${i}]`);
					objects.splice(i, 1);
					farObjects.splice(j, 1);
				}
			}
		}

		let objCount = objects.length;

		for (var i = objCount; i < (objCount + 10); i++) {
			if (objects.length > maxObjects) {
				break;
			}

			objects[i] = new GravityObject(random(50, 10000), random(camera.x - (1500 / zoom), camera.x + (1500 / zoom)), random(camera.y - (1500 / zoom), camera.y + (1500 / zoom)), random(-32, 32), random(-32, 32));
			console.log("Created new GravityObject.");
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

	// returning false in this function disables page scrolling.
	return false;
}
