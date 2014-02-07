// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  requires: joe.MathEx.AABBmodule,

  commands: null,
  gridImage: null,
  top: 0,
  left: 0,

  init: function(gridImage, left, top) {
    this.gridImage = gridImage;
    this.top = top;
    this.left = left;

    this.bounds.x = left;
    this.bounds.y = top;
    this.bounds.width = gridImage.width;
    this.bounds.height = gridImage.height;
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

