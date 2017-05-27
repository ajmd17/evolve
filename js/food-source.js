function FoodSource(position, size, color) {
  this.position = position;
  this.size = size;
  this.color = color;
}

FoodSource.prototype.render = function (canvas, context) {
  var radius = 70;

  context.fillStyle = this.color;
  context.fillRect(
    this.position.x + (canvas.width / 2),
    this.position.y + (canvas.height / 2),
    this.size.width,
    this.size.height
  );
};