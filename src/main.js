var healing = require('creep.healing');
var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var claimer = require('role.claimer');
var towers = require('role.tower');

var spawnWorkers = require('spawn.workers');
var memory = require('memory');
var bootstrap = require('bootstrap.room');

module.exports.loop = function () {
  if (Game.time % 100 === 0) {
    memory.cleanup();
  }

  spawnWorkers.run();
  towers.run();
  bootstrap.checkBootstrap();

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (healing.checkLife(creep)) {
      continue;
    }

    switch (creep.memory.role) {
      case 'harvester':
        roleHarvester.run(creep);
        break;
      case 'builder':
        roleBuilder.run(creep);
        break;
      case 'claimer':
        claimer.run(creep);
        break;
    }
  }
}
