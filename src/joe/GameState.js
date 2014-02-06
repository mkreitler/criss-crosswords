joe.GameStateClass = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
},
{
  // Instance Definition //////////////////////////////////////////////////////
  update: function(dt, gameTime) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(dt, gameTime);
    }
  },

  draw: function(gfx) {
    if (this.currentState && this.currentState.draw) {
      this.currentState.draw(gfx);
    }
  },

  keyPress: function(keyCode) {
    if (this.currentState && this.currentState.keyPress) {
      this.currentState.keyPress(keyCode);
    }
  },

  keyRelease: function(keyCode) {
    if (this.currentState && this.currentState.keyRelease) {
      this.currentState.keyRelease(keyCode);
    }
  },

  keyTap: function(keyCode) {
    if (this.currentState && this.currentState.keyTap) {
      this.currentState.keyTap(keyCode);
    }
  },

  keyHold: function(keyCode) {
    if (this.currentState && this.currentState.keyHold) {
      this.currentState.keyHold(keyCode);
    }
  },

  keyDoubleTap: function(keyCode) {
    if (this.currentState && this.currentState.keyDoubleTap) {
      this.currentState.keyDoubleTap(keyCode);
    }
  },

  mouseDown : function(x, y) {
    if (this.currentState && this.currentState.mouseDown) {
      this.currentState.mouseDown(x, y);
    }
  },

  mouseUp : function(x, y) {
    if (this.currentState && this.currentState.mouseUp) {
      this.currentState.mouseUp(x, y);
    }
  },

  mouseDrag : function(x, y) {
    if (this.currentState && this.currentState.mouseDrag) {
      this.currentState.mouseDrag(x, y);
    }
  },

  mouseOver : function(x, y) {
    if (this.currentState && this.currentState.mouseOver) {
      this.currentState.mouseOver(x, y);
    }
  },

  mouseClick : function(x, y) {
    if (this.currentState && this.currentState.mouseClick) {
      this.currentState.mouseClick(x, y);
    }
  },

  mouseDoubleClick : function(x, y) {
    if (this.currentState && this.currentState.mouseDoubleClick) {
      this.currentState.mouseDoubleClick(x, y);
    }
  },

  touchDown : function(id, x, y) {
    if (this.currentState && this.currentState.touchDown) {
      this.currentState.touchDown(id, x, y);
    }
  },

  touchUp : function(id, x, y) {
    if (this.currentState && this.currentState.touchUp) {
      this.currentState.touchUp(id, x, y);
    }
  },

  touchMove : function(id, x, y) {
    if (this.currentState && this.currentState.touchMove) {
      this.currentState.touchMove(id, x, y);
    }
  },
});

joe.GameState = new joe.GameStateClass()

// Register with game systems.
joe.UpdateLoop.addListener(joe.GameState);
joe.Graphics.addListener(joe.GameState);

// Components /////////////////////////////////////////////////////////////////
joe.GameStateClass.stateMachine = {
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

