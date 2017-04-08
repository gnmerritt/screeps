var claimer = require('role.claimer');
var optimizeWorkers = require('optimize.workers');

function countRoles(room, role) {
  return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == role).length;
}

function getRole(room) {
  if (Memory.warTarget && countRoles(room, 'harvester') > 3) {
    return 'attacker';
  }
  return 'harvester';
  // TODO: check if we are under attack
}

function getCost(body) {
  var cost = 0;
  for (var piece of body) {
    cost += BODYPART_COST[piece];
  }
  return cost;
}

var adds = [
  [WORK, CARRY, MOVE, MOVE],
  [WORK, MOVE],
  [CARRY, MOVE],
  [MOVE]
];

function attackBody() {
  return [ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE];
}

function getBody(role, energy) {
  if (role === 'attacker') {
    return attackBody();
  }
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

function spawnCreep(spawn, role, energy) {
  var body = getBody(role, energy);
  spawn.room.log('Spawning a ' + role + ' using ' + energy + ' energy ' + body);
  spawn.createCreep(body, undefined, {role: role});
}

function switchRole(room, count, from, to) {
  var fromCreeps = room.find(FIND_MY_CREEPS, {
    filter: (creep) => creep.memory.role === from
  });
  for (var i = 0; i < count && i < fromCreeps.length; i++) {
    var toSwitch = fromCreeps[i];
    toSwitch.memory.role = to;
    room.log('Switched ' + toSwitch.name + ' to ' + to);
  }
}

function run() {
  optimizeWorkers.initMemory();
  optimizeWorkers.checkEnergy();

  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    var room = spawn.room;

    var creeps = room.find(FIND_MY_CREEPS);
    var numCreeps = creeps.length;
    var noCreeps = numCreeps === 0 && room.energyAvailable >= 300;
    var tooManyCreeps = numCreeps >= optimizeWorkers.getMaxCreeps(room.name);
    var maxEnergy = room.energyAvailable === room.energyCapacityAvailable;
    var usingFatCreeps = _.filter(creeps, c => c.memory.cost > room.energyCapacityAvailable).length > 0;
    // TODO: handle energy in multiple spawns?

    var role = getRole(spawn.room);
    var wartime = role === 'attacker' && room.energyAvailable >= getCost(attackBody());

    var spawnExpander = !noCreeps && countRoles(room, 'claimer') === 0 && claimer.shouldExpand(room);
    if (spawnExpander) {
      claimer.spawnExpander(spawn);
    }
    else if (wartime || (!tooManyCreeps && !usingFatCreeps && (maxEnergy || noCreeps))) {
      if (wartime) {
        room.log("Wartime! Making a soldier");
      }
      spawnCreep(spawn, role, room.energyAvailable);
    }
  }
}

module.exports = {
  run: run,
  getCost: getCost,
  countRoles: countRoles
};
