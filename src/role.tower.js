function runTower(room) {
  var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
  for (var i in towers) {
    var tower = towers[i];
    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }

    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
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
