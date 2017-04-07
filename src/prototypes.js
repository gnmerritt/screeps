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