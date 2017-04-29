var claimer = require('role.claimer');
var optimizeWorkers = require('optimize.workers');

function countRoles(room, role) {
  return _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == role).length;
}

function getCost(body) {
  var cost = 0;
  for (var piece of body) {
    cost += BODYPART_COST[piece];
  }
  return cost;
}

var WORK_ADDS = [
  [WORK, CARRY, MOVE],
  [WORK, MOVE],
  [CARRY, MOVE],
  [MOVE]
];

var DEFENSE_ADDS = [
  [TOUGH, RANGED_ATTACK, MOVE, MOVE],
  [TOUGH, ATTACK, MOVE, MOVE],
  [ATTACK, MOVE],
  [TOUGH, MOVE],
  [MOVE],
];

function getBody(role, energy) {
  let adds, base, movesPerBody;
  if (role === 'attacker' || role === 'defender') {
    base = [TOUGH, TOUGH, MOVE, ATTACK, ATTACK, MOVE];
    adds = DEFENSE_ADDS;
    movesPerBody = 1;
  } else {
    adds = WORK_ADDS;
    base = [WORK, CARRY, MOVE];
    movesPerBody = 0.5;
  }
  var cost = getCost(base);

  while (cost < energy && base.length < MAX_CREEP_SIZE) {
    var remaining = energy - cost;
    var added = false;

    // add the largest chunk we can, bail if there isn't enough energy left
    for (var i in adds) {
      var toAdd = adds[i];
      if (getCost(toAdd) < remaining && (toAdd.length + base.length) <= MAX_CREEP_SIZE) {
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

  // now remove any extra MOVE body parts
  var numMoves = _.filter(base, b => b === MOVE).length;
  var movesRequired = Math.ceil((base.length - numMoves) * movesPerBody);
  for (var i in base) {
    if (numMoves <= movesRequired) break;
    if (base[i] === MOVE) {
      base[i] = null;
      numMoves -= 1;
    }
  }

  return _.filter(base, b => b != null);
}

function spawnCreep(spawn, role, energy) {
  var body = getBody(role, energy);
  var cost = getCost(body);
  if (spawn.canCreateCreep(body) === OK) {
    spawn.room.log('Spawning a ' + role + ' using ' + cost + ' energy ');
    spawn.createCreep(body, undefined, {role: role});
  }
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

  var spawnedMiner = false;

  for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    var room = spawn.room;

    var creeps = room.find(FIND_MY_CREEPS);
    var numCreeps = countRoles(room, 'harvester');
    var noCreeps = numCreeps === 0 && room.energyAvailable >= 300;
    var tooManyCreeps = numCreeps >= optimizeWorkers.getMaxCreeps(room.name);
    var maxEnergy = room.energyAvailable === room.energyCapacityAvailable;
    var usingFatCreeps = _.filter(creeps, c => c.memory.cost > room.energyCapacityAvailable).length > 0;

    var wartime = Memory.warTarget && tooManyCreeps;

    var spawnExpander = !noCreeps && countRoles(room, 'claimer') === 0 && claimer.shouldExpand(room);
    var extractors = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_EXTRACTOR
    });

    var baddies = room.find(FIND_HOSTILE_CREEPS);
    var towers = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    });

    if (baddies.length > towers.length) {
      spawnCreep(spawn, 'defender', Math.min(1500, room.energyAvailable));
    } else if (spawnExpander) {
      claimer.spawnExpander(spawn);
    } else if (wartime) {
      spawnCreep(spawn, 'attacker', Math.min(2000, room.energyAvailable));
    } else if (!tooManyCreeps && !usingFatCreeps && (maxEnergy || noCreeps)) {
      spawnCreep(spawn, 'harvester', room.energyAvailable);
    } else if (!spawnedMiner && tooManyCreeps && extractors.length > 0 && countRoles(room, 'miner') === 0) {
      spawnedMiner = true;
      var minerals = spawn.pos.findClosestByRange(FIND_MINERALS, {
        filter: m => m.mineralAmount > 0
      });
      if (minerals) {
        spawnCreep(spawn, 'miner', room.energyAvailable);
      }
    }
  }
}

module.exports = {
  run: run,
  getBody: getBody,
  getCost: getCost,
  countRoles: countRoles
};
