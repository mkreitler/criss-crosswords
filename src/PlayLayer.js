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
  responders: [],
  labels: [],
  newLabel: null,
  bDirty: true,

  init: function(gridImage, panelImage) {
    var midPane = joe.Graphics.getWidth() * 0.5,
        curY = 0,
        i = 0,
        x = 0,
        y = 0,
        topMargin = 0,
        highlightImage = null,
        panelOffsets = [];

    topMargin = (joe.Graphics.getWidth() - gridImage.width) * 0.5;

    // Layout the layer: down clues, up clues, grid, down clues (repeat for wraparound).
    // LEFT PANE: -------------------------------------------------------------
    // "Down Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, null, 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[0], joe.Graphics.getHeight() - topMargin - img.height);
    }});

    // CENTER PANE: -----------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // The word grid.
    this.wordGrid = new ccw.WordGridClass(gridImage,
                                          midPane - gridImage.width * 0.5,
                                          topMargin,
                                          panelImage,
                                          midPane - ccw.game.getImage("PANEL_CENTER").width * 0.5,
                                          topMargin * 2 + gridImage.height);
    this.widgets.push(this.wordGrid);

    // The help button.
    highlightImage = ccw.game.getImage("HIGHLIGHT_CIRCLE");
    x = midPane - highlightImage.width * 0.5;
    y = joe.Graphics.getHeight() - 64;
    this.widgets.push(new joe.GUI.HighlightBox(x, y,
                      highlightImage.width,
                      highlightImage.width,
                      highlightImage,
                      null));
    this.responders.push(this.widgets[this.widgets.length - 1]);


    // RIGHT PANE: ------------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();

    // "Up Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    this.widgets.push(new joe.GUI.Label(ccw.STRINGS.UP_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      this.widgets.push(new joe.GUI.Label(ccw.STRINGS.UP_CLUES[i].clue, ccw.game.sysFont, midPane, curY, null, 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_RIGHT").width * 0.5)
    this.widgets.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_RIGHT");

      gfx.drawImage(img, panelOffsets[1], joe.Graphics.getHeight() - topMargin - img.height);
    }});

    // WRAPAROUND PANE: -------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // "Down clue" label.
    this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      this.widgets.push(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, null, 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + this.widgets[this.widgets.length - 1].AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.widgets.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[2], joe.Graphics.getHeight() - topMargin - img.height);
    }});
  },

  getPaneOffsetX: function(paneKey) {
    return this.paneOffsetX[ccw.PlayLayerClass.PANES[paneKey]];
  },

  drawClipped: function(gfx, srcRect, scale) {
    var i = 0;

    if (this.bDirty) {
      joe.assert(gfx && srcRect, joe.Strings.ASSERT_INVALID_ARGS);

      joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR, gfx)

      gfx.save();

      scale = scale || 1;
      if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
        gfx.scale(scale, scale);
      }

      // Check all widgets against the clipping rectangle.
      for (i=this.widgets.length-1; i>=0; --i) {
        this.widgets[i].draw(gfx, 0, 0);
      }

      gfx.restore();

      this.bDirty = false;
    }

    for (i=this.responders.length-1; i>=0; --i) {
      this.responders[i].draw(gfx, 0, 0);
    }
  }
});

