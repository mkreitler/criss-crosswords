ccw.StatePlayClass = new joe.ClassEx({
  GAME_VIEW_WIDTH_FACTOR: 4, // Want 3 panes with wraparound, so we'll fake it with 4 panes.
  GAME_VIEW_HEIGHT_FACTOR: 1,
  SLIDE_TIME: 0.25,
  UP_CLUES: "45678",
  DOWN_CLUES: "12345",

  VIEW_ORDER: { GAME: 100,
                INPUT: 90,
                HELP: 80,
                INSTRUCTIONS: 70 },
},
{
  commands: null,
  gameView: null,
  playLayer: null,
  inputLayer: null,
  instructionsView: null,
  helpView: null,
  inputView: null,

  init: function(gridImage, panelImage) {
    var state = this;

    this.commands = new ccw.PlayCommandsClass(this);

    this.gameView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR,
                                       joe.Graphics.getHeight() * ccw.StatePlayClass.GAME_VIEW_HEIGHT_FACTOR);
    this.playLayer = new ccw.PlayLayerClass(this.commands);
    this.gameView.addLayer(this.playLayer);
    this.syncViewToPanel("CENTER");

    this.instructionsView = new joe.Scene.View(joe.Graphics.getWidth(),
                                               joe.Graphics.getHeight(),
                                               joe.Graphics.getWidth(),
                                               joe.Graphics.getHeight());
    this.instructionsView.addLayer(new ccw.InstructionsLayerClass(this.commands));
    this.instructionsView.setWorldPos(joe.Graphics.getWidth(), 0);

    this.helpView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight());
    this.helpView.addLayer(new ccw.HelpLayerClass(this.commands));
    this.helpView.setWorldPos(joe.Graphics.getWidth(), 0);

    this.inputView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight());
    this.inputLayer = this.inputView.addLayer(new ccw.InputLayerClass(this.commands));
    this.inputView.setWorldPos(-joe.Graphics.getWidth(), 0);

    // Add views to the scene.    
    joe.Scene.addView(this.gameView, ccw.StatePlayClass.VIEW_ORDER.GAME);
    joe.Scene.addView(this.inputView, ccw.StatePlayClass.VIEW_ORDER.INPUT);
    joe.Scene.addView(this.helpView, ccw.StatePlayClass.VIEW_ORDER.HELP);
    joe.Scene.addView(this.instructionsView, ccw.StatePlayClass.VIEW_ORDER.INSTRUCTIONS);
  },

  syncViewToPanel: function(whichPanel) {
    joe.assert(this.gameView && this.playLayer, joe.Strings.ASSERT_INVALID_ARGS);

    this.gameView.setSourcePos(this.playLayer.getPaneOffsetX(whichPanel), 0);
    this.playLayer.setGuiContext(whichPanel);
  },

  updateSelectedAnswer: function(newAnswer) {
    this.playLayer.updateSelectedAnswer(newAnswer);
  },

  refreshInputClueText: function() {
    this.inputLayer.setClueText(this.playLayer.getSelectedClueText(), this.playLayer.getSelectedHintText());
  },

  refreshInputAnswerText: function() {
    this.inputLayer.setAnswerText(this.playLayer.getSelectedAnswerText());
    this.inputLayer.advanceEditCursor();
  },

  showInput: function() {
    this.inputView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
    joe.KeyInput.addListener(this.inputLayer);
  },

  hideInput: function() {
    this.inputView.setWorldTransition(-joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
    this.playLayer.unselectWordGrid();
    joe.KeyInput.removeListener(this.inputLayer);
  },

  showInstructions: function() {
    this.instructionsView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  hideInstructions: function() {
    this.instructionsView.setWorldTransition(joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  showHelp: function() {
    this.helpView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  hideHelp: function() {
    this.helpView.setWorldTransition(joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
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
      this.playLayer.setGuiContext("LEFT_REPEAT");
      newViewX -= joe.Graphics.getWidth();
    }

    this.playLayer.shiftGuiContextLeft();

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
      this.playLayer.setGuiContext("LEFT_REPEAT");
      newViewX += joe.Graphics.getWidth();
    }

    this.playLayer.shiftGuiContextRight();

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

