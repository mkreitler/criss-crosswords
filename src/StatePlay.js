ccw.StatePlayClass = new joe.ClassEx({
},
{
  commands: null,

  init: function() {
    this.commands = {
      mouseUp: function(x, y) {
      },

      touchDown: function(id, x, y) {
      }
    }
  },

  enter: function() {
  },

  exit: function() {
  },

  draw: function(gfx) {
    joe.Graphics.clearToColor("#FFFFFF");
  },

  update: function(dt, gameTime) {

  },
});

