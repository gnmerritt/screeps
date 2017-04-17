var common = require('role.common');

function run(creep) {
  var flag = Game.flags[creep.memory.flag];
  if (!flag) return;

  if (creep.room.name !== flag.pos.roomName) {
    creep.say('travelling');
    common.goToRoom(creep, flag.pos.roomName);
    return;
  }

  var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (source) {
    var success = creep.harvest(source);
    if (success === ERR_NOT_IN_RANGE || success === ERR_NOT_ENOUGH_RESOURCES) {
      creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  } else {
    // move towards the next-to-regen energy source
    var sources = creep.room.find(FIND_SOURCES);
    sources.sort((a, b) => a.ticksToRegeneration > b.ticksToRegeneration);
    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ff0000'}});
  }
}

module.exports = {
  run: run
};
