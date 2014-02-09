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

  mouseDown: function(x, y, commands) {
    if (commands) {
      commands.startGesture(x, y);
    }
    
    return true;
  },

  mouseDrag: function(x, y, commands) {
    var dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (commands) {
      dragType = commands.checkDrag(x, y);

      switch(dragType) {
        case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
        case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
          commands.executeDrag(dragType);
        break;

        case ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT:
        break;

        case ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT:
        break;
      }
    }

    return true;
  },

  mouseUp: function(x, y, commands) {
    return true;
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

