var common = require('role.common');

var attacker = {
    run: function(creep) {
      if (Memory.warTarget) {
        creep.memory.target = Memory.warTarget;
        if (creep.memory.target === creep.room.name) {
          delete creep.memory.target;
        } else {
          common.goToRoom(creep, creep.memory.target);
          return;
        }
      }

      var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: (structure) => {
            var type = structure.structureType;
            return type !== STRUCTURE_ROAD && type !== STRUCTURE_CONTROLLER;
          }
        });
      }

      if (target) {
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ff0000'}});
        }
      } else {
        delete Memory.warTarget;
      }
    }
};

module.exports = attacker;
