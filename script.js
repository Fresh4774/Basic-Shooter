var game = {
  lives:5,
  score:0
};
var can = document.createElement("canvas");
var ctx = can.getContext('2d');
var shoot_timer,game_loop;
var blet = {
  length:10,
  thickness:3
};
document.body.appendChild(can);
function resize(){
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    clean();
}
function clean(){
  ctx.fillStyle = "rgba(33,33,33,1)";
  ctx.fillRect(0,0,can.width,can.height);
  ctx.fill();
}
var key = {};
window.onkeyup = function(e){
  key[e.keyCode] = false;
};
window.onkeydown = function(e){
  key[e.keyCode] = true;
};
window.onmousedown = function(){
  shoot_timer = setInterval(function(){
  	player.shoot();
  },50);
};
window.onmouseup = function(){
  clearTimeout(shoot_timer);
};

function distance(p1,p2){
  return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
}

var bullets = [];
class Bullet{
  constructor(position,velocity,direction){
    this.position = position;
    this.velocity = velocity;
    this.direction = direction || -1;
  }
  update(){
    this.position.x += this.direction * this.velocity.x;
    this.position.y += this.direction * this.velocity.y;
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.position.x,this.position.y,blet.thickness,blet.length);
    ctx.fill();
  }
}

class Enemy{
  constructor(position,velocity){
    this.position = position;
    this.velocity = velocity;
  }
  update(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  check(){
    for(var i in bullets){
      return distance(bullets[i].position,this.position) < 25;
    }
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = "#ff0";
    ctx.arc(this.position.x,this.position.y,10,0,Math.PI*2);
    ctx.fill();
  }
}

class Player{
  constructor(position,velocity){
    this.position = position;
    this.velocity = velocity;
  }
  update(){
    if(key[37] || key[65]) this.position.x -= this.velocity.x;
    if(key[38] || key[87]) this.position.y -= this.velocity.y;
    if(key[39] || key[68]) this.position.x += this.velocity.x;
    if(key[40] || key[83]) this.position.y += this.velocity.y;
  }
  shoot(){
    var b = new Bullet({
      x:this.position.x-blet.thickness/2,
      y:this.position.y-15
    },{
      x:0,
      y:3
    });
    b.update();
    bullets.push(b);
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = "rgb(56,250,56)";
    ctx.arc(this.position.x,this.position.y,10,0,Math.PI*2);
    ctx.fill();
  }
}





var enemies = [];
var player;
function setup(){
  player = new Player({x:can.width/2,y:can.height-50},{x:3,y:1});
  var count = 5;
  var t = setInterval(function(){
    if(count--)
      player.shoot();
    else clearInterval(t);
  },100);
}
function overflow(position){
  return position.x > can.width || position.x < 0 || position.y > can.height || position.y < 0;
}
function write_data(){
  ctx.fillStyle = "#fff";
  ctx.fillRect(can.width-200,0,200,100);
  ctx.fillStyle = "#000";
  ctx.font = "25px Arial";
  ctx.fillText("score : "+game.score,can.width-100-ctx.measureText("score : "+game.score).width/2,35);
  ctx.font = "25px Arial";
  ctx.fillText("lives : "+game.lives,can.width-100-ctx.measureText("lives : "+game.lives).width/2,85);
  ctx.beginPath();
  ctx.moveTo(can.width-200,50);
  ctx.lineTo(can.width,50);
  ctx.stroke();
}
var difficulty = 10;
function draw(){
  clean();
  if(game.lives < 0) {
    clearInterval(game_loop);
    ctx.fillStyle = "#fff";
    ctx.font = "50px Arial";
  	ctx.fillText("Game Over",can.width/2-ctx.measureText("Game Over").width/2,can.height/2);
    return;
  }
  var i;
  if(Math.floor(Math.random()*10) == 9 && enemies.length < difficulty){
    var e = new Enemy({
      x:20 + Math.random()*(can.width - 40),
      y:10
    },{
      x:0,
      y:0.1 + Math.random()*0.1*difficulty
    });
    enemies.push(e);
  }
  player.update();
  player.draw();
  if(player.position.x > can.width) player.position.x %= player.position.x;
  if(player.position.x < 0) player.position.x = can.width + player.position.x;
  for(i in bullets){
    bullets[i].update();
    bullets[i].draw();
    if(overflow(bullets[i].position)){
      bullets.splice(i,1);
    }else{
      for(var j in enemies){
        if(distance(enemies[j].position,bullets[i].position) <= 10){
          game.score += 1;
          enemies.splice(j,1);
        }
      }
    }
  }
  for(i in enemies){
    ctx.fillStyle = "#ff0";
    enemies[i].update();
    enemies[i].draw();
    if(overflow(enemies[i].position) || distance(enemies[i].position,player.position) <= 20){
      game.lives -= 1;
      if(~~(Math.random()*5) == 1) difficulty = Math.max(1,difficulty-1);
      enemies.splice(i,1);
    }
  }
  write_data();
}

resize();
window.onresize = resize;
setup();
game_loop = setInterval(draw,10);