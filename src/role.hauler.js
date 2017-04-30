var common = require('role.common');

function goHome(flag, creep) {
  var hauled = creep.carry.energy;
  var maxHauled = flag.memory.maxHauled || 0;
  flag.memory.maxHauled = Math.max(hauled, maxHauled);
  creep.memory.harvesting = false;
  creep.say('return');
}

function runCreep(creep) {
  var flag = Game.flags[creep.memory.flag];
  if (!flag) creep.memory.role = 'harvester';

  if (creep.carry.energy === 0 && !creep.memory.harvesting) {
    creep.memory.harvesting = true;
    creep.say('hauling');
  }
  if (creep.carry.energy === creep.carryCapacity && creep.memory.harvesting) {
    goHome(flag, creep);
  }

  if (creep.memory.harvesting) {
    if (creep.room.name != flag.pos.roomName) {
      common.goToRoom(creep, flag.pos.roomName);
    } else {
      var resources = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: res => res.amount > 100
      });
      resources.sort((a, b) => a.amount < b.amount);
      if (resources && resources.length > 0) {
        var resource = resources[0];
        if (creep.pickup(resource) === ERR_NOT_IN_RANGE) {
          creep.moveTo(resource);
        }
      } else if (creep.carry.energy > 0) {
        goHome(flag, creep);
      }
    }
  } else {
    if (creep.memory.base !== creep.room.name) {
      common.goToRoom(creep, creep.memory.base);
    } else {
      var dropoff = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: structure => {
          var type = structure.structureType;
          var extension = type === STRUCTURE_EXTENSION
            && structure.energy < structure.energyCapacity;
          return type === STRUCTURE_STORAGE || extension;
        }
      });
      if (dropoff) {
        if (creep.transfer(dropoff, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(dropoff);
        }
      } else {
        creep.say('dropping');
        creep.drop(RESOURCE_ENERGY);
      }
    }
  }
}

module.exports = {
  run: runCreep
};
