var hauler = require('flag.hauler');

var ROLES = {
  hauler: hauler
};

/**
 * Return a map of flags by room name for any flags that need room code
 */
function associateFlags() {
  var flagsByRoom = {};
  for (var name in Game.flags) {
    var flag = Game.flags[name];
    var room = flag.memory.room;
    if (room) {
      var roomsFlags = flagsByRoom[room] || [];
      roomsFlags.push(name);
      flagsByRoom[room] = roomsFlags;
    }
  }
  return flagsByRoom;
}

function runFlag(flagName, room) {
  var flag = Game.flags[flagName];
  if (!flag) {
    console.log('Invalid flag name ' + flagName);
    return;
  }

  var roleName = flag.memory && flag.memory.role;
  var role = ROLES[roleName];
  if (role && role.run) role.run(flag, room);
}

function run() {
  if (Game.time % 10 !== 0) {
    return;
  }

  var flagsByRoom = associateFlags();
  for (var roomName in flagsByRoom) {
    var room = Game.rooms[roomName];
    var flags = flagsByRoom[roomName];

    for (var flag of flags) {
      runFlag(flag, room);
    }
  }
}

module.exports = {
  run: run
};
