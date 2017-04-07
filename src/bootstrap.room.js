var spawn = require('spawn.workers');
var optimize = require('optimize.workers');

var RATE = 5;

/**
 * Writes into memory if this room needs workers to be sent to it
 */
function roomNeedsWorker(room) {
  if (Game.time % RATE != 0) return;

  var spawns = room.find(FIND_MY_SPAWNS).length;
  var underConstruction = room.find(FIND_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType == STRUCTURE_SPAWN
  }).length;
  // don't send helpers to rooms without at least a spawn construction site
  if (!underConstruction && !spawns) {
    setNeedsWorker(room, false);
  }
  // how many creeps from higher leveled rooms are in this room
  var fatCreeps = room.find(FIND_MY_CREEPS, {
    filter: creep => creep.memory.cost > room.energyCapacityAvailable
  });
  setNeedsWorker(room, fatCreeps.length < optimize.getMaxCreeps(room.name));
}

function setNeedsWorker(room, status) {
  if (!Memory.needsWorkers) {
    Memory.needsWorkers = {};
  }
  Memory.needsWorkers[room.name] = status;
}

function maybeSendWorker(room) {
  if (Game.time % RATE != 0) return;

  for (var name in Memory.needsWorkers) {
    if (!Memory.needsWorkers[name] || name === room.name) continue;
    var target = Game.rooms[name];
    if (room.controller.level <= target.controller.level) continue;

    var workers = room.find(FIND_MY_CREEPS, {
      filter: (creep) => creep.memory.role === 'harvester'
    });
    var alreadySent = _.filter(workers, c => c.memory.target);
    if (workers.length === 0 || alreadySent.length > 0) continue;

    var toSend = workers[0];
    room.log('Sending builder ' + toSend.name + ' from ' + room.name + ' to ' + name);
    toSend.memory.target = name;
  }
}

function checkBootstrap() {
  for (var name in Game.rooms) {
    var room = Game.rooms[name];
    roomNeedsWorker(room);
    maybeSendWorker(room);
  }
}

module.exports = {
  checkBootstrap: checkBootstrap
}
