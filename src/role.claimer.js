var roleClaimer = {
  /**
   * @param {Creep} creep
   */
  run: function(creep) {
    // TODO: find target room automatically
    var target = creep.memory.targetRoom;
    if (target && creep.room.name != target) {
      creep.say('to ' + target);
      var route = Game.map.findRoute(creep.room, target);
      if (route.length > 0) {
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    else if (creep.room.name == target) {
      if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
  }
};

module.exports = roleClaimer;
