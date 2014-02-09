ccw.PlayCommandsClass = new joe.ClassEx({
  SWIPE_THRESHOLD_SQ: 100 * 100,
  SWIPE_RIGHT_THRESH: Math.sqrt(Math.sqrt(3) * 0.5),
  SWIPE_DIAG_TARGET: Math.sqrt(2) * 0.5,
  SWIPE_DIAG_THRESH: 2 * Math.abs(Math.sqrt(3) * 0.5 - Math.sqrt(2) * 0.5),
  SWIPE_TYPE: {NONE: 0,
               RIGHT: 1,
               LEFT: 2,
               UP_RIGHT: 3,
               DOWN_RIGHT: 4},
},
{
  state: null,
  gesturePosStart: {id:-1, x:0, y:0},
  gesturePos: {id:-1, x:0, y:0},
  bDragging: false,
  bCanDrag: true,
  focusLayer: null,   // The layer currently receiving I/O events

  init: function(state) {
    this.state = state;
  },

  checkSolution: function() {
    window.alert("CheckSolution");
  },

  startNewPuzzle: function() {
    window.alert("StartNewPuzzle");
  },

  buyHints: function() {
    window.alert("BuyHints");
  },

  buySolutions: function() {
    window.alert("BuySolution");
  },

  buyPuzzles: function() {
    window.alert("BuyPuzzles");
  },

  showHelp: function() {
    this.state.showHelp();
  },

  hideHelp: function() {
    this.state.hideHelp();
  },

  showInstructions: function() {
    this.state.hideHelp();
    this.state.showInstructions();
  },

  hideInstructions: function() {
    this.state.hideInstructions();
  },

  showInput: function() {
    this.state.refreshInputClueText();
    this.state.refreshInputAnswerText();
    this.state.showInput();
  },

  hideInput: function(newAnswer) {
    if (newAnswer) {
      this.state.updateSelectedAnswer(newAnswer);
    }

    this.state.hideInput();
  },

  slideLeft: function() {
    this.state.slideLayerLeft();
  },

  slideRight: function() {
    this.state.slideLayerRight();
  },

  checkForSwipe: function(dx, dy, magnitude) {
    var swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    // Check for left or right drag.
    dirDot = dx / magnitude;

    if (dirDot > ccw.PlayCommandsClass.SWIPE_RIGHT_THRESH) {
      swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT;
    }
    else if (dirDot < -ccw.PlayCommandsClass.SWIPE_RIGHT_THRESH) {
      swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.LEFT;
    }
    else if (Math.abs(Math.abs(dirDot) - ccw.PlayCommandsClass.SWIPE_DIAG_TARGET) < ccw.PlayCommandsClass.SWIPE_DIAG_THRESH) {
      if (dx * dy < 0) {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT;
      }
      else {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT;
      }
    }

    return swipeType;
  },

  startGesture: function(x, y) {
    this.gesturePosStart.x = x;
    this.gesturePosStart.y = y;

    this.gesturePos.x = x;
    this.gesturePos.y = y;
  },

  mouseDown: function(x, y) {
    var focusView = joe.Scene.getFirstViewContainingPoint(x, y);
    this.focusLayer = focusView ? focusView.getLayer(0) : null;

    if (this.focusLayer) {
      // Check: is the user interacting with a GUI element in the play layer?
      this.bCanDrag = !this.focusLayer.mouseDown(x, y);

      if (this.bCanDrag) {
        this.startGesture(x, y);
      }
      
      this.bDragging = false;
    }
  },

  mouseDrag: function(x, y) {
    if (this.bCanDrag) {
      this.executeDrag(this.checkDrag(x, y));
    }
    else if (this.focusLayer) {
      this.focusLayer.mouseDrag(x, y);
    }
  },

  mouseUp: function(x, y) {
    if (!this.bCanDrag && this.focusLayer) {
      this.focusLayer.mouseUp(x, y);
    }

    this.focusLayer = null;
    this.bDragging = false;
    this.bCanDrag = true;
  },

  touchDown: function(id, x, y) {
    var focusView = joe.Scene.getFirstViewContainingPoint(x, y);
    this.focusLayer = focusView ? focusView.getLayer(0) : null;

    if (this.focusLayer && this.gesturePosStart.id < 0) {
      this.gesturePosStart.id = id;
      this.gesturePosStart.x = x;
      this.gesturePosStart.y = y;

      this.gesturePos.id = id;
      this.gesturePos.x = x;
      this.gesturePos.y = y;

      this.bCanDrag = !this.focusLayer.mouseDown(x, y);
    }
    else {
      this.focusLayer = null;
    }
  },

  touchMove: function(id, x, y) {
    if (this.bCanDrag && this.gesturePosStart.id >= 0 && id === this.gesturePosStart.id) {
      this.executeDrag(this.checkDrag(x, y));
    }
    else if (this.focusLayer) {
      this.focusLayer.mouseDrag(x, y);
    }
  },

  touchUp: function(id, x, y) {
    if (this.focusLayer && id === this.gesturePosStart.id) {
      this.gesturePosStart.id = -1;
      this.gesturePos.id = -1;

      this.focusLayer.mouseUp(x, y);

      this.bCanDrag = true;
      this.bDragging = false;
      this.focusLayer = null;
    }
  },

  executeDrag: function(dragType) {
    switch(dragType) {
      case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
        this.state.slideLayerRight();
      break;

      case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
        this.state.slideLayerLeft();
      break;

      default:
      break;
    }
  },

  checkDrag: function(x, y) {
    var dx = 0,
        dy = 0,
        dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragging) {
      this.gesturePos.x = x;
      this.gesturePos.y = y;

      dx = this.gesturePos.x - this.gesturePosStart.x;
      dy = this.gesturePos.y - this.gesturePosStart.y;

      if (dx * dx + dy * dy > ccw.PlayCommandsClass.SWIPE_THRESHOLD_SQ) {
        this.bDragging = true;

        dragType = this.checkForSwipe(dx, dy, Math.sqrt(dx * dx + dy * dy));
      }
    }

    return dragType;
  },
});

