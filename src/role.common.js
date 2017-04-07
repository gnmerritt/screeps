var common = {
  goToRoom: function(creep, name) {
    var room = creep.room.name;
    var route = Game.map.findRoute(room, name);
    if (route.length > 0) {
      var exit = creep.pos.findClosestByRange(route[0].exit);
      creep.moveTo(exit, {reusePath: 20, visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }
};

module.exports = common;
