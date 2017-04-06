var roleClaimer = {
  /**
   * @param {Creep} creep
   */
  run: function(creep) {
    var target = creep.memory.targetRoom;
    var room = creep.room.name;
    if (!target) {
      var exits = Game.map.describeExits(room);
      for (var dir in exits) {
        target = exits[dir];
        creep.memory.targetRoom = target;
        break;
      }
    }

    if (target && room != target) {
      // not in the right place yet
      creep.say('to ' + target);
      var route = Game.map.findRoute(room, target);
      if (route.length > 0) {
        var exit = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    else if (room == target) {
      // we made it! go claim the new controller
      var controller = creep.room.controller;
      if (controller && !controller.my) {
        creep.say('claiming');
        if (creep.claimController(controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
      else {
        // room is claimed, move on to a new room
        creep.say('onwards');
        creep.memory.targetRoom = null;
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
    console.log('Spawning an expander creep');
    spawn.createCreep([WORK,CARRY,CLAIM,MOVE,MOVE,MOVE], undefined, {role: 'claimer'});
  }
};

module.exports = roleClaimer;
