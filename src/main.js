var commonRole = require('role.common');
var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var towers = require('role.tower');

var spawnWorkers = require('spawn.workers');
var memory = require('memory');

module.exports.loop = function () {
  memory.cleanup();

  spawnWorkers.run();
  towers.run();

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (commonRole.checkLife(creep)) {
      continue;
    }

    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
}
