var common = require('role.common');

var STORAGE_MIN = 250000; // don't take energy from storage below this level
var STORAGE_MAX = 350000; // prefer storage above this level

var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.target) {
      if (creep.memory.target === creep.room.name) {
        delete creep.memory.target;
        creep.say('arrived');
      } else {
        common.goToRoom(creep, creep.memory.target);
        return;
      }
    }

    var harvesting = creep.memory.harvesting;

    // get the RCL up to 2 as quickly as possible to keep from losing the room
    var needControllerUpgrade = creep.room.controller
      && creep.room.controller.my
      && creep.room.controller.level < 2;
    if (!harvesting && needControllerUpgrade) {
      creep.memory.upgrading = true;
    }

    if (harvesting && creep.carry.energy === creep.carryCapacity) {
      delete creep.memory.harvesting;
      delete creep.memory.storage;
      creep.say('depositing');
    }
    if (!harvesting && creep.carry.energy === 0) {
      delete creep.memory.upgrading;
      delete creep.memory.building;
      creep.memory.harvesting = true;

      var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_STORAGE
          && structure.store[RESOURCE_ENERGY] > STORAGE_MIN
      });
      var storageTweak = Game.time % 3 === 0;
      if (storage && storage.store[RESOURCE_ENERGY] > STORAGE_MAX && storageTweak) {
        creep.say('storage');
        creep.memory.storage = true;
      } else {
        creep.say('🔄 harvest');
      }
    }
    if (creep.memory.building) {
      var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return;
      } else {
        creep.memory.building = false;
      }
    }
    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
      }
      return;
    }

    if (creep.memory.harvesting) {
      if (creep.ticksToLive < 20) {
        creep.say('old!');
        delete creep.memory.harvesting;
      }
      if (creep.memory.storage) {
        var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: structure => structure.structureType === STRUCTURE_STORAGE
            && structure.store[RESOURCE_ENERGY] > STORAGE_MIN
        });
        var space = creep.carryCapacity - _.sum(creep.carry);
        if (creep.withdraw(storage, RESOURCE_ENERGY, space) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage, {visualizePathStyle: {stroke: '#ff0000'}});
        }
        return;
      }

      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (!source) {
        if (creep.carry.energy > 0) {
          // do something with the energy we have so far
          delete creep.memory.harvesting;
        } else {
          // move towards the next-to-regen energy source
          var sources = creep.room.find(FIND_SOURCES);
          sources.sort((a, b) => a.ticksToRegeneration > b.ticksToRegeneration);
          creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ff0000'}});
        }
        return creep.idle();
      }
      var success = creep.harvest(source);
      if (success === ERR_NOT_IN_RANGE || success === ERR_NOT_ENOUGH_RESOURCES) {
        var moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        if (moved === ERR_NO_PATH) creep.idle();
      }
    } else {
      var target;
      if (creep.room.find(FIND_MY_CREEPS).length > 3) {
        // prioritize an empty tower over harvesting to make new creeps
          target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (structure) => structure.structureType === STRUCTURE_TOWER && structure.energy < 200
        });
      }
      // otherwise, deposit energy into the nearest empty spawn/extension/tower
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (structure) => {
            var type = structure.structureType;
            if (type == STRUCTURE_TOWER) {
              return structure.energy < 900;
            }
            return (type == STRUCTURE_EXTENSION || type == STRUCTURE_SPAWN)
               && structure.energy < structure.energyCapacity;
          }
        });
      }
      // give energy to the thing we found
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return;
      }
      // otherwise, construct any pending buildings
      target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if (target) {
        creep.say('building');
        creep.memory.building = true;
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return;
      }
      // usually towers will handle repairs, but as a fall back check here
      var repair = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: s => {
          var type = s.structureType;
          return s.hpPercent() < 80 &&
            type !== STRUCTURE_WALL && type !== STRUCTURE_RAMPART;
        }
      });
      if (repair) {
        if (creep.repair(repair) == ERR_NOT_IN_RANGE) {
          creep.moveTo(repair, {visualizePathStyle: {stroke: '#00ffff'}});
        }
      } else { // finally, go upgrade the controller
        creep.say('upgrading');
        creep.memory.upgrading = true;
      }
    }
  }
};

module.exports = roleHarvester;
