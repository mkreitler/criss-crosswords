ccw.PlayLayerClass = new joe.ClassEx({
  PANES: {LEFT: 0,
          CENTER: 1,
          RIGHT: 2,
          LEFT_REPEAT: 3},

  VERTICAL_SPACING: 64,
  MAX_WIDTH: joe.Graphics.getWidth() * 0.9,
},
{
  requires: joe.Scene.LayerInterface,

  wordGrid: null,
  paneIndex: 0, // Corresponds to PANES.CENTER
  widgets: [],
  paneOffsetX: [],
  newLabel: null,
  bDirty: true,

  init: function(gridImage) {
    var midPane = joe.Graphics.getWidth() * 0.5,
        curY = 0,
        i = 0;

    this.wordGrid = new ccw.WordGridClass(gridImage);

    // Layout the layer: down clues, up clues, grid, down clues (repeat for wraparound).
    // LEFT PANE:
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;

    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, null, 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;
    }

    // CENTER PANE:
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // RIGHT PANE:
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // WRAPAROUND PANE:
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // Set the starting pane.
  },

  getPaneOffsetX: function(paneKey) {
    return this.paneOffsetX[ccw.PlayLayerClass.PANES[paneKey]];
  },

  drawClipped: function(gfx, srcRect, scale) {
    var i = 0;

    if (this.bDirty) {
      joe.assert(gfx && srcRect, joe.Strings.ASSERT_INVALID_ARGS);

      joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR)

      gfx.save();

      scale = scale || 1;
      if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
        gfx.scale(scale, scale);
      }

      // Check all widgets against the clipping rectangle.
      for (i=this.widgets.length-1; i>=0; --i) {
        if (joe.MathEx.clip(this.widgets[i].AABBgetRef(), srcRect)) {
          this.widgets[i].draw(gfx, 0, 0);
        }
      }

      gfx.restore();

      this.bDirty = false;
    }
  }
});

