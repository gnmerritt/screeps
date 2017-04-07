var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
      delete creep.memory.harvesting;
      creep.say('depositing');
    }
    if (!creep.memory.harvesting && creep.carry.energy === 0) {
      delete creep.memory.upgrading;
      delete creep.memory.building;
      creep.memory.harvesting = true;
      creep.say('🔄 harvest');
    }
    if (creep.memory.building) {
      var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
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
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (!source) {
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
            return (type == STRUCTURE_EXTENSION || type == STRUCTURE_SPAWN || type == STRUCTURE_TOWER)
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
      target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
      }
      if (target) {
        creep.say('building');
        creep.memory.building = true;
      } else { // finally, go upgrade the controller
        creep.say('upgrading');
        creep.memory.upgrading = true;
      }
    }
  }
};

module.exports = roleHarvester;
