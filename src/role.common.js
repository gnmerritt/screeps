function pathToRoom(creep, name) {
  let from = new RoomPosition(creep.pos.x, creep.pos.y, creep.room.name);

  // Use `findRoute` to calculate a high-level plan for this path,
  // prioritizing highways and owned rooms
  let allowedRooms = { [ from.roomName ]: true };
  Game.map.findRoute(from.roomName, name, {
    routeCallback(roomName) {
      let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
      let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
      let isMyRoom = Game.rooms[roomName] &&
        Game.rooms[roomName].controller &&
        Game.rooms[roomName].controller.my;
      if (isHighway || isMyRoom) {
        return 1;
      } else {
        return 2.5;
      }
    }
  }).forEach(function(info) {
    allowedRooms[info.room] = true;
  });

  let goals = [{ pos: new RoomPosition(25, 25, name), range: 20 }];

  // Invoke PathFinder, allowing access only to rooms from `findRoute`
  return PathFinder.search(from, goals, {
    roomCallback(roomName) {
      if (allowedRooms[roomName] === undefined) {
        return false;
      }
    }
  });
}

var common = {
  goToRoom: function(creep, name) {
    PathFinder.use(true);
    var room = creep.room.name;
    var route = pathToRoom(creep, name);

    if (route && route.path) {
      creep.moveByPath(route.path);
    } else {
      creep.say('no path');
    }
  }
};

module.exports = common;
