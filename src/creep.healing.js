var spawn = require('spawn.workers');
var optimize = require('optimize.workers');

// @return whether we're heading in for a recharge or not
function checkLife(creep) {
  if (!creep.memory.cost) {
    var body = _.map(creep.body, b => b.type);
    creep.memory.cost = spawn.getCost(body);
  }
  // only heal creeps that are higher than the current RCL
  var room = creep.room;
  var shouldHeal = creep.ticksToLive < 200
    && creep.memory.cost > room.energyCapacityAvailable
    && room.energyAvailable > 100
    && room.find(FIND_MY_SPAWNS).length > 0
    && spawn.countRoles(room, 'harvester') <= optimize.getMaxCreeps(room.name);

  if (shouldHeal && !creep.memory.healing) {
    creep.say('recharging');
    creep.memory.healing = true;
  }
  else if (creep.memory.healing && (!shouldHeal || creep.ticksToLive > 600)) {
    creep.say('healed');
    delete creep.memory.healing;
  }

  if (creep.memory.healing) {
    var target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    if (target) {
      creep.idle(); // healing counts as idle time
      creep.moveTo(target, {visualizePathStyle: {stroke: '#ff6700'}});
      creep.transfer(target, RESOURCE_ENERGY);
      target.renewCreep(creep);
    }
  }

  return creep.memory.healing;
}

module.exports = {
  checkLife: checkLife
};
