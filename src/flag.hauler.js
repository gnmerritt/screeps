var spawner = require('spawn.workers');

var WORKS = 6;
var CARRIES = 20;

function makeBody(type, count) {
  var body = [];
  for (var i = 0; i < count; i++) {
    body.push(type);
  }
  for (i = 0; i < count / 2; i++) {
    body.push(MOVE);
  }
  return body;
}

function spawn(room, body, memory, name) {
  var spawns = room.find(FIND_MY_SPAWNS);
  var spawn = spawns && spawns[0];
  if (!spawn) return;
  if (spawn.canCreateCreep(body) === OK) {
    room.log('Spawning ' + name + ' for flag');
    spawn.createCreep(body, name, memory);
  }
}

function checkForAttackers(flag, room) {
  if (flag.room.find(FIND_HOSTILE_CREEPS).length === 0) {
    delete flag.memory.hostiles;
  } else {
    flag.room.log('Harvest flag: Saw hostile creep, asking for defenders');
    flag.memory.hostiles = true;
  }
}

function checkForConstruction(flag, room) {
  var noConstruction = flag.room.find(FIND_MY_CONSTRUCTION_SITES).length === 0;
  var needRepairs = flag.room.find(FIND_MY_STRUCTURES, {
    filter: s => s.hpPercent() < 30
  });
  if (noConstruction && needRepairs.length === 0) {
    delete flag.memory.construction;
  } else {
    flag.memory.construction = true;
  }
}

function checkCreeps(flag, room) {
  let creepName;
  var memory = {
    flag: flag.name, base: room.name
  };

  var defenderCreep = flag.memory.defenderName;
  var needDefender = !defenderCreep || !Game.creeps[defenderCreep];
  if (flag.memory.hostiles && needDefender) {
    creepName = "Defender_" + flag.name;
    memory.role = 'defender';
    memory.target = flag.room.name;
    var body = spawner.getBody('defender', Math.min(1500, room.energyAvailable));
    spawn(room, body, memory, creepName);
    flag.memory.defenderName = creepName;
    return;
  }

  var builder = flag.memory.builder;
  var needBuilder = !builder || !Game.creeps[builder];
  if (flag.memory.construction && needBuilder) {
    creepName = "Builder_" + flag.name;
    memory.role = 'harvester';
    memory.target = flag.room.name;
    var body = spawner.getBody('harvester', Math.min(1000, room.energyAvailable));
    spawn(room, body, memory, creepName);
    flag.memory.builder = creepName;
    return;
  }

  var harvesterCreep = flag.memory.harvesterName;
  var harvesterSize = flag.memory.harvesterSize || WORKS;
  if (!harvesterCreep || !Game.creeps[harvesterCreep]) {
    creepName = "Harvester_" + flag.name;
    memory.role = 'flagHarvester';
    spawn(room, makeBody(WORK, harvesterSize), memory, creepName);
    flag.memory.harvesterName = creepName;
    return;
  }

  var haulerCreep = flag.memory.haulerName;
  var maxHauled = flag.memory.maxHauled || 1000;
  if (!haulerCreep || !Game.creeps[haulerCreep]) {
    creepName = "Hauler_" + flag.name;
    memory.role = 'hauler';
    // look at how much we hauled last lifetime, add one extra carry body part
    var numCarries = Math.ceil(maxHauled / CARRY_CAPACITY) + 1;
    spawn(room, makeBody(CARRY, numCarries), memory, creepName);
    flag.memory.haulerName = creepName;
  }
}

function decayMaxHaul(flag) {
  if (Game.time % 3000 !== 0) return;

  var maxHauled = flag.memory.maxHauled || 0;
  maxHauled -= 100;
  maxHauled = Math.max(maxHauled, 200);
  flag.log('Decaying max haul to ' + maxHauled);
  flag.memory.maxHauled = maxHauled;
}

function resizeHarvester(flag) {
  if (Game.time % 200 !== 0) return;

  var harvesterCreep = flag.memory.harvesterName;
  var harvester = Game.creeps[harvesterCreep];
  if (!harvesterCreep || !harvester) return;

  var harvesterSize = _.filter(harvester.body, b => b.type === WORK).length;
  var idle = harvester.idlePercent();
  var allowedIdle = 100 * 1 / harvesterSize;

  if (idle > allowedIdle) {
    var newSize = Math.min(harvesterSize - 1, 3);
    flag.log('Decreasing harvester size to ' + newSize);
    flag.memory.harvesterSize = newSize;
  }
}

function run(flag, room) {
  checkForAttackers(flag, room);
  checkForConstruction(flag, room);
  checkCreeps(flag, room);
  resizeHarvester(flag);
  decayMaxHaul(flag);
}

module.exports = {
  run: run
};
