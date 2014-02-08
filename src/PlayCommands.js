ccw.PlayCommandsClass = new joe.ClassEx({
  SWIPE_THRESHOLD_SQ: 50 * 50,
  SWIPE_RIGHT_THRESH: Math.sqrt(3) * 0.5,
  SWIPE_DIAG_TARGET: Math.sqrt(2) * 0.5,
  SWIPE_DIAG_THRESH: Math.abs(Math.sqrt(3) * 0.5 - Math.sqrt(2) * 0.5) * 0.5,
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

  init: function(state) {
    this.state = state;
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
    else if (Math.abs(Math.abs(dirDot) - ccw.PlayCommandsClass.TARGET) < ccw.PlayCommandsClass.TARGET) {
      if (dy < 0) {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT;
      }
      else {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT;
      }
    }

    return swipeType;
  },

  mouseDown: function(x, y) {
    this.gesturePosStart.x = x;
    this.gesturePosStart.y = y;

    this.gesturePos.x = x;
    this.gesturePos.y = y;

    this.bDragging = false;
  },

  mouseDrag: function(x, y) {
    this.checkDrag(x, y);
  },

  mouseUp: function(x, y) {
    this.bDragging = false;
  },

  touchDown: function(id, x, y) {
    if (this.gesturePosStart.id < 0) {
      this.gesturePosStart.id = id;
      this.gesturePosStart.x = x;
      this.gesturePosStart.y = y;

      this.gesturePos.id = id;
      this.gesturePos.x = x;
      this.gesturePos.y = y;
    }
  },

  touchMove: function(id, x, y) {
    if (this.gesturePosStart.id >= 0 && id === this.gesturePosStart.id) {
      this.checkDrag(x, y);
    }
  },

  touchUp: function(id, x, y) {
    this.gesturePosStart.id = -1;
    this.gesturePos.id = -1;

    this.bDragging = false;
  },

  checkDrag: function(x, y) {
    var dx = 0,
        dy = 0;

    if (!this.bDragging) {
      this.gesturePos.x = x;
      this.gesturePos.y = y;

      dx = this.gesturePos.x - this.gesturePosStart.x;
      dy = this.gesturePos.y - this.gesturePosStart.y;

      if (dx * dx + dy * dy > ccw.PlayCommandsClass.SWIPE_THRESHOLD_SQ) {
        this.bDragging = true;

        switch(this.checkForSwipe(dx, dy, Math.sqrt(dx * dx + dy * dy))) {
          case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
            this.state.slideLayerRight();
          break;

          case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
            this.state.slideLayerLeft();
          break;

          default:
          break;
        }
      }
    }
  },
});

