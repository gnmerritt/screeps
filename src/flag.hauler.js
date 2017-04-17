var HARVESTER_BODY = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];

var CARRIES = 20;

function haulerBody() {
  var body = [];
  for (var i = 0; i < CARRIES; i++) {
    body.push(CARRY);
  }
  for (i = 0; i < CARRIES / 2; i++) {
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
  if (!harvesterCreep || !Game.creeps[harvesterCreep]) {
    creepName = "Harvester_" + flag.name;
    memory.role = 'flagHarvester';
    spawn(room, HARVESTER_BODY, memory, creepName);
    flag.memory.harvesterName = creepName;
    return;
  }

  var haulerCreep = flag.memory.haulerName;
  if (!haulerCreep || !Game.creeps[haulerCreep]) {
    creepName = "Hauler_" + flag.name;
    memory.role = 'hauler';
    spawn(room, haulerBody(), memory, creepName);
    flag.memory.haulerName = creepName;
  }
}

function run(flag, room) {
  checkCreeps(flag, room);
}

module.exports = {
  run: run
};
