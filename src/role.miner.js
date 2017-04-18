var common = require('role.common');

function run(creep) {
  var carrying = _.sum(creep.carry);
  if (carrying === 0 && !creep.memory.harvesting) {
    creep.memory.harvesting = true;
    creep.say('mining');
  }
  if (carrying === creep.carryCapacity && creep.memory.harvesting) {
    creep.memory.harvesting = false;
  }

  if (creep.memory.harvesting) {
    var minerals = creep.pos.findClosestByPath(FIND_MINERALS);
    var harvested = creep.harvest(minerals);
    if (harvested === ERR_NOT_IN_RANGE) {
      creep.moveTo(minerals);
    }
  } else {
    var dropoff = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_STORAGE
    });
    if (!dropoff) {
      creep.say('no storage');
      return;
    }
    for (var type in creep.carry) {
      if (creep.carry[type] <= 0) continue;
      if (creep.transfer(dropoff, type) === ERR_NOT_IN_RANGE) {
        creep.moveTo(dropoff);
      }
    }
  }
}

module.exports = {
  run: run
};
