// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.HelpLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
  OFFSETS_Y: {topMargin: 145, spacing: 25},

  BUTTON_HIGHLIGHTS: [
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_SMALL"
  ],
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        curY = ccw.HelpLayerClass.OFFSETS_Y.topMargin,
        widgets = [];

    this.backImage = ccw.game.getImage("HELP");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;

    this.guiManager = new joe.GuiClass();
    this.guiManager.setClipRect();

    for (i=0; i<ccw.HelpLayerClass.BUTTON_HIGHLIGHTS.length; ++i) {
      highlightImage = ccw.game.getImage(ccw.HelpLayerClass.BUTTON_HIGHLIGHTS[i]);

      widgets.push(this.guiManager.addWidget(new joe.GUI.HighlightBox(Math.round(xMid - highlightImage.width * 0.5),
                                             curY,
                                             highlightImage.width,
                                             highlightImage.height,
                                             highlightImage,
                                             null),
                                             true));
      curY += ccw.HelpLayerClass.OFFSETS_Y.spacing + highlightImage.height;
    }

    // HACK: Set the input callbacks manually. Setting them in the above
    // loop fails because the closure only retains the final value of 'i',
    // meaning all widgets execute the "hideHelp" function.
    widgets[0].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.showInstructions(); return true; },
                                        touchUp: function(id, x, y) {commands.showInstructions(); return true; }});
    widgets[1].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.checkSolution(); return true; },
                                        touchUp: function(id, x, y) {commands.checkSolution(); return true; }});
    widgets[2].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.startNewPuzzle(); return true; },
                                        touchUp: function(id, x, y) {commands.startNewPuzzle(); return true; }});
    widgets[3].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buyHints(); return true; },
                                        touchUp: function(id, x, y) {commands.buyHints(); return true; }});
    widgets[4].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buySolutions(); return true; },
                                        touchUp: function(id, x, y) {commands.buySolutions(); return true; }});
    widgets[5].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buyPuzzles(); return true; },
                                        touchUp: function(id, x, y) {commands.buyPuzzles(); return true; }});
    widgets[6].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.hideHelp(); return true; },
                                        touchUp: function(id, x, y) {commands.hideHelp(); return true; }});
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(this.backImage, 0, 0);

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    return this.guiManager.mouseDown(x, y);
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    if (!this.guiManager.mouseUp(x, y)) {
      this.commands.hideHelp();
    }

    return true;
  },

  touchDown: function(id, x, y) {
    return this.guiManager.touchDown(id, x, y);
  },

  touchMove: function(id, x, y) {
    return this.guiManager.touchMove(id, x, y);
  },

  touchUp: function(id, x, y) {
    return this.guiManager.touchUp(id, x, y);
  },
});
