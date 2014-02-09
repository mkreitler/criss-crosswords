// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  requires: joe.MathEx.AABBmodule,

  BORDER_WIDTH: 2,
  DRAG_DIR: {NONE:0,
             UP: -1,
             DOWN:1},
  UP_CLUES: "45678",
  DOWN_CLUES: "12345",

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

  block: '*',
  selection: {startRow: -1, startCol: -1, clueDir: 0, clueNum: -1},  // clueDir = DRAG_DIR.NONE

  resolveRow: function(y) {
    var localY = y - this.top - this.BORDER_WIDTH;

    return Math.floor(this.grid.length * localY / (this.gridImage.height - 2 * this.BORDER_WIDTH));
  },

  resolveCol: function(x) {
    var localX = x - this.left - this.BORDER_WIDTH;

    return Math.floor(this.grid[0].length * localX / (this.gridImage.width - 2 * this.BORDER_WIDTH));
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

  selectClue: function() {
    // Select a clue based on the starting row/col
    // and the drag direction.
    var dRow = this.dragDir === this.DRAG_DIR.DOWN ? -1 : +1.
        dCol = -1,
        row = this.dragStart.row,
        col = this.dragStart.col,
        clueNum = null,
        newRow = 0,
        newCol = 0;

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

      if ((this.dragDir === this.DRAG_DIR.UP && this.UP_CLUES.indexOf(clueNum) >= 0) ||
          (this.dragDir === this.DRAG_DIR.DOWN && this.DOWN_CLUES.indexOf(clueNum) >= 0)) {
        this.selection.startRow = row;
        this.selection.startCol = col;
        this.selection.clueDir = this.dragDir;
        this.selection.clueNum = clueNum;
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
        this.selectClue();
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

  draw: function(gfx) {
    var row = this.selection.startRow,
        col = this.selection.startCol,
        selectImage = null;

    if (this.gridImage) {

      gfx.drawImage(this.gridImage, this.left, this.top);
      gfx.drawImage(this.panelImage, this.panelLeft, this.panelTop);

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

