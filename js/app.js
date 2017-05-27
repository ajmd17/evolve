$(function () {
  initCanvas();
});

var timeScale = 1;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function initCanvas() {
  var $mainCanvas = $('#main-canvas');
  var canvas = $mainCanvas[0];
  var context = canvas.getContext('2d');
  
  var FPS = 30;

  var game = new Game(canvas, 20, function (results) {
    console.log('Results:', results);
  });

  game.generateCreatures([]);

  setInterval(function () {
    game.loop(canvas, context);
  }, 1000 / FPS);
}

function Game(canvas, numCreatures, onDone) {
  this.iterationNum = 0;
  this.currentCreature = 0;
  this.timer = 0.0;
  this.numCreatures = numCreatures;
  this.lastTime = new Date().getTime();
  this.onDone = onDone;
  this.gameData = {
    creatures: [],
    currentTarget: new FoodSource({
      x: (Math.random() * canvas.width) - (canvas.width / 2),
      y: (Math.random() * canvas.height) - (canvas.height / 2)
    }, {
      width: 20,
      height: 20
    }, 'red')
  };
}

Game.prototype.generateCreatures = function (oldCreatures) {
  var creatures = [];

  // best of old creatures
  var bestOldCreatures = oldCreatures.filter(function (el) {
    return el.stats.success == true;
  }).sort(function (a, b) {
    return a.time - b.time; // sort by time
  });
  if (bestOldCreatures.length > 3) {
    bestOldCreatures.splice(Math.floor(bestOldCreatures.length / 2)); // kill off slowest half
  }

  var bestOldCreature;

  // generate creature for each iteration
  for (var i = 0; i < this.numCreatures; i++) {
    var direction = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1
    };

    if (this.iterationNum != 0 && bestOldCreatures.length != 0) {
      bestOldCreature = bestOldCreatures[i % bestOldCreatures.length];
      // weighted avg of direction
      direction.x = (direction.x / (this.iterationNum + 1)) + (bestOldCreature.direction.x - (bestOldCreature.direction.x / (this.iterationNum + 1)));
      direction.y = (direction.y / (this.iterationNum + 1)) + (bestOldCreature.direction.y - (bestOldCreature.direction.y / (this.iterationNum + 1)));
    }

    creatures.push(new Creature({
      x: 0,
      y: 0
    }, direction, getRandomColor()));
  }

  this.gameData.creatures = creatures;
};

Game.prototype.loop = function (canvas, context) {
  var now = new Date().getTime();
  var delta = now - this.lastTime;
  this.lastTime = now;
  
  this.timer += delta;

  // fill canvas
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  this.gameData.currentTarget.render(canvas, context);

  if (this.currentCreature < this.numCreatures) {
    var creature = this.gameData.creatures[this.currentCreature];

    creature.update(delta);
    creature.render(canvas, context);

    // check intersects with target
    if (creature.intersects(
      this.gameData.currentTarget.position.x,
      this.gameData.currentTarget.position.y,
      this.gameData.currentTarget.size.width,
      this.gameData.currentTarget.size.height)) {
      
      this.nextCreature({
        success: true,
        time: this.timer
      });
    }
    // check if out of bounds
    else if (creature.position.x >= (canvas.width / 2)  || creature.position.x <= (-canvas.width / 2) ||
        creature.position.y >= (canvas.height / 2) || creature.position.y <= (-canvas.height / 2)) {
      
      this.nextCreature({
        success: false,
        reason: 'Out of bounds',
        time: this.timer
      });
    }
  }
};

Game.prototype.nextCreature = function (stats) {
  this.timer = 0.0; // reset timer

  var creature = this.gameData.creatures[this.currentCreature];
  // set stats
  creature.stats = stats;

  this.currentCreature++;

  if (this.currentCreature >= this.numCreatures) {
    // done
    //this.onDone(this.gameData.creatures);
    this.nextIteration();
  }
};

Game.prototype.nextIteration = function () {
  this.iterationNum++;
  this.currentCreature = 0;
  this.generateCreatures(this.gameData.creatures);

  console.log('Beginning iteration ' + this.iterationNum + '...');
};