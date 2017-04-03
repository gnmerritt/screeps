var c = require('constants');

function countRoles(room, role) {
  return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == role).length;
}

function getRole(room) {
  if (countRoles(room, 'harvester') < room.controller.level) {
    return 'harvester';
  }
  // TODO: check if we are under attack
  return 'builder';
}

function getCost(body) {
  var cost = 0;
  for (piece in body) {
    cost += c.costs[body[piece]];
  }
  return cost;
}

var adds = [
  [WORK, CARRY, MOVE, MOVE],
  [WORK, MOVE],
  [CARRY, MOVE],
  [MOVE]
];

function getBody(role, energy) {
  var base = [WORK, CARRY, MOVE];
  var cost = getCost(base);

  while (cost < energy) {
    var remaining = energy - cost;
    var added = false;

    // add the largest chunk we can, bail if there isn't enough energy left
    for (var i in adds) {
      var toAdd = adds[i];
      if (getCost(toAdd) < remaining) {
        base = base.concat(toAdd);
        cost = getCost(base);
        added = true;
        break;
      }
    }

    if (!added) {
      break;
    }
  }
  return base;
}

function spawnCreep(spawn, energy) {
  var role = getRole(spawn.room);
  var body = getBody(role, energy);
  console.log('Spawning a ' + role + ' using ' + energy + ' energy ' + body);
  spawn.createCreep(body, undefined, {role: role});
}

function run() {
  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    var room = spawn.room;
    var noCreeps = room.find(FIND_MY_CREEPS).length === 0;
    // TODO: handle energy in multiple spawns?
    if (room.energyAvailable === room.energyCapacityAvailable || noCreeps) {
      spawnCreep(spawn, room.energyAvailable);
    }
  }
}

module.exports = {
  run: run
};
