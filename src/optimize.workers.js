var IDLE_RATE = 300;
var RATE = 10;
var CREEP_LIFETIME_CYCLES = CREEP_LIFE_TIME / ENERGY_REGEN_TIME;

function initMemory() {
  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  for (var room in Game.rooms) {
    if (!Memory.rooms[room]) {
      var defaults = {
        maxCreeps: 7
      };
      Memory.rooms[room] = defaults;
    }
  }
}

function checkIdle() {
  for (var name in Game.rooms) {
    var room = Game.rooms[name];
    var creeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === 'harvester'
    });
    var idle = 0;
    for (var creep of creeps) {
      idle += creep.idlePercent();
      creep.resetIdle();
    }
    var numCreeps = creeps.length
    idle = idle / numCreeps;

    // Was the equivalent of an entire creep idle this cycle?
    if (idle * numCreeps > 100) {
      room.log('Creeps idle, decreasing. Saw ' + idle + '% * ' + numCreeps + ' = ' + (idle * numCreeps));
      Memory.rooms[name].maxCreeps = numCreeps - 1;
    }
  }
}

function creepCost(room) {
  var creeps = room.find(FIND_MY_CREEPS, {
    filter: c => c.memory.role === 'harvester'
  });
  var cost = room.energyCapacityAvailable;
  for (var creep of creeps) {
    cost = Math.max(cost, creep.memory.cost);
  }
  return cost;
}

function checkEnergy() {
  if (Game.time % IDLE_RATE == 0) {
    checkIdle();
  }
  if (Game.time % RATE != 0) {
    return;
  }
  for (var name in Game.rooms) {
    var room = Game.rooms[name];
    if (room.find(FIND_MY_SPAWNS).length === 0) continue;
    var sources = room.find(FIND_SOURCES);
    var unharvestedEnergy = 0;

    for (var source of sources) {
      var energy = source.energy;
      var toRegen = source.ticksToRegeneration;

      // if a source is about to regen, see if it has wasted energy
      if (toRegen <= RATE) {
        unharvestedEnergy += energy;
      }
    }

    // make adjustments if necessary
    var creepCostPerCycle = creepCost(room) / CREEP_LIFETIME_CYCLES;
    if (unharvestedEnergy > 2 * creepCostPerCycle) {
      room.log('Too much wasted energy, increasing creeps. Saw ' + unharvestedEnergy + '/' + creepCostPerCycle);
      var numCreeps = room.find(FIND_MY_CREEPS, {
        filter: c => c.memory.role === 'harvester'
      }).length;
      Memory.rooms[name].maxCreeps = numCreeps + 1;
    }
  }
}

function getMaxCreeps(roomName) {
  return Math.max(2, Memory.rooms[roomName].maxCreeps);
}

module.exports = {
  initMemory: initMemory,
  checkEnergy: checkEnergy,
  getMaxCreeps: getMaxCreeps
};
