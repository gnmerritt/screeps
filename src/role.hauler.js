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
      var resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: res => res.amount >= creep.carryCapacity
      });
      if (!resource) {
        var resources = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: res => res.amount > 100
        });
        resources.sort((a, b) => a.amount < b.amount);
        if (resources && resources.length > 0) {
          resource = resources[0];
        }
      }
      if (resource) {
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
          var extension = (type === STRUCTURE_EXTENSION || type === STRUCTURE_SPAWN)
            && structure.energy < structure.energyCapacity;
          var storage = type === STRUCTURE_STORAGE && _.sum(structure.store) < STORAGE_CAPACITY * 0.95;
          return storage || extension;
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
