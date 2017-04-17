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

function checkCreeps(flag, room) {
  let creepName;
  var memory = {
    flag: flag.name, base: room.name
  };

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

function resizeHarvester(flag) {
  if (Game.time % 200 !== 0) return;

  var harvesterCreep = flag.memory.harvesterName;
  var harvester = Game.creeps[harvesterCreep];
  if (!harvesterCreep || !harvester) return;

  var harvesterSize = _.filter(harvester.body, b => b.type === WORK).length;
  var idle = harvester.idlePercent();
  var allowedIdle = 100 * 1 / harvesterSize;

  if (idle > allowedIdle) {
    var newSize = harvesterSize - 1;
    flag.log('Decreasing harvester size to ' + newSize);
    flag.memory.harvesterSize = newSize;
  }
}

function run(flag, room) {
  checkCreeps(flag, room);
  resizeHarvester(flag);
}

module.exports = {
  run: run
};
