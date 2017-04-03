var memory = {
  cleanup: function() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        console.log('cleaning up "' + name + '"');
        delete Memory.creeps[name];
      }
    }
  }
};

module.exports = memory;
