var RATE = 10;

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

function checkEnergy() {
  if (Game.time % RATE != 0) {
    return;
  }
  for (var name in Game.rooms) {
    var room = Game.rooms[name];
    var sources = room.find(FIND_SOURCES);
    var wastedEnergy = 0;
    var wastedTicks = 999;

    for (var source of sources) {
      var energy = source.energy;
      var toRegen = source.ticksToRegeneration;

      // if a source is about to regen, see if it has wasted energy
      if (toRegen <= RATE) {
        wastedEnergy += energy;
      }
      // if a source has energy we haven't wasted any ticks
      if (energy > 0) {
        wastedTicks = 0;
      } else if (energy === 0) {
        wastedTicks = Math.min(wastedTicks, toRegen);
      }
    }
    room.log('Optimizer ran: wasted ticks = ' + wastedTicks + ' and energy = ' + wastedEnergy);

    // make adjustments if necessary
    var numCreeps = room.find(FIND_MY_CREEPS).length;
    if (wastedEnergy > 500) {
      room.log('Too much wasted energy, increasing creeps. Saw ' + wastedEnergy);
      Memory.rooms[name].maxCreeps = numCreeps + 1;
    } else if (wastedTicks > 50) {
      room.log('Too many wasted ticks, decreasing creeps. Saw ' + wastedTicks);
      Memory.rooms[name].maxCreeps = numCreeps - 1;
    }
  }
}

function getMaxCreeps(roomName) {
  return Memory.rooms[roomName].maxCreeps;
}

module.exports = {
  initMemory: initMemory,
  checkEnergy: checkEnergy,
  getMaxCreeps: getMaxCreeps
};
