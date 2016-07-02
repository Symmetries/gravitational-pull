var GAME = GAME || {};

/*
 * Game classes
 */

GAME.Planet = function (radius, mass) {
    this.radius = radius;
    this.radii = [];
    for (var i = radius; i > 2; i -= radius/10) {
        this.radii.push(i);
    }
    this.max_radius = radius
    this.mass = mass;
    this.color = "white";
    this.x = 0;
    this.y = 0;
    this.gravity = false;
    
    
    this.update = function(mousex, mousey) {
        this.x = mousex;
        this.y = mousey;
        if (this.gravity) this.mass += 1;
    }
    
    this.draw = function(ctx) {
        for (var i = 0; i < this.radii.length; i++) {
            this.radii[i] -= Math.floor(this.mass / 100);
            if (this.radii[i] < 2 ) {
                this.radii[i] = this.max_radius;
            }
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.arc(this.x, this.y,this.radii[i],0,2*Math.PI);
            ctx.stroke();
        }
        
    }
}

GAME.Moon = function(x, y, radius, mass, id) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.vx = Math.random()-0.5;
    this.vy = Math.random()-0.5;
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
                    //this.color = 'rgb(' + String(Math.floor(Math.random() * 256)) + ", " + String(Math.floor(Math.random() * 256)) + ", " + String(Math.floor(Math.random() * 256)) + ")"
                    //other.color = 'rgb(' + String(Math.floor(Math.random() * 256)) + ", " + String(Math.floor(Math.random() * 256)) + ", " + String(Math.floor(Math.random() * 256)) + ")"
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
//         if (this.x - this.radius <= 0) {
//             this.x = this.radius;
//         } 
//         if (this.x + this.radius >= width) {
//             this.x = width - this.radius;
//         }
//         if ((this.x - this.radius <= 0 && this.vx < 0) || (this.x + this.radius >= width && this.vx > 0)) {
//             this.vx = -this.vx;
//         }
//         if (this.y - this.radius <= 0) {
//             this.y = this.radius;
//         }
//         if (this.y + this.radius >= height) {
//             this.y = height - this.radius;
//         }
//         if ((this.y - this.radius <= 0 && this.vy < 0) || (this.y + this.radius >= height && this.vy > 0)) {
//             this.vy = -this.vy;
//         }
        this.x += this.vx
        this.y += this.vy
    }
    
    this.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }
}

/*
 * Game procedures (or methods) 
 */


GAME.MouseMouveHandler = function(e) {
    GAME.mousex = e.clientX;
    GAME.mousey = e.clientY;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) > GAME.radius) GAME.planet.gravity = false;
}

GAME.MouseDownHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) < GAME.radius) GAME.planet.gravity = true;
}

GAME.MouseUpHandler = function(e) {
    GAME.planet.gravity = false;
}

GAME.new_game = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.moons = [];
    for (var i = 0; i < 2; i++) {
        var ok = false;
        var r = Math.random() * GAME.radius;
        var theta = Math.random() * 2 * Math.PI;
        GAME.moons.push(new GAME.Moon(width/2 + r * Math.cos(theta), height/2  + r * Math.sin(theta), 10 * (i + 1), 50 * (i + 1) * (i + 1), i));
    }
    GAME.planet = new GAME.Planet(2 * GAME.radius, 100);
    GAME.planet.gravity = false;
}

GAME.set_screen = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.ctx.canvas.width  = width;
    GAME.ctx.canvas.height = height;
    GAME.ctx.clearRect(0, 0, width, height);
    GAME.radius = Math.min(width/2, height/2);
}


GAME.check = function(moons, width, height, radius) {
    var res = true;
    for (var i = 0; i < moons.length; i++ ) {
        var adj = width/2 - moons[i].x;
        var opp = height/2 - moons[i].y;
        if (Math.sqrt(adj * adj + opp * opp) + moons[i].radius > radius) res = false;
    }
    return res;
}

GAME.update = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.planet.update(GAME.mousex, GAME.mousey);
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].movement(GAME.moons, window.innerWidth, window.innerHeight);
    }
    var temp_moons = GAME.moons.slice();
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].gravity(GAME.planet, temp_moons);
        GAME.moons[i].draw(GAME.ctx);
    }
    if (!GAME.check(GAME.moons, width, height, GAME.radius)) GAME.new_game();
}

GAME.draw_moons = function() {
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].draw(GAME.ctx);
    }
}

GAME.draw_planet = function() {
    GAME.planet.draw(GAME.ctx);
}

GAME.draw_background = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ctx = GAME.ctx;
    ctx.beginPath();
    ctx.arc(width/2,height/2,GAME.radius,0,2*Math.PI);
    ctx.fillStyle = "black"
    ctx.fill();
    ctx.stroke();
}

GAME.draw_text = function() {
    GAME.ctx.fillStyle = "black";
    GAME.ctx.font = 20 + "px Arial";
    GAME.ctx.fillText("Force: " + String(GAME.planet.mass) + "000 N", 0, 20);
}

GAME.draw_frame = function() {
    GAME.set_screen();
    if (GAME.mousex != undefined) {
        GAME.update();
        GAME.draw_background();
        GAME.draw_moons();
        if (GAME.planet.gravity) GAME.draw_planet();
        GAME.draw_text();
    }
    window.requestAnimationFrame(GAME.draw_frame);
}

GAME.canvas = document.getElementById('myCanvas');
GAME.ctx = GAME.canvas.getContext('2d');
document.addEventListener("mousemove", GAME.MouseMouveHandler);
document.addEventListener("mousedown", GAME.MouseDownHandler);
document.addEventListener("mouseup", GAME.MouseUpHandler);
GAME.set_screen()
GAME.new_game();
window.requestAnimationFrame(GAME.draw_frame);