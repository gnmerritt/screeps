var c = require('constants');
var claimer = require('role.claimer');

function countRoles(room, role) {
  return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == role).length;
}

function getRole(room) {
  if (countRoles(room, 'harvester') < 3) {
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

var MAX_TO_SPEND = 1200;

function run() {
  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    var room = spawn.room;

    var numCreeps = room.find(FIND_MY_CREEPS).length;
    var noCreeps = numCreeps === 0 && room.energyAvailable >= 300;
    var tooManyCreeps = numCreeps >= 10; // EXPERIMENT
    // before: harvested = 14.2K, on creeps = 5750
    var maxEnergy = room.energyAvailable === room.energyCapacityAvailable;
    var maxToSpend = room.energyAvailable >= MAX_TO_SPEND;
    // TODO: handle energy in multiple spawns?

    var spawnExpander = !noCreeps && countRoles(room, 'claimer') === 0 && claimer.shouldExpand(room);
    if (spawnExpander) {
      claimer.spawnExpander(spawn);
    }
    else if (!tooManyCreeps && (maxEnergy || maxToSpend || noCreeps)) {
      spawnCreep(spawn, Math.min(MAX_TO_SPEND, room.energyAvailable));
    }
  }
}

module.exports = {
  run: run,
  getCost: getCost
};
