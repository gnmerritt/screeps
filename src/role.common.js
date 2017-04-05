var spawn = require('spawn.workers');

var common = {
  // @return whether we're heading in for a recharge or not
  checkLife: function(creep) {
    if (!creep.memory.cost) {
      var body = _.map(creep.body, b => b.type);
      creep.memory.cost = spawn.getCost(body);
    }
    // only heal creeps that are higher than the current RCL
    var shouldHeal = creep.ticksToLive < 200
      && creep.memory.cost > creep.room.energyCapacityAvailable;
    if (shouldHeal && !creep.memory.healing) {
      creep.say('recharging');
      creep.memory.healing = true;
    }
    else if (creep.memory.healing && creep.ticksToLive > 600) {
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
