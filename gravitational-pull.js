var GAME = GAME || {};

/*
 * Game classes
 */

GAME.Void = function (radius, mass) {
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
    
    
    this.update = function(mousex, mousey, width, height, proportion) {
        this.x = (mousex - width/2) * proportion;
        this.y = (mousey - height/2) * proportion;
        if (this.gravity) this.mass += 1000000000000;
        
    }
    
    this.draw = function(ctx, width, height, proportion) {
        for (var i = 0; i < this.radii.length; i++) {
            this.radii[i] -= Math.floor(this.mass / 10000000000);
            console.log(this.mass);
            if (this.radii[i] < 2 ) {
                this.radii[i] = this.max_radius;
            }
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.arc(width/2 + this.x * proportion, height/2 + this.y * proportion, this.radii[i] * proportion,0,2*Math.PI);
            ctx.stroke();
        }
        
    }
}

GAME.Moon = function(x, y, radius, mass, id) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.vx = 10000 * (Math.random()-0.5);
    this.vy = 10000 * (Math.random()-0.5);
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
 * Game procedures (or methods) 
 */


GAME.MouseMouveHandler = function(e) {
    GAME.mousex = e.clientX;
    GAME.mousey = e.clientY;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) > GAME.screen_radius) GAME.void.gravity = false;
}

GAME.MouseDownHandler = function(e) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var adj = GAME.mousex - width/2;
    var opp = GAME.mousey - height/2;
    if (Math.sqrt(adj * adj + opp * opp) < GAME.screen_radius) GAME.void.gravity = true;
}

GAME.MouseUpHandler = function(e) {
    GAME.void.gravity = false;
}

GAME.new_game = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.moons = [];
    GAME.world_radius = 1000000;
    for (var i = 0; i < 2; i++) {
        var ok = false;
        var r = Math.random() * GAME.world_radius;
        var theta = Math.random() * 2 * Math.PI;
        GAME.moons.push(new GAME.Moon(r * Math.cos(theta), r * Math.sin(theta), GAME.world_radius * (i + 1) / 32, (i + 1) * (i + 1) * GAME.world_radius * GAME.world_radius, i));
    }
    GAME.void = new GAME.Void(2 * GAME.world_radius, 100 * GAME.world_radius * GAME.world_radius);
    GAME.void.gravity = false;
}

GAME.set_screen = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.ctx.canvas.width  = width;
    GAME.ctx.canvas.height = height;
    GAME.ctx.clearRect(0, 0, width, height);
    GAME.screen_radius = Math.min(width/2, height/2);
}


GAME.check = function(moons, radius) {
    var res = true;
    for (var i = 0; i < moons.length; i++ ) {
        var adj = moons[i].x;
        var opp = moons[i].y;
        if (Math.sqrt(adj * adj + opp * opp) + moons[i].radius > radius) res = false;
    }
    return res;
}

GAME.update = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.void.update(GAME.mousex, GAME.mousey, width, height, GAME.world_radius / GAME.screen_radius);
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].movement(GAME.moons, window.innerWidth, window.innerHeight);
    }
    var temp_moons = GAME.moons.slice();
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].gravity(GAME.void, temp_moons);
    }
    if (GAME.record < GAME.void.mass) GAME.record = GAME.void.mass;
    if (!GAME.check(GAME.moons, GAME.world_radius)) {
        localStorage.setItem('record', String(GAME.record));
        GAME.new_game();
    }
}

GAME.draw_moons = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    for (var i = 0; i < GAME.moons.length; i++) {
        GAME.moons[i].draw(GAME.ctx, width, height, GAME.screen_radius / GAME.world_radius);
    }
}

GAME.draw_planet = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.void.draw(GAME.ctx, width, height, GAME.screen_radius / GAME.world_radius);
}

GAME.draw_background = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ctx = GAME.ctx;
    ctx.beginPath();
    ctx.arc(width/2,height/2,GAME.screen_radius,0,2*Math.PI);
    ctx.fillStyle = "black"
    ctx.fill();
    ctx.stroke();
}

GAME.draw_text = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    GAME.ctx.fillStyle = "red";
    GAME.ctx.font = String(20) + "px Arial";
    GAME.ctx.fillText("Score: " + String(GAME.void.mass / Math.pow(GAME.world_radius, 2)), 0, 20);
    var txt = "HighScore: " + String(GAME.record / Math.pow(GAME.world_radius, 2));
    GAME.ctx.fillText(txt, 0, height-10);
}

GAME.draw_frame = function() {
    GAME.set_screen();
    if (GAME.mousex != undefined) {
        GAME.update();
        GAME.draw_background();
        GAME.draw_moons();
        if (GAME.void.gravity) GAME.draw_planet();
        GAME.draw_text();
    }
    window.requestAnimationFrame(GAME.draw_frame);
}

GAME.canvas = document.getElementById('myCanvas');
GAME.ctx = GAME.canvas.getContext('2d');
document.addEventListener("mousemove", GAME.MouseMouveHandler);
document.addEventListener("mousedown", GAME.MouseDownHandler);
document.addEventListener("mouseup", GAME.MouseUpHandler);
if (!localStorage.getItem('record')) localStorage.setItem('record', "0");
GAME.record = Number(localStorage.getItem('record'));
GAME.set_screen();
GAME.new_game();
window.requestAnimationFrame(GAME.draw_frame);