// Components /////////////////////////////////////////////////////////////////
joe.GameState = {};

joe.GameState.stateMachine = {
  currentState: null,

  setState: function(newState) {
    if (this.currentState !== newState) {
      if (this.currentState) {
        this.currentState.exit();
        joe.UpdateLoop.removeListener(this.currentState);
        joe.Graphics.removeListener(this.currentState);
      }

      if (newState) {
        newState.enter();
        joe.UpdateLoop.addListener(newState);
        joe.Graphics.addListener(newState);
      }

      this.currentState = newState;
    }
  },

  getState: function() {
    return this.currentState;
  },

  mouseDrag: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseDrag) {
      bConsumed = curState.commands.mouseDrag(x, y);
    }

    return bConsumed;
  },

  mouseUp: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseUp) {
      bConsumed = curState.commands.mouseUp(x, y);
    }

    return bConsumed;
  },

  mouseDown: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseDown) {
      bConsumed = curState.commands.mouseDown(x, y);
    }

    return bConsumed;
  },

  touchUp: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchUp) {
      bConsumed = curState.commands.touchUp(touchID, x, y);
    }

    return bConsumed;
  },

  touchDown: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchDown) {
      bConsumed = curState.commands.touchDown(touchID, x, y);
    }

    return bConsumed;
  },

  touchMove: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchMove) {
      bConsumed = curState.commands.touchMove(touchID, x, y);
    }

    return bConsumed;
  },

  keyPress: function(keyCode) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.keyPress) {
      bConsumed = curState.commands.keyPress(keyCode);
    }

    return bConsumed;
  },

  keyRelease: function(keyCode) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.keyRelease) {
      bConsumed = curState.commands.keyRelease(keyCode);
    }

    return bConsumed;
  }
};

