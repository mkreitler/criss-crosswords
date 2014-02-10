// Layer that manages dialog box messages.
// Originally created off screen and moved
// in and out as needed.

ccw.DialogLayerClass = new joe.ClassEx({
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

  BUTTON_POS_X: 274,
  BUTTON_POS_Y: 361,

  backImage: null,
  commands: null,
  guiManager: null,
  messageLabel: null,

  init: function(commands) {
    var highlightImage = null,
        self = this;

    this.commands = commands;
    this.guiManager = new joe.GuiClass();

    this.messageLabel = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DEFAULT_MESSAGE,
                                               ccw.game.sysFont,
                                               Math.round(joe.Graphics.getWidth() * 0.5),
                                               Math.round(this.BUTTON_POS_Y * 0.5),
                                               {mouseDown: function(x, y) {return false;},
                                                mouseDrag: function(x, y) {return false;},
                                                mouseUp: function(x, y) {return false;}},
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));

    highlightImage = ccw.game.getImage("HIGHLIGHT_MENU_SMALL");
    this.guiManager.addWidget(new joe.GUI.HighlightBox(this.BUTTON_POS_X,
                                                       this.BUTTON_POS_Y,
                                                       highlightImage.width,
                                                       highlightImage.height,
                                                       highlightImage,
                                                       {
                                                          mouseDown: function(x, y) {
                                                            return true;
                                                          },
                                                          mouseDrag: function(x, y) {
                                                            return true;
                                                          },
                                                          mouseUp: function(x, y) {
                                                            return self.close();
                                                          }
                                                        }
                                                      ), true);    
  },

  setViewOffset: function(x, y) {
    if (this.guiManager) {
      this.guiManager.setViewOffset(x, y);
    }
  },

  setText: function(newText) {
    if (this.messageLabel) {
      this.messageLabel.setText(newText);
    }
  },

  close: function() {
    if (this.commands) {
      ccw.game.playSound("CLICK_HIGH");
      this.commands.hideDialog();
    }
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(ccw.game.getImage("DIALOG_FRAME"), 0, 0);

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    this.guiManager.mouseDown(x, y);
    return true;
  },

  mouseDrag: function(x, y) {
    return true;
  },

  mouseUp: function(x, y) {
    this.guiManager.mouseUp(x, y);
    return true;
  },

  touchDown: function(id, x, y) {
    this.guiManager.touchDown(id, x, y);
    return true;
  },

  touchMove: function(id, x, y) {
    return true;
  },

  touchUp: function(id, x, y) {
    this.guiManager.touchUp(id, x, y);
    return true;
  },
});
