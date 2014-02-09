// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InputLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,
  clueLabel: null,
  answerLabel: null,

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        widgets = [];

    this.backImage = ccw.game.getImage("KEYBOARD");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;

    this.guiManager = new joe.GuiClass();
    this.guiManager.setClipRect();

    this.clueLabel = this.guiManager.addWidget(new joe.GUI.Label('Default Clue Text',
                                               ccw.game.sysFont,
                                               joe.Graphics.getWidth() * 0.5,
                                               305,
                                               null,
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));

    this.answerLabel = this.guiManager.addWidget(new joe.GUI.Label('_______',
                                                 ccw.game.sysFont,
                                                 joe.Graphics.getWidth() * 0.5,
                                                 527,
                                                 null,
                                                 0.5,
                                                 0.5,
                                                 joe.Graphics.getWidth() * 0.9));    
  },

  setClueText: function(text) {
    if (this.clueLabel) {
      this.clueLabel.setText(text);
    }
  },

  setAnswerText: function(text) {
    if (this.answerLabel) {
      this.answerLabel.setText(text);
    }
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
    return true || this.guiManager.mouseDown(x, y);
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    if (!this.guiManager.mouseUp(x, y)) {
      this.commands.hideInput();
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
