var common = require('role.common');

var roleClaimer = {
  /**
   * @param {Creep} creep
   */
  run: function(creep) {
    var target = Memory.nextClaim;
    var room = creep.room.name;

    if (target && room != target) {
      // not in the right place yet
      common.goToRoom(creep, target);
    }
    else if (room == target) {
      // we made it! go claim the new controller
      var controller = creep.room.controller;
      if (controller) {
        var success = creep.claimController(controller);
        if (success === ERR_GCL_NOT_ENOUGH) {
          creep.say('reserving');
          success = creep.reserveController(controller);
        }
        if (success === ERR_NOT_IN_RANGE) {
          creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
      else {
        // no controller, something is broken
        creep.say('no controller');
        Memory.nextClaim = null;
      }
    }
  },

  shouldExpand: function(thisRoom) {
    if (Game.gcl.level == 1 || thisRoom.controller.level < 5) {
      return false;
    }
    var myControllers = 0;
    for (var name in Game.rooms) {
      var room = Game.rooms[name];
      if (room.controller && room.controller.my) {
        myControllers += 1;
      }
    }
    return myControllers < Game.gcl.level;
  },

  spawnExpander: function(spawn) {
    spawn.room.log('Spawning an expander creep');
    var body = [CLAIM, MOVE];
    if (spawn.room.energyCapacityAvailable >= 1300) {
      body = [CLAIM, CLAIM, MOVE, MOVE];
    }
    spawn.createCreep(body, undefined, {role: 'claimer'});
  }
};

module.exports = roleClaimer;
