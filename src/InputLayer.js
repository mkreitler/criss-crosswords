// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InputLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  WIDGET_OFFSETS_Y: [255, 527, 391],
  HINT_BUTTON_OFFSET_X: 651,
  KEY_CAPTURE_BOUNDS: {x:6, y:800, w:760, h:224},
  KEY_LAYOUT: {chars: [
                 "QWERTYUIOP",
                 "ASDFGHJKL1",
                 "2ZXCVBNM31"
               ],
               charList: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']},
  EXIT_HOLD_TIME: 500,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,
  clueLabel: null,
  answerLabel: null,
  hintLabel: null,
  keyBox: null,
  vkeyStart: null,
  vkeyPressTime: 0,
  curEditChar: 0,
  highlightImage: null,
  highlightPos: {x:0, y:0},
  gridPos: {row:0, col:0},
  coords: {x:0, y:0},
  clueText: null,
  hintText: null,
  nHints: 3,  // Normally, we would retrieve this from the server, as it is something you can buy.
  bHinted: false,

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        widgets = [],
        self = this,
        vkeyDownHandler = function(x, y) { self.onVKeyDown(self.resolveVKeyFromPoint(x, y)); return true; },
        vkeyUpHandler = function(x, y) { self.onVKeyUp(self.resolveVKeyFromPoint(x, y)); return true; };

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
                                                 ccw.game.sysFontLarge,
                                                 joe.Graphics.getWidth() * 0.5,
                                                 this.WIDGET_OFFSETS_Y[1],
                                                 null,
                                                 0.5,
                                                 0.5,
                                                 joe.Graphics.getWidth() * 0.9));

    this.hintLabel = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.HINT_LABEL_HINT,
                                               ccw.game.sysFont,
                                               this.HINT_BUTTON_OFFSET_X,
                                               this.WIDGET_OFFSETS_Y[2],
                                               {mouseDown: function(x, y) {return false;},
                                                mouseUp: function(x, y) {return false;}},
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));
    this.answerLabel.setCursor(-1, "^");

    highlightImage = ccw.game.getImage("HIGHLIGHT_MENU_SMALL");
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(Math.round(this.HINT_BUTTON_OFFSET_X - highlightImage.width * 0.5),
                                                                    Math.round(this.WIDGET_OFFSETS_Y[2] - highlightImage.height * 0.5),
                                                                    highlightImage.width,
                                                                    highlightImage.height,
                                                                    highlightImage,
                                                                    {
                                                                      mouseDown: function(x, y) {
                                                                       return true;
                                                                      },
                                                                      mouseUp: function(x, y) {
                                                                       return self.flipClueText(x, y);
                                                                      }
                                                                    }
                                                                    ), true);


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

  buildHintText: function() {
    var dynamicHint = null;

    if (this.nHints > 0 || this.bHinted) {
      if (!this.bHinted) {
        this.nHints -= 1;
        this.bHinted = true;
      }

      dynamicHint = ccw.STRINGS.HINT_PREAMBLE + this.hintText;
      if (this.nHints > 1) {
        dynamicHint +=  ccw.STRINGS.HINT_MIDAMBLE + this.nHints + ccw.STRINGS.HINT_POSTAMBLE_PLURAL;
      }
      else if (this.nHints === 0) {
        dynamicHint +=  ccw.STRINGS.HINT_POSTAMBLE_ZERO;
      }
      else {
        dynamicHint +=  ccw.STRINGS.HINT_MIDAMBLE + this.nHints + ccw.STRINGS.HINT_POSTAMBLE_SINGULAR;
      }
    }
    else  {
      dynamicHint = ccw.STRINGS.NO_MORE_HINTS;
    }

    return dynamicHint;
  },

  flipClueText: function(x, y) {
    if (this.hintLabel.AABBcontainsPoint(x, y)) {
      if (this.hintLabel.getText() === ccw.STRINGS.HINT_LABEL_HINT) {
        // Flip from hint to clue.
        this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_CLUE);
        this.clueLabel.setText(this.buildHintText());
      }
      else {
        // Flip from clue to hint.
        this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_HINT);
        this.clueLabel.setText(this.clueText);
      }
    }

    return true;
  },

  updateAnswerAndClose: function() {
    this.commands.hideInput(this.answerLabel.getText());
  },

  getCharFromKeyCode: function(key) {
    var charOut = null;

    switch (key) {
      case joe.KeyInput.KEYS.ENTER:
        charOut = '1';
      break;

      case joe.KeyInput.KEYS.ESC:
        charOut = '2';
      break;

      case joe.KeyInput.KEYS.BACKSPACE:
        charOut = '3';
      break;

      default:
        if (key >= joe.KeyInput.KEYS.A && key <= joe.KeyInput.KEYS.Z) {
          charOut = this.KEY_LAYOUT.charList[key - joe.KeyInput.KEYS.A];
        }
      break;
    }

    return charOut;
  },

  keyPress: function(key) {
    var charOut = this.getCharFromKeyCode(key);

    if (charOut) {
      this.onVKeyDown(charOut);
    }
  },

  keyRelease: function(key) {
    charOut = this.getCharFromKeyCode(key);

    if (charOut) {
      this.vkeyPressTime = 0; // Don't require a delay for the 'ESC' key.
      this.onVKeyUp(charOut);
    }
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
      this.answerLabel.setCursor(this.curEditChar);
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

    this.answerLabel.setCursor(this.curEditChar);
  },

  onVKeyDown: function(char) {
    var highlightPos = null;

    this.vkeyStart = char;
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

  onVKeyUp: function(char) {
    var vkeyEnd = char,
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

  setClueText: function(clueText, hintText) {
    this.clueText = clueText;
    this.hintText = hintText;
    this.bHinted = false;

    if (this.clueLabel) {
      this.clueLabel.setText(clueText);
    }

    if (this.hintLabel) {
      this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_HINT);
    }
  },

  setAnswerText: function(text) {
    if (this.answerLabel) {
      this.answerLabel.setText(text);
      this.curEditChar = 0;
      this.answerLabel.setCursor(this.curEditChar);
    }
  },

  advanceEditCursor: function() {
    var answerText = this.answerLabel.getText(),
        i = 0;

    for (i=0; i<answerText.length; ++i) {
      this.curEditChar = i;

      if (answerText.charAt(i) === "_") {
        break;
      }
    }
    
    this.answerLabel.setCursor(this.curEditChar);
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
