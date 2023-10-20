window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const body = document.querySelector('body')
    //display things in controls div
    const speedDisplay = document.querySelector('.speed')
    const altitudeDisplay = document.querySelector('.altitude')
    const thrustDisplay = document.querySelector('.thrust')
    const ctx = canvas.getContext('2d');
    canvas.width = 1800;
    canvas.height = 720;
    let airports = []
    let distance = 0
    let groundFriction = 0.0001
    let airFriction = 0.008
    let gravity = 0.01

    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((   e.key === 'd' || 
                        e.key === 'a' || 
                        e.key === 'w' || 
                        e.key === 's')
                        && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key)
                }
            })
            window.addEventListener('keyup', e => {
                if (    e.key === 'd' ||
                        e.key === 'a' || 
                        e.key === 'w' || 
                        e.key === 's'){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            })
        }
    }

    class Plane {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 70
            this.x = 0
            this.y = (this.gameHeight - this.height)
            this.image = document.getElementById('planeImage')
            this.speedX = 0
            this.maxSpeedX = 10
            this.speedY = 0
            this.maxSpeedY = -0.25
            this.speedVector = 0
            this.thrust = 0
            this.maxThrust = 1
            this.lift = 0
            this.angle = 0
            this.gravitySpeed = 0
            this.lift = 0
        }
        draw(context) {
            context.save(); // Save the current canvas state
            context.translate(this.x + this.width / 2, this.y + this.height / 2); // Move the canvas origin to the center of the plane
            context.rotate(this.angle); // Apply the rotation transformation
            context.drawImage(this.image, 0, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height); // Draw the plane at the translated and rotated position
            context.restore();
            // context.drawImage(this.image, 0, 0, this.width, this.height, this.x, 
            //     this.y, this.width, this.height)
        }
        update(input) {
            //thrust controls
            if (input.keys.indexOf('d') > -1) {
                this.thrust += 0.005
            } if (input.keys.indexOf('a') > -1 && this.speedX > 0) {
                this.thrust -= 0.005
            } 

            //set max/min thrust
            if (this.thrust > this.maxThrust) this.thrust = this.maxThrust
            if (this.thrust < 0) this.thrust = 0

            //set the thrust change to the speed vector
            this.speedVector += 0.1 * this.thrust

            //maximum speed
            if (this.speedVector > 10) this.speedVector = 10
            
            //up and down controls
            if (input.keys.indexOf('w') > -1) {
                //if plane is already in the air
                if (this.y < this.gameHeight - this.height) {
                    this.angle += 0.2 * Math.PI / 180;
                }
            } if (input.keys.indexOf('s') > -1) {
                if (this.y < this.gameHeight - this.height) {
                    this.angle -= 0.2 * Math.PI / 180;
                }
            }

            //add effects of ground and air friction to speed vector
            if (this.speedVector > 0) this.speedVector -= airFriction*this.speedVector**(1.1)
            if (this.y == this.gameHeight - this.height) this.speedVector -= groundFriction*this.speedVector**2

            //set speed X according to speed vector and the plane angle
            if (this.angle > 0) {
                this.speedX += this.speedVector * Math.cos(this.angle)/100 - airFriction*this.speedX**(1.1)
            } else {
                this.speedX += this.speedVector * Math.cos(this.angle)/100 - airFriction*this.speedX**(1.1)
            }
            //FIX


            //gravity to Y speed
            this.lift = this.speedX

            //set speed Y according to speed vector & plane angle
            this.speedY += +this.speedVector*Math.sin(this.angle)/100 - this.lift/400 + gravity
            // console.log('speed Y:' + this.speedY)

            //max vertical speed
            if (this.speedY < this.maxSpeedY) {
                this.speedY = this.maxSpeedY
            }

            //set max horizontal speed
            if (this.speedX > this.maxSpeedX) this.speedX = this.maxSpeedX

            //fix bug if plane goes backwards
            if (this.speedX < 0.005) this.speedX = 0

            //apply speed to horizontal movement
            this.x += this.speedX

            //apply speed to vertical movement
            this.y += this.speedY

            //if plane touches ground
            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight-this.height
                this.angle = 0
                this.speedY = 0
            }

             //keep plane in center & scroll background instead
             if (this.x > this.gameWidth/2 - this.width/2) {
                this.x = this.gameWidth/2 - this.width/2
            }

            console.log(this.speedX)

        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.image = document.getElementById('backgroundImage')
            this.x = 0
            this.y = 0
            this.width = 1920
            this.height = 1200
            this.speed = 20
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
            //draw second image after 1st one to do illusion of infinite scroll:
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height)
        }
        update() {
            if (plane.x === plane.gameWidth/2 - plane.width/2) {
                this.x -= plane.speedX
            } if (this.x < 0 - this.width) this.x = 0
        }
    }

    class Airport {
        constructor(gameWidth, gameHeight, x) {
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.width = 898
            this.height = 108
            this.image = document.getElementById('airportImage')
            this.x = x
            this.y = (this.gameHeight - this.height)
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
        }
        update() {
            if (plane.x === plane.gameWidth/2 - plane.width/2) {
                this.x -= plane.speedX
            }
        }
    }

    //add airports to array
    airports.push(new Airport(canvas.width, canvas.height, 0))
    airports.push(new Airport(canvas.width, canvas.height, 10000))
    airports.push(new Airport(canvas.width, canvas.height, 25000))

    //function to draw each airport
    function handleAirports() {
        airports.forEach(airport => {
            airport.draw(ctx)
            airport.update()
        })
    }

    function setDistance() {
        for (const airport of airports) {
            if (airport.x > plane.x) {
                distance = Math.round((airport.x - plane.x - plane.width)/10, 1)
                break;
            }
        }
    }

    function displayDistance(context) {
        context.fillStyle = 'black'
        context.font = '20px Helvetica'
        context.fillText('Distance prochain aéroport: ' + distance + ' mètres', 20, 50)
        context.fillStyle = 'bold'
    }

    function displayInfos() {
        const roundedSpeed = Math.round((plane.speedX*60)*1)/10.0
        const roundedAltitude = Math.round(0+(plane.gameHeight-plane.y-plane.height) , 1)/18
        const roundedThrust = plane.thrust*100
        speedDisplay.innerHTML = 'Vitesse: ' + roundedSpeed.toFixed(1) + ' m/s'
        altitudeDisplay.innerHTML = 'Altitude: ' + roundedAltitude.toFixed(0) + 'm'
        thrustDisplay.innerHTML = 'Puissance: ' + roundedThrust.toFixed(0) + '%'
    }

    const input = new InputHandler();
    const plane = new Plane(canvas.width, canvas.height)
    const background = new Background(canvas.width, canvas.height)
    
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        background.draw(ctx)
        background.update()
        handleAirports()
        plane.draw(ctx)
        plane.update(input)
        setDistance()
        displayDistance(ctx)
        displayInfos()
        requestAnimationFrame(animate)
    }
    animate()

//     let timerID 
//     timerID = setInterval(function() {
//         console.log(distance)
// }, 1000)
    
})