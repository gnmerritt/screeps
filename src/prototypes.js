Room.prototype.log = function(message) {
  console.log('[' + this.name + '] ' + message);
};

Creep.prototype.getTicks = function() {
  return this.memory.life || 0;
};

Creep.prototype.tick = function() {
  this.memory.life = this.getTicks() + 1;
};

Creep.prototype.getIdle = function() {
  return this.memory.idle || 0;
};

Creep.prototype.idle = function() {
  this.memory.idle = this.getIdle() + 1;
};

Creep.prototype.idlePercent = function() {
  return 100 * this.getIdle() / this.getTicks();
}

Creep.prototype.resetIdle = function() {
  this.memory.idle = 0;
  this.memory.life = 1;
}

Flag.prototype.log = function(message) {
  console.log('flag[' + this.name + '] ' + message);
}

Structure.prototype.hpPercent = function() {
  return 100 * this.hits / this.hitsMax;
}
