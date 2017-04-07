var common = require('role.common');

var roleBuilder = {
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

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      // build if there are construction sites, otherwise upgrade controller
      var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
    else {
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (!source) {
        return creep.idle();
      }
      var success = creep.harvest(source);
      if (success === ERR_NOT_IN_RANGE || success === ERR_NOT_ENOUGH_RESOURCES) {
        var moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        if (moved === ERR_NO_PATH) creep.idle();
      }
    }
  }
};

module.exports = roleBuilder;
