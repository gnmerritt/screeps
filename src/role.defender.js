var common = require('role.common');

function runCreep(creep) {
  var enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (enemy) {
    if (creep.attack(enemy) === ERR_NOT_IN_RANGE) {
      creep.moveTo(enemy.pos, {visualizePathStyle: {stroke: '#ff0000'}});
    }
    return;
  }

  if (creep.memory.target && creep.room.name !== creep.memory.target) {
    common.goToRoom(creep, creep.memory.target);
  }
}

module.exports = {
  run: runCreep
}
