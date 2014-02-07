ccw.StatePlayClass = new joe.ClassEx({
  GAME_VIEW_WIDTH_FACTOR: 4, // Want 3 panes with wraparound, so we'll fake it with 4 panes.
  GAME_VIEW_HEIGHT_FACTOR: 1,
  SLIDE_TIME: 0.25,
},
{
  commands: null,
  gameView: null,
  playLayer: null,

  init: function(gridImage) {
    var state = this;

    this.gameView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR,
                                       joe.Graphics.getHeight() * ccw.StatePlayClass.GAME_VIEW_HEIGHT_FACTOR);

    this.playLayer = new ccw.PlayLayerClass(gridImage);
    this.gameView.addLayer(this.playLayer);
    this.gameView.setSourcePos(this.playLayer.getPaneOffsetX("CENTER"), 0);
    joe.Scene.addView(this.gameView);

    this.commands = {
                      mouseUp: function(x, y) {
                        state.slideLayerRight();
                      },

                      touchDown: function(id, x, y) {
                        state.slideLayerRight();
                      }
                    };
  },

  slideLayerLeft: function() {
    var viewRect = null,
        newViewX = 0,
        newViewY = 0;

    joe.assert(this.gameView, ccw.STRINGS.ASSERT_INVALID_GAME_VIEW);

    viewRect = this.gameView.getSourceRect();
    newViewX = viewRect.x - joe.Graphics.getWidth();

    if (newViewX < 0) {
      // Wrap around.
      newViewX += joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR;

      // Snap to the wraparound frame.
      this.gameView.setSourcePos(newViewX, viewRect.y);
      newViewX -= joe.Graphics.getWidth();
    }

    this.gameView.setSourceTransition(newViewX, viewRect.y, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  slideLayerRight: function() {
    var viewRect = null,
        newViewX = 0,
        newViewY = 0;

    joe.assert(this.gameView, ccw.STRINGS.ASSERT_INVALID_GAME_VIEW);

    viewRect = this.gameView.getSourceRect();
    newViewX = viewRect.x + joe.Graphics.getWidth();

    if (newViewX > joe.Graphics.getWidth() * (ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR - 1)) {
      // Wrap around.
      newViewX = 0;

      // Snap to the wraparound frame.
      this.gameView.setSourcePos(newViewX, viewRect.y);
      newViewX += joe.Graphics.getWidth();
    }

    this.gameView.setSourceTransition(newViewX, viewRect.y, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
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

