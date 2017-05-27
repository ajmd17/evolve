function Creature(position, direction, color) {
  this.position = position;
  this.direction = direction;
  this.radius = 70;
  this.color = color;
  this.stats = {
    timer: 0
  };
}

Creature.prototype.intersects = function (x, y, width, height) {
  return circleIntersectsRectangle({
    x: this.position.x,
    y: this.position.y,
    radius: this.radius
  }, {
    x: x,
    y: y,
    width: width,
    height: height
  });
};

Creature.prototype.update = function (delta) {
  this.position.x += this.direction.x * delta;
  this.position.y += this.direction.y * delta;
};

Creature.prototype.render = function (canvas, context) {
  context.beginPath();
  context.arc(this.position.x + (canvas.width) / 2, this.position.y + (canvas.height) / 2, this.radius, 0, 2 * Math.PI, false);
  context.fillStyle = this.color;
  context.fill();
};