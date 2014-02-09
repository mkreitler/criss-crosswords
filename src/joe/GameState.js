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
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.mouseDrag) {
      curState.commands.mouseDrag(x, y);
    }
  },

  mouseUp: function(x, y) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.mouseUp) {
      curState.commands.mouseUp(x, y);
    }
  },

  mouseDown: function(x, y) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.mouseDown) {
      curState.commands.mouseDown(x, y);
    }
  },

  touchUp: function(touchID, x, y) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.touchUp) {
      curState.commands.touchUp(touchID, x, y);
    }

    return true;
  },

  touchDown: function(touchID, x, y) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.touchDown) {
      curState.commands.touchDown(touchID, x, y);
    }

    return true;
  },

  touchMove: function(touchID, x, y) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.touchMove) {
      curState.commands.touchMove(touchID, x, y);
    }

    return true;
  },

  keyPress: function(keyCode) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.keyPress) {
      curState.commands.keyPress(keyCode);
    }

    return true;
  },

  keyRelease: function(keyCode) {
    var curState = this.getState();

    if (curState && curState.commands && curState.commands.keyRelease) {
      curState.commands.keyRelease(keyCode);
    }

    return true;
  }
};

