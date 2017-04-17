var common = require('role.common');

function runCreep(creep) {
  var flag = Game.flags[creep.memory.flag];
  if (!flag) creep.memory.role = 'harvester';

  if (creep.carry.energy === 0 && !creep.memory.harvesting) {
    creep.memory.harvesting = true;
    creep.say('hauling');
  }
  if (creep.carry.energy === creep.carryCapacity && creep.memory.harvesting) {
    creep.memory.harvesting = false;
    creep.say('return');
  }

  if (creep.memory.harvesting) {
    if (creep.room.name != flag.pos.roomName) {
      common.goToRoom(creep, flag.pos.roomName);
    } else {
      var resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: res => res.amount > 100
      });
      if (resource) {
        if (creep.pickup(resource) === ERR_NOT_IN_RANGE) {
          creep.moveTo(resource);
        }
      } else if (creep.carry.energy > 0) {
        creep.memory.harvesting = false;
      }
    }
  } else {
    if (creep.memory.base !== creep.room.name) {
      common.goToRoom(creep, creep.memory.base);
    } else {
      var dropoff = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_STORAGE
      });
      if (dropoff) {
        if (creep.transfer(dropoff, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(dropoff);
        }
      }
    }
  }
}

module.exports = {
  run: runCreep
};
