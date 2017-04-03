var common = {
  // @return whether we're heading in for a recharge or not
  checkLife: function(creep) {
    if (creep.ticksToLive < 200 && !creep.memory.healing) {
      creep.say('recharging');
      creep.memory.healing = true;
    }
    else if (creep.memory.healing && creep.ticksToLive > 900) {
      creep.say('healed');
      creep.memory.healing = false;
    }

    if (creep.memory.healing) {
      var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (spawn) => spawn.structureType === STRUCTURE_SPAWN
      });
      if (target) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff6700'}});
        target.renewCreep(creep);
      }
    }

    return creep.memory.healing;
  }
};

module.exports = common;
