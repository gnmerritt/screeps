var c = require('constants');

function countRoles(role) {
  return _.filter(Game.creeps, (creep) => creep.memory.role == role).length
}

function getRole() {
  if (countRoles('harvester') < 1) {
    return 'harvester';
  }
  // TODO: check if we are under attack
  // TODO: make sure there are construction sites
  return 'builder';
}

function getBody(role, energy) {
  return [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
}

function spawnCreep(spawn, energy) {
  var role = getRole();
  var body = getBody(role, energy);
  console.log('Spawning a ' + role + ' using ' + energy + ' energy');
  spawn.createCreep(body, undefined, {role: role});
}

function run() {
  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    if (spawn.energy == spawn.energyCapacity) {
      spawnCreep(spawn, spawn.energyCapacity);
    }
  }
}

module.exports = {
  run: run
};
