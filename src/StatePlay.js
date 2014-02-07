ccw.StatePlayClass = new joe.ClassEx({
  GAME_VIEW_WIDTH_FACTOR: 4, // Want 3 panes with wraparound, so we'll fake it with 4 panes.
  GAME_VIEW_HEIGHT_FACTOR: 1,
},
{
  commands: null,
  gameView: null,
  playLayer: null,

  init: function(gridImage) {
    this.gameView = new joe.Scene.View(joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR,
                                       joe.Graphics.getHeight() * ccw.StatePlayClass.GAME_VIEW_HEIGHT_FACTOR,
                                       joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight());

    this.playLayer = new ccw.PlayLayerClass(gridImage);
    this.gameView.addLayer(this.playLayer);
    this.gameView.setSourcePos(this.playLayer.getPaneOffsetX("LEFT"), 0);
    joe.Scene.addView(this.gameView);

    this.commands = ccw.StatePlayClass.commands;
  },

  enter: function() {
  },

  exit: function() {
  },

  draw: function(gfx) {
    joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR);

    joe.Scene.draw(gfx);
  },

  update: function(dt, gameTime) {

  },
});

ccw.StatePlayClass.commands = {
  mouseUp: function(x, y) {
  },

  touchDown: function(id, x, y) {
  }
};

