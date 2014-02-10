// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  requires: joe.MathEx.AABBmodule,

  BORDER_WIDTH: 2,
  DRAG_DIR: {NONE:0,
             UP: -1,
             DOWN:1},

  HIGHLIGHT_DELAY: 250,

  commands: null,
  gridImage: null,
  top: 0,
  left: 0,
  panelImage: null,
  panelLeft: 0,
  panelTop: 0,
  dragStart: {row:-1, col:-1},
  bDragged: false,

  cleanGrid: [
    "1*2*3*.",
    "*.*.*.*",
    "4*.*.*.",
    "*.*.*.*",
    "5*.*.*.",
    "*.*.*.*",
    "6*7*8*.",
  ],
  grid: [
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
  ],

  clues: {
    up: {"4": ccw.STRINGS.UP_CLUES[0],
         "5": ccw.STRINGS.UP_CLUES[1],
         "6": ccw.STRINGS.UP_CLUES[2],
         "7": ccw.STRINGS.UP_CLUES[3],
         "8": ccw.STRINGS.UP_CLUES[4]},
    down: {"1": ccw.STRINGS.DOWN_CLUES[0],
           "2": ccw.STRINGS.DOWN_CLUES[1],
           "3": ccw.STRINGS.DOWN_CLUES[2],
           "4": ccw.STRINGS.DOWN_CLUES[3],
           "5": ccw.STRINGS.DOWN_CLUES[4]},
  },

  block: '*',
  selection: {startRow: -1, startCol: -1, clueDir: 0, clueNum: -1},  // clueDir = DRAG_DIR.NONE
  gridPos: {row:-1, col:-1},

  unselect: function() {
    this.selection.clueDir = this.DRAG_DIR.NONE;
  },

  selectFromClueList: function(bUp, selectNum, commands) {
    var clueList = bUp ? this.clues.up : this.clues.down;
        inputCallback = commands.showInput,
        bSuccess = false;

    if (clueList.hasOwnProperty(selectNum)) {
      this.selection.clueDir = bUp ? this.DRAG_DIR.UP : this.DRAG_DIR.DOWN;
      this.selection.clueNum = selectNum;
      this.commands = commands;
      setTimeout(function() {inputCallback.call(commands)}, this.HIGHLIGHT_DELAY);
      ccw.game.playSound("SWEEP");
      bSuccess = true;
    }

    return bSuccess;
  },

  updateSelectedAnswer: function(newAnswer) {
    // Write the new clue back into the grid.
    var i = 0,
        row = 0,
        col = 0,
        answerChar = null,
        gridStart = this.getGridStartForClue(this.selection.clueNum);

    if (this.selection.clueDir && gridStart) {
      switch(this.selection.clueDir) {
        case this.DRAG_DIR.UP:
          // Build up to find the answer.
          for (i=0; i<Math.min(newAnswer.length, this.grid.length); ++i) {
            row = gridStart.row - i;
            col = gridStart.col + i;
            if (row < 0 || col >= this.grid[0].length) {
              break;
            }
            else {
              answerChar = newAnswer.charAt(i);
              answerChar = answerChar === "_" ? "." : answerChar;

              this.grid[row] = this.grid[row].slice(0, col) + answerChar + this.grid[row].slice(col + 1);
            }
          }
        break;

        case this.DRAG_DIR.DOWN:
          // Build down to find the answer.
          for (i=0; i<Math.min(newAnswer.length, this.grid.length); ++i) {
            row = gridStart.row + i;
            col = gridStart.col + i;
            if (row >= this.grid.length || col >= this.grid[0].length) {
              break;
            }
            else {
              answerChar = newAnswer.charAt(i);
              answerChar = answerChar === "_" ? "." : answerChar;

              this.grid[row] = this.grid[row].slice(0, col) + answerChar + this.grid[row].slice(col + 1);
            }
          }
        break;
      }
    }
  },

  getGridStartForClue: function(clueNum) {
    var iRow = 0,
        iCol = 0,
        gridStart = this.gridPos;

    for (iRow=0; iRow<this.cleanGrid.length; ++iRow) {
      for (iCol=0; iCol<this.cleanGrid[0].length; ++iCol) {
        if (this.cleanGrid[iRow][iCol] === clueNum) {
          gridStart.row = iRow;
          gridStart.col = iCol;
          gridStart = this.gridPos;
          iRow = this.cleanGrid.length;
          break;
        }
      }
    }

    return gridStart;
  },

  getSelectedAnswerText: function() {
    var answerText = "",
        i = 0,
        row = 0,
        col = 0,
        gridStart = this.getGridStartForClue(this.selection.clueNum);

    if (this.selection.clueDir && gridStart) {
      switch(this.selection.clueDir) {
        case this.DRAG_DIR.UP:
          // Build up to find the answer.
          for (i=0; i<this.grid.length; ++i) {
            row = gridStart.row - i;
            col = gridStart.col + i;
            if (row < 0 || col >= this.grid[0].length) {
              break;
            }
            else {
              answerText += this.grid[row][col] === '.' ? "_" : this.grid[row][col];
            }
          }
        break;

        case this.DRAG_DIR.DOWN:
          // Build down to find the answer.
          for (i=0; i<this.grid.length; ++i) {
            row = gridStart.row + i;
            col = gridStart.col + i;
            if (row >= this.grid.length || col >= this.grid[0].length) {
              break;
            }
            else {
              answerText += this.grid[row][col] === '.' ? "_" : this.grid[row][col];
            }
          }
        break;
      }
    }

    return answerText;
  },

  getSelectedClue: function() {
    var clue = "";

    switch(this.selection.clueDir) {
      case this.DRAG_DIR.UP:
        clue = this.clues.up.hasOwnProperty(this.selection.clueNum) ? this.clues.up[this.selection.clueNum] : null;
      break;

      case this.DRAG_DIR.DOWN:
        clue = this.clues.down.hasOwnProperty(this.selection.clueNum) ? this.clues.down[this.selection.clueNum] : null;
      break;

      default:
        // Invalid. Leave clue blank.
      break;
    }

    return clue;
  },

  getSelectedClueText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.clue : "";
  },
  getSelectedHintText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.hint : "";
  },

  getSelectedHintText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.hint : "";
  },

  resolveRow: function(y) {
    var localY = y - this.top - this.BORDER_WIDTH;

    return Math.floor(this.grid.length * localY / (this.gridImage.height - 2 * this.BORDER_WIDTH));
  },

  resolveCol: function(x) {
    var localX = x - this.left - this.BORDER_WIDTH;

    return Math.floor(this.grid[0].length * localX / (this.gridImage.width - 2 * this.BORDER_WIDTH));
  },

  getXCoordinateForCol: function(col) {
    var toCenterX = (this.gridImage.width - 2 * this.BORDER_WIDTH) / this.grid[0].length * 0.5;

    return Math.round(col * (this.gridImage.width - 2 * this.BORDER_WIDTH) / this.grid[0].length + this.left + this.BORDER_WIDTH + toCenterX);
  },

  getYCoordinateForRow: function(row) {
    var toCenterY = (this.gridImage.height - 2 * this.BORDER_WIDTH) / this.grid.length * 0.5;

    return Math.round(row * (this.gridImage.height - 2 * this.BORDER_WIDTH) / this.grid.length + this.top + this.BORDER_WIDTH + toCenterY);
  },

  getGridLeft: function(col) {
    var left = 0;

    if (col >= 0 && col < this.grid[0].length) {
      left = Math.round(this.left + this.BORDER_WIDTH + col / this.grid[0].length * (this.gridImage.width - 2 * this.BORDER_WIDTH));
    }

    return left;
  },

  getGridTop: function(row) {
    var top = 0;

    if (row >= 0 && row < this.grid.length) {
      top = Math.round(this.top + this.BORDER_WIDTH + row / this.grid.length * (this.gridImage.height - 2 * this.BORDER_WIDTH));
    }

    return top;
  },

  init: function(gridImage, left, top, panelImage, panelLeft, panelTop) {
    this.gridImage = gridImage;
    this.top = top;
    this.left = left;

    this.panelImage = panelImage;
    this.panelTop = panelTop;
    this.panelLeft = panelLeft;

    this.bounds.x = left;
    this.bounds.y = top;
    this.bounds.width = gridImage.width;
    this.bounds.height = gridImage.height;
  },

  selectClue: function(commands) {
    // Select a clue based on the starting row/col
    // and the drag direction.
    var dRow = this.dragDir === this.DRAG_DIR.DOWN ? -1 : +1.
        dCol = -1,
        row = this.dragStart.row,
        col = this.dragStart.col,
        clueNum = null,
        newRow = 0,
        newCol = 0,
        inputCallback = commands.showInput;

    this.selection.clueDir = this.DRAG_DIR.NONE;

    // Move backwards from the starting block, looking for
    // one of the "clue start" blocks, indicated by a number
    // in the grid space.
    newRow = row + dRow;
    newCol = col + dCol;

    while (newCol >= 0 && (newRow >= 0 && newRow < this.grid.length)) {
      row = newRow;
      col = newCol;
      newRow += dRow;
      newCol += dCol;
    }

    if (this.isValidSquare(row, col)) {
      clueNum = /[1-9]/.exec(this.cleanGrid[row][col]);

      clueNum = clueNum && clueNum.length === 1 ? clueNum[0] : null;

      if (clueNum &&
          (this.dragDir === this.DRAG_DIR.UP && ccw.StatePlayClass.UP_CLUES.indexOf(clueNum) >= 0) ||
          (this.dragDir === this.DRAG_DIR.DOWN && ccw.StatePlayClass.DOWN_CLUES.indexOf(clueNum) >= 0)) {
        this.selection.startRow = row;
        this.selection.startCol = col;
        this.selection.clueDir = this.dragDir;
        this.selection.clueNum = clueNum;
        this.commands = commands;
        setTimeout(function() {inputCallback.call(commands)}, this.HIGHLIGHT_DELAY);
        ccw.game.playSound("SWEEP");
      }
    }
  },

  isGridBlocked: function(row, col) {
    return this.isValidSquare(row, col) && this.grid[row][col] !== this.block;
  },

  isValidSquare: function(row, col) {
    return row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length;
  },

  mouseDown: function(x, y, commands) {
    if (commands) {
      commands.startGesture(x, y);
    }

    this.dragStart.row = this.resolveRow(y);
    this.dragStart.col = this.resolveCol(x);
    this.bDragged = false;
    
    return !this.isGridBlocked(this.dragStart.row, this.dragStart.col);
  },

  mouseDrag: function(x, y, commands) {
    var dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragged) {
      if (commands) {
        dragType = commands.checkDrag(x, y);

        switch(dragType) {
          case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
          case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
            commands.executeDrag(dragType);
          break;

          case ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT:
            this.bDragged = true;
            this.dragDir = this.DRAG_DIR.UP;
          break;

          case ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT:
            this.bDragged = true;
            this.dragDir = this.DRAG_DIR.DOWN;
          break;
        }
      }

      if (this.bDragged) {
        this.selectClue(commands);
      }
    }

    return true;
  },

  mouseUp: function(x, y, commands) {
    if (this.bDragged) {

    }

    this.bDragged = false;
    this.dragStart.row = -1;
    this.dragStart.col = -1;

    return true;
  },

  drawLetters: function(gfx) {
    var iRow = 0,
        iCol = 0,
        x = 0,
        y = 0;

    for (iRow=0; iRow<this.grid.length; ++iRow) {
      for (iCol=0; iCol<this.grid[0].length; ++iCol) {
        if (this.grid[iRow][iCol] === this.block ||
            this.grid[iRow][iCol] === '.') {
          continue;
        }
        else {
          x = this.getXCoordinateForCol(iCol);
          y = this.getYCoordinateForRow(iRow);

          ccw.game.sysFontLarge.draw(gfx, this.grid[iRow].charAt(iCol), x, y, joe.Resources.BitmapFont.ALIGN.CENTER, 0.5);

          // TODO: if displaying the solution, add highlights for correct and incorrect answers.
        }
      }
    }
  },

  draw: function(gfx) {
    var row = this.selection.startRow,
        col = this.selection.startCol,
        selectImage = null;

    if (this.gridImage) {

      gfx.drawImage(this.gridImage, this.left, this.top);
      gfx.drawImage(this.panelImage, this.panelLeft, this.panelTop);

      // Draw the letters in the grid.
      this.drawLetters(gfx);

      if (this.selection.clueDir !== this.DRAG_DIR.NONE) {
        selectImage = ccw.game.getImage("HIGHLIGHT_SQUARE");

        while (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length) {
          gfx.drawImage(selectImage, this.getGridLeft(col), this.getGridTop(row));

          col += 1;
          if (this.selection.clueDir === this.DRAG_DIR.UP) {
            row -= 1;
          }
          else {
            row += 1;
          }
        }
      }
    }
  },

  update: function(dt, gameTime) {

  },
});

