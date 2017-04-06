var spawn = require('spawn.workers');

var RATE = 5;

/**
 * Writes into memory if this room needs workers to be sent to it
 */
function roomNeedsWorker(room) {
  if (Game.time % RATE != 0) return;

  var spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length) {
    setNeedsWorker(room, false);
  }
  var underConstruction = room.find(FIND_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType == STRUCTURE_SPAWN
  });
  if (!underConstruction.length) {
    setNeedsWorker(room, false);
  }
  var creeps = room.find(FIND_MY_CREEPS).length;
  setNeedsWorker(room, creeps === 0);
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

    var builders = room.find(FIND_MY_CREEPS, {
      filter: (creep) => creep.memory.role === 'builder'
    });
    var alreadySent = _.filter(builders, c => c.memory.target);
    if (builders.length === 0 || alreadySent.length > 0) continue;

    var toSend = builders[0];
    console.log('Sending builder ' + toSend.name + ' from ' + room.name + ' to ' + name);
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
