var healing = require('creep.healing');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleAttacker = require('role.attacker');
var roleDefender = require('role.defender');
var roleHauler = require('role.hauler');
var roleFlagHarvester = require('role.flagHarvester');
var claimer = require('role.claimer');
var towers = require('role.tower');

var flags = require('flag.main');
var spawnWorkers = require('spawn.workers');
var memory = require('memory');
var bootstrap = require('bootstrap.room');

require('prototypes'); // apply prototype modifications

module.exports.loop = function () {
  if (Game.time % 100 === 0) {
    memory.cleanup();
  }

  flags.run();
  spawnWorkers.run();
  towers.run();
  bootstrap.checkBootstrap();

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    creep.tick();
    if (healing.checkLife(creep)) {
      continue;
    }

    switch (creep.memory.role) {
      case 'harvester':
        roleHarvester.run(creep);
        break;
      case 'miner':
        roleMiner.run(creep);
        break;
      case 'hauler':
        roleHauler.run(creep);
        break;
      case 'flagHarvester':
        roleFlagHarvester.run(creep);
        break;
      case 'attacker':
        roleAttacker.run(creep);
        break;
      case 'defender':
        roleDefender.run(creep);
        break;
      case 'claimer':
        claimer.run(creep);
        break;
    }
  }
}
