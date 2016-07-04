var GAME = GAME || {};

/*
 * GAME CLASSES
 */

GAME.Void = function (radius, mass) {
    //class of the "mysterious gravitational force"
    this.max_radius = radius
    this.radii = [];
    var length = 10;
    for (var i = 0; i < length; i++) {
        this.radii.push(((i + 1) * this.max_radius) / length);
    }
    this.mass = mass;
    this.color = "white";
    this.x = 0;
    this.y = 0;
    this.gravity = false;
    
    
    this.update = function(mousex, mousey, width, height, proportion) {
        this.x = (mousex - width/2) * proportion;
        this.y = (mousey - height/2) * proportion;
        if (this.gravity) this.mass += 100000000000;
        
    }
    
    this.draw = function(ctx, width, height, proportion, line_length) {
        //draw rings
        if (this.gravity) {
            for (var i = 0; i < this.radii.length; i++) {
                this.radii[i] -= Math.floor(this.mass / 5000000000);
                if (this.radii[i] < 2 ) {
                    for (var j = 0; j < this.radii.length; j++) {
                        this.radii[j] = ((j + 1) * this.max_radius) / this.radii.length;
                    }
                }
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.arc(width/2 + this.x * proportion, height/2 + this.y * proportion, this.radii[i] * proportion, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
        
        //draw reticle
        ctx.strokeStyle = "red";
        
        ctx.beginPath();
        ctx.moveTo(width/2 + this.x * proportion - line_length, height/2 + this.y * proportion);
        ctx.lineTo(width/2 + this.x * proportion + line_length, height/2 + this.y * proportion);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(width/2 + this.x * proportion, height/2 + this.y * proportion - line_length);
        ctx.lineTo(width/2 + this.x * proportion, height/2 + this.y * proportion + line_length);
        ctx.stroke();
    }
}


GAME.Moon = function(x, y, vx, vy, radius, mass, id) {
    //class of the bodies
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.vx = vx;
    this.vy = vy;
    this.id = id;
    this.color = "#888888";
    
    function rotate(v, theta) {
        return [v[0] * Math.cos(theta) - v[1] * Math.sin(theta), v[0] * Math.sin(theta) + v[1] * Math.cos(theta)];
    }
    
    this.gravity = function (planet, moons) {
        if (planet.gravity) {
            var adj = planet.x - this.x;
            var opp = planet.y - this.y;
            var accel = planet.mass/(adj* adj + opp * opp);
            var theta = Math.atan2(opp, adj);
            this.vx += accel * Math.cos(theta);
            this.vy += accel * Math.sin(theta);
        }
        for (var i = 0; i < moons.length; i++) {
            if (i != this.id) {
                adj = moons[i].x - this.x;
                opp = moons[i].y - this.y;
                if (Math.sqrt(adj * adj + opp * opp) > moons[i].radius + this.radius ) {
                    accel = moons[i].mass/(adj * adj + opp * opp);
                    theta = Math.atan2(opp, adj);
                    this.vx += accel * Math.cos(theta);
                    this.vy += accel * Math.sin(theta);
                }
            }
        }
    }
    
    this.movement = function(moons, width, height) {
        for (var i = this.id + 1; i < moons.length; i++) {
            var other = moons[i];
            if (Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)) < this.radius + other.radius) {
                //collison code goes here
                var res = [this.vx - other.vx, this.vy - other.vy];
                if (res[0] *(other.x - this.x) + res[1] * (other.y - this.y) >= 0 ) {
                    var m1 = this.mass
                    var m2 = other.mass
                    var theta = -Math.atan2(other.y - this.y, other.x - this.x);
                    var v1 = rotate([this.vx, this.vy], theta);
                    var v2 = rotate([other.vx, other.vy], theta);
                    var u1 = rotate([v1[0] * (m1 - m2)/(m1 + m2) + v2[0] * 2 * m2/(m1 + m2), v1[1]], -theta);
                    var u2 = rotate([v2[0] * (m2 - m1)/(m1 + m2) + v1[0] * 2 * m1/(m1 + m2), v2[1]], -theta);
                    
                    this.vx = u1[0];
                    this.vy = u1[1];
                    other.vx = u2[0];
                    other.vy = u2[1];
                }
            }
        }

        this.x += this.vx
        this.y += this.vy
    }
    
    this.draw = function(ctx, width, height, proportion) {
        ctx.beginPath();
        ctx.arc(width/2 + this.x * proportion, height/2  + this.y * proportion, this.radius * proportion, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }
}

/*
 * GAME EVENT HANDLERS
 */

//mouse events
GAME.MouseDownHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.mousex = e.clientX;
    GAME.mousey = e.clientY;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) < GAME.screen_radius) GAME.void.gravity = true;
}

GAME.MouseMouveHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.mousex = e.clientX;
    GAME.mousey = e.clientY;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) > GAME.screen_radius) GAME.void.gravity = false;
}


GAME.MouseUpHandler = function(e) {
    GAME.void.gravity = false;
}

//touch events
GAME.TouchStartHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    e.preventDefault();
    GAME.mousex = e.touches[0].clientX;
    GAME.mousey = e.touches[0].clientY;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) < GAME.screen_radius) GAME.void.gravity = true;
    console.log(e.touches);
}

GAME.TouchMoveHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    e.preventDefault();
    GAME.mousex = e.touches[0].clientX;
    GAME.mousey = e.touches[0].clientY;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) > GAME.screen_radius) GAME.void.gravity = false;
    
}


GAME.TouchEndHandler = function(e) {
    e.preventDefault();
    GAME.void.gravity = false;
}
/*
 * GAME METHODS
 */

GAME.setup = function() {
    //called once at the beggining, sets up the game
    GAME.canvas = document.getElementById('myCanvas');
    GAME.ctx = GAME.canvas.getContext('2d');
    
    document.addEventListener("mousedown", GAME.MouseDownHandler);
    document.addEventListener("mousemove", GAME.MouseMouveHandler);
    document.addEventListener("mouseup", GAME.MouseUpHandler);
    
    document.addEventListener("touchstart", GAME.TouchStartHandler, false);
    document.addEventListener("touchmove", GAME.TouchMoveHandler, false);
    document.addEventListener("touchend", GAME.TouchEndHandler, false);
    
    //document.addEventListener("touchcancel", handleCancel, false);
    
    if (!localStorage.getItem('record')) localStorage.setItem('record', "0");
    GAME.record = Number(localStorage.getItem('record'));
    GAME.set_screen();
    GAME.new_game();
}


GAME.start = function() {
    //starts the game loop by requesting a new frame at 60 fps or lower, depending on the hardware
    window.requestAnimationFrame(GAME.draw_frame);
}


GAME.new_game = function() {
    GAME.moons = [];
    GAME.world_radius = 1000000;
    GAME.moons.push(new GAME.Moon(0, 0, -GAME.world_radius * 0.004, 0, GAME.world_radius / 16, 1000 * GAME.world_radius * GAME.world_radius, 0));
    GAME.moons.push(new GAME.Moon(0, -GAME.world_radius / 2, GAME.world_radius * 0.04, 0, GAME.world_radius / 32, 100 * GAME.world_radius * GAME.world_radius, 1));
    GAME.void = new GAME.Void(2 * GAME.world_radius, 0);
    GAME.score = 0;
    GAME.void.gravity = false;
}


GAME.set_screen = function(width, height) {
    //sets the dimensions of the canvas and the radius of the game circle
    GAME.ctx.canvas.width  = width;
    GAME.ctx.canvas.height = height;
    GAME.ctx.clearRect(0, 0, width, height);
    GAME.screen_radius = Math.min(width/2, height/2);
}


GAME.update = function(width, height) {
    //updates the game (moves planets, sets score, etc)
    GAME.void.update(GAME.mousex, GAME.mousey, width, height, GAME.world_radius / GAME.screen_radius);
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].movement(GAME.moons, window.innerWidth, window.innerHeight);
    }
    var temp_moons = GAME.moons.slice();
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].gravity(GAME.void, temp_moons);
    }
    if (GAME.void.gravity) GAME.score++;
    if (GAME.record < GAME.score) GAME.record = GAME.score;
    if (!GAME.check(GAME.moons, GAME.world_radius)) {
        localStorage.setItem('record', String(GAME.record));
        GAME.new_game();
    }
}


GAME.check = function(moons, radius) {
    //returns whether or not a moon is outside of a circle defined by a radius
    var res = true;
    for (var i = 0; i < moons.length; i++ ) {
        var adj = moons[i].x;
        var opp = moons[i].y;
        if (Math.sqrt(adj * adj + opp * opp) + moons[i].radius > radius) res = false;
    }
    return res;
}


GAME.draw_background = function(width, height) {
    //draws the background
    var ctx = GAME.ctx;
    ctx.beginPath();
    ctx.arc(width/2,height/2,GAME.screen_radius,0,2*Math.PI);
    ctx.fillStyle = "black"
    ctx.fill();
    ctx.stroke();
}


GAME.draw_moons = function(width, height) {
    // draws the moons
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].draw(GAME.ctx, width, height, GAME.screen_radius / GAME.world_radius);
    }
}


GAME.draw_void = function(width, height) {
    //draws the planet
    GAME.void.draw(GAME.ctx, width, height, GAME.screen_radius / GAME.world_radius, GAME.screen_radius/16);
}


GAME.draw_text = function(width, height) {
    //draws the score and best score texts
    GAME.ctx.fillStyle = "red";
    var px = Math.floor(GAME.screen_radius / 10)
    GAME.ctx.font = String(px) + "px Arial";
    GAME.ctx.fillText("Score: " + String(GAME.score), Math.floor(GAME.screen_radius / 50), px);
    var txt = "Best: " + String(GAME.record);
    GAME.ctx.fillText(txt, width - GAME.ctx.measureText(txt).width - Math.floor(GAME.screen_radius/50), px);
}


GAME.draw_frame = function() {
    //updates game and draws on the screen
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.set_screen(width, height);
    
    //if the position of the mouse is undefined, set it to (0, 0)
    if (GAME.mousex == undefined) {
        GAME.mousex = 0;
        GAME.mousey = 0;
    }
    
    GAME.update(width, height);
    GAME.draw_background(width, height);
    GAME.draw_moons(width, height);
    GAME.draw_void(width, height);
    GAME.draw_text(width, height);
    
    //request next frame
    window.requestAnimationFrame(GAME.draw_frame);
}

GAME.setup();
GAME.start();
