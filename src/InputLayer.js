// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InputLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  WIDGET_OFFSETS_Y: [305, 527],
  KEY_CAPTURE_BOUNDS: {x:6, y:800, w:760, h:224},
  KEY_LAYOUT: {chars: [
                 "QWERTYUIOP",
                 "ASDFGHJKL1",
                 "2ZXCVBNM31"
               ]},
  EXIT_HOLD_TIME: 500,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,
  clueLabel: null,
  answerLabel: null,
  keyBox: null,
  vkeyStart: null,
  vkeyPressTime: 0,
  curEditChar: 0,
  highlightImage: null,
  highlightPos: {x:0, y:0},
  gridPos: {row:0, col:0},
  coords: {x:0, y:0},

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        widgets = [],
        self = this,
        vkeyDownHandler = function(x, y) { self.onVKeyDown(x, y); return true; },
        vkeyUpHandler = function(x, y) { self.onVKeyUp(x, y); return true; };

    this.backImage = ccw.game.getImage("KEYBOARD");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;

    this.guiManager = new joe.GuiClass();
    this.guiManager.setClipRect();

    this.clueLabel = this.guiManager.addWidget(new joe.GUI.Label('Default Clue Text',
                                               ccw.game.sysFont,
                                               joe.Graphics.getWidth() * 0.5,
                                               this.WIDGET_OFFSETS_Y[0],
                                               null,
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));

    this.answerLabel = this.guiManager.addWidget(new joe.GUI.Label('_______',
                                                 ccw.game.sysFont,
                                                 joe.Graphics.getWidth() * 0.5,
                                                 this.WIDGET_OFFSETS_Y[1],
                                                 null,
                                                 0.5,
                                                 0.5,
                                                 joe.Graphics.getWidth() * 0.9));

    this.keyBox = this.guiManager.addWidget(new joe.GUI.CaptureBox(this.KEY_CAPTURE_BOUNDS.x,
                                                                   this.KEY_CAPTURE_BOUNDS.y,
                                                                   this.KEY_CAPTURE_BOUNDS.w,
                                                                   this.KEY_CAPTURE_BOUNDS.h,
                                                                   null,
                                                                   null,
                                                                   {
                                                                     mouseDown: function(x, y) {
                                                                       return vkeyDownHandler(x, y);
                                                                     },
                                                                     mouseUp: function(x, y) {
                                                                       return vkeyUpHandler(x, y);
                                                                     }
                                                                   },
                                                                   null));   
  },

  updateAnswerAndClose: function() {
    this.commands.hideInput(this.answerLabel.getText());
  },

  exit: function() {
    // Close the view without updating the answer.
    this.commands.hideInput(null);
  },

  getCellForKey: function(char) {
    var iRow = 0,
        iCol = 0;

    this.gridPos.row = -1;
    this.gridPos.col = -1;

    for (iRow=0; iRow<this.KEY_LAYOUT.chars.length; ++iRow) {
      for (iCol=0; iCol<this.KEY_LAYOUT.chars[iRow].length; ++iCol) {
        if (this.KEY_LAYOUT.chars[iRow].charAt(iCol) === char) {
          this.gridPos.row = iRow;
          this.gridPos.col = iCol;
          iRow = this.KEY_LAYOUT.chars.length;
          break;
        }
      }
    }

    return this.gridPos;
  },

  getTopLeftForKey: function(char) {
    var gridPos = this.getCellForKey(char),
        bounds = this.keyBox.AABBgetRef();

    this.coords.x = 0;
    this.coords.y = 0;

    if (gridPos.row >= 0 && gridPos.col >= 0) {
      this.coords.x = Math.round(gridPos.col * bounds.width / this.KEY_LAYOUT.chars[0].length) + this.KEY_CAPTURE_BOUNDS.x;
      this.coords.y = Math.round(gridPos.row * bounds.height / this.KEY_LAYOUT.chars.length) + this.KEY_CAPTURE_BOUNDS.y;
    }

    return this.coords;
  },

  resolveVKeyFromPoint: function(x, y) {
    var localX = x - this.KEY_CAPTURE_BOUNDS.x,
        localY = y - this.KEY_CAPTURE_BOUNDS.y,
        row = 0,
        col = 0,
        bounds = this.keyBox.AABBgetRef(),
        key = "";

    row = Math.floor(localY / bounds.height * this.KEY_LAYOUT.chars.length);
    col = Math.floor(localX / bounds.width * this.KEY_LAYOUT.chars[0].length);

    if (row >= 0 && row < this.KEY_LAYOUT.chars.length &&
        col >= 0 && col < this.KEY_LAYOUT.chars[0].length) {
      key = this.KEY_LAYOUT.chars[row].charAt(col);
    }

    return key;
  },

  addLetter: function(letter) {
    var editText = this.answerLabel.getText(),
        foreString = editText.slice(0, this.curEditChar),
        aftString = editText.slice(this.curEditChar + 1);

    if (this.curEditChar < editText.length) {
      this.answerLabel.setText(foreString + letter + aftString);
      this.curEditChar = Math.min(this.curEditChar + 1, editText.length);
    }
  },

  removeLetter: function() {
    var editText = this.answerLabel.getText(),
        foreString = null,
        aftString = null;

    this.curEditChar = this.curEditChar - 1;

    if (this.curEditChar >= 0) {
      foreString = editText.slice(0, this.curEditChar);
      aftString = editText.slice(this.curEditChar + 1);
      this.answerLabel.setText(foreString + "_" + aftString);
    }
    else if (this.curEditChar < 0) {
      // Consume characters from the front.
      this.answerLabel.setText(editText.slice(1) + "_");
      this.curEditChar = 0;
    }
    else {
      this.curEditChar = 0;
    }
  },

  onVKeyDown: function(x, y) {
    var highlightPos = null;

    this.vkeyStart = this.resolveVKeyFromPoint(x, y);
    this.vkeyPressTime = Date.now();

    this.highlightImage = null;
    this.highlightPos.x = 0;
    this.highlightPos.y = 0;

    if (this.vkeyStart) {
      switch(this.vkeyStart) {
        case "1":
          // 'Done' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_LARGE");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        case "2":
          // 'Exit' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        case "3":
          // 'Del' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        default:
          // A normal letter key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;
      }

      if (highlightPos) {
        this.highlightPos.x = highlightPos.x;
        this.highlightPos.y = highlightPos.y;
      }
    }
  },

  onVKeyUp: function(x, y) {
    var vkeyEnd = this.resolveVKeyFromPoint(x, y),
        newAnswer = null;

    this.highlightImage = null;

    if (this.vkeyStart === vkeyEnd) {
      switch(vkeyEnd) {
        case "1":
          // 'Done' key.
          this.updateAnswerAndClose();
        break;

        case "2":
          // 'Exit' key.
          if (Date.now() - this.vkeyPressTime > this.EXIT_HOLD_TIME) {
            this.exit();
          }
        break;

        case "3":
          // 'Del' key.
          this.removeLetter();
        break;

        default:
          // A normal letter key.
          this.addLetter(vkeyEnd);
        break;
      }
    }
  },

  setClueText: function(text) {
    if (this.clueLabel) {
      this.clueLabel.setText(text);
    }
  },

  setAnswerText: function(text) {
    if (this.answerLabel) {
      this.answerLabel.setText(text);
      this.curEditChar = 0;
    }
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(this.backImage, 0, 0);

    if (this.highlightImage) {
      gfx.drawImage(this.highlightImage, this.highlightPos.x, this.highlightPos.y);
    }

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    this.guiManager.mouseDown(x, y);

    return true;
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    if (!this.guiManager.mouseUp(x, y)) {
      this.commands.hideInput(null);
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
