var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }
        // creep.say('⚡ upgrade');

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
            var success = creep.harvest(source);
            if (success === ERR_NOT_IN_RANGE || success === ERR_NOT_ENOUGH_RESOURCES) {
              creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleBuilder;
