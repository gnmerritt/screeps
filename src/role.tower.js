function runTower(room) {
  var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
  for (var i in towers) {
    var tower = towers[i];
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }

    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        var type = structure.structureType;
        if (type === STRUCTURE_WALL || type === STRUCTURE_RAMPART) {
          return structure.hits < 15000;
        }
        return structure.hits < structure.hitsMax
      }
    });
    if (!closestHostile && closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }
  }
}

var towers = {
  run: function() {
    for (var name in Game.rooms) {
      var room = Game.rooms[name];
      runTower(room);
    }
  }
};

module.exports = towers;
