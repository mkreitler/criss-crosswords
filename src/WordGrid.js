// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  commands: null,
  gridImage: null,
  top: 0,
  left: 0,

  init: function(gridImage) {
    this.gridImage = gridImage;
    this.top = (joe.Graphics.getWidth() - this.gridImage.width) * 0.5;
    this.left = joe.Graphics.getWidth() * 0.5 - this.gridImage.width * 0.5;
  },

  enter: function() {
  },

  exit: function() {
  },

  draw: function(gfx) {
    if (this.gridImage) {

      gfx.drawImage(this.gridImage, this.left, this.top);
    }
  },

  update: function(dt, gameTime) {

  },
});

