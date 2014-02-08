// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  requires: joe.MathEx.AABBmodule,

  commands: null,
  gridImage: null,
  top: 0,
  left: 0,
  panelImage: null,
  panelLeft: 0,
  panelTop: 0,

  init: function(gridImage, left, top, panelImage, panelLeft, panelTop) {
    this.gridImage = gridImage;
    this.top = top;
    this.left = left;

    this.panelImage = panelImage;
    this.panelTop = panelTop;
    this.panelLeft = panelLeft;

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
      gfx.drawImage(this.panelImage, this.panelLeft, this.panelTop);
    }
  },

  update: function(dt, gameTime) {

  },
});

