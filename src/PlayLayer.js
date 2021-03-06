ccw.PlayLayerClass = new joe.ClassEx({
  PANES: {LEFT: 0,
          CENTER: 1,
          RIGHT: 2,
          LEFT_REPEAT: 3},

  FUDGE_HELP_Y: 2,
  FUDGE_LEFT_ARROWS_X: 1,
  FUDGE_RIGHT_ARROWS_X: 0,
  FUDGE_CENTER_ARROWS_Y: 6,
  FUDGE_HELP_Y_SIDE_PANELS: 3,
  FUDGE_BOTTOM_PANEL_Y: 3,

  VERTICAL_SPACING: 64,
  MAX_WIDTH: joe.Graphics.getWidth() * 0.9,
},
{
  requires: joe.Scene.LayerInterface,

  CLUE_HIGHLIGHT_ALPHA: 0.8,
  CLUE_HIGHLIGHT_COLOR: "#008080",
  CLUE_HIGHLIGHT_LINEWIDTH: 8,

  wordGrid: null,
  paneIndex: 0, // Corresponds to PANES.CENTER
  widgets: [],
  paneOffsetX: [],
  labels: [],
  newLabel: null,
  guiManager: null,
  curContext: "CENTER",
  selectedClueLabel: null,
  bDragged: false,

  updateSelectedAnswer: function(newAnswer) {
    if (this.wordGrid) {
      this.wordGrid.updateSelectedAnswer(newAnswer);
    }
  },

  getSelectedClueText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedClueText() : "";
  },

  getSelectedHintText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedHintText() : "";
  },

  getSelectedAnswerText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedAnswerText() : "";
  },

  setGuiContext: function(whichContext) {
    joe.assert(this.guiManager && ccw.PlayLayerClass.PANES.hasOwnProperty(whichContext), joe.Strings.ASSERT_INVALID_ARGS);

    this.guiManager.setContext(this.widgets[ccw.PlayLayerClass.PANES[whichContext]]);
    this.curContext = whichContext;
  },

  unselectWordGrid: function() {
    if (this.wordGrid) {
      this.wordGrid.unselect();
    }

    this.unselectClueLabel();
  },

  unselectClueLabel: function() {
    this.selectedClueLabel = null;
  },

  mouseDown: function(x, y) {
    return this.guiManager.mouseDown(x, y);
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    return this.guiManager.mouseUp(x, y);
  },

  shiftGuiContextLeft: function() {
    this.unselectClueLabel();

    switch(this.curContext) {
      case "CENTER":
        this.setGuiContext("LEFT");
      break;

      case "LEFT":
        this.setGuiContext("RIGHT");
      break;

      case "RIGHT":
        this.setGuiContext("CENTER");
      break;

      case "LEFT_REPEAT":
        this.setGuiContext("RIGHT");
      break;
    }
  },

  shiftGuiContextRight: function() {
    this.unselectClueLabel();
    
    switch(this.curContext) {
      case "LEFT":
        this.setGuiContext("CENTER");
      break;

      case "CENTER":
        this.setGuiContext("RIGHT");
      break;

      case "RIGHT":
        this.setGuiContext("LEFT_REPEAT");
      break;

      case "LEFT_REPEAT":
        this.setGuiContext("CENTER");
      break;
    }
  },

  init: function(commandHandler) {
    this.addWidgets(commandHandler);
  },

  getPaneOffsetX: function(paneKey) {
    return this.paneOffsetX[ccw.PlayLayerClass.PANES[paneKey]];
  },

  drawClipped: function(gfx, srcRect, scale) {
    var i = 0,
        curWidgets = this.widgets[ccw.PlayLayerClass.PANES[this.curContext]],
        clueBounds = null,
        screenWidth = joe.Graphics.getWidth();

    joe.assert(gfx && srcRect, joe.Strings.ASSERT_INVALID_ARGS);

    joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR, gfx, srcRect.w, srcRect.h)

    gfx.save();

    scale = scale || 1;
    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    for (i=this.labels.length-1; i>=0; --i) {
      this.labels[i].draw(gfx, 0, 0);
    }

    this.guiManager.setViewOffset(srcRect.x, srcRect.y);
    this.guiManager.setClipRect(srcRect);
    this.guiManager.draw(gfx);

    // HACK: during sliding transitions, we force the guiManager
    // to draw all its elements, so that those that are "out of
    // context" draw as they move into the viewport's visible area.
    if (this.parent.isTransitioning()) {
      // Draw all gui elements.
      for (i=0; i<this.widgets.length; ++i) {
        if (this.widgets[i] !== curWidgets) {
          this.guiManager.setContext(this.widgets[i]);
          this.guiManager.draw(gfx);
        }
      }

      this.guiManager.setContext(curWidgets);
    }

    if (this.selectedClueLabel) {
      clueBounds = this.selectedClueLabel.AABBgetRectRef();
      if (joe.MathEx.clip(clueBounds, srcRect)) {
        gfx.globalAlpha = this.CLUE_HIGHLIGHT_ALPHA;
        gfx.strokeStyle = this.CLUE_HIGHLIGHT_COLOR;
        gfx.lineWidth = this.CLUE_HIGHLIGHT_LINEWIDTH;
        gfx.beginPath();
        gfx.rect(Math.floor(clueBounds.x + clueBounds.w * 0.5 - screenWidth * 0.5), clueBounds.y, screenWidth + 1, clueBounds.h);
        gfx.stroke();
        gfx.globalAlpha = 1;
      }
    }

    gfx.restore();
  },

  highlightClue: function(x, y, commands) {
    if (commands) {
      commands.startGesture(x, y);
    }

    if (this.wordGrid && this.guiManager) {
      this.selectedClueLabel = this.guiManager.getWidgetAt(x, y);
    }

    this.bDragged = false;

    return true;
  },

  clueListDrag: function(x, y, commands) {
    var dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragged) {
      if (commands) {
        dragType = commands.checkDrag(x, y);

        if (dragType !== ccw.PlayCommandsClass.SWIPE_TYPE.NONE) {
          this.unselectClueLabel();
        }

        switch(dragType) {
          case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
          case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
            commands.executeDrag(dragType);
            this.bDragged = true;
          break;
        }
      }
    }

    return true;
  },

  selectClue: function(x, y, bUp, clueIndex, commandHandler) {
    var endClue = null;

    this.bDragged = false;

    if (!commandHandler.isSliding()) {
      this.bDragged = false;

      if (this.wordGrid && this.guiManager) {
        endClue = this.guiManager.getWidgetAt(x, y);

        if (endClue === this.selectedClueLabel) {
          if (!this.wordGrid.selectFromClueList(bUp, clueIndex, commandHandler)) {
            this.unselectClueLabel();
          }
        }
        else {
          this.unselectClueLabel();
        }
      }
    }
    else {
      this.unselectClueLabel();
    }

    return true;
  },

  addWidgets: function(commandHandler) {
    var midPane = joe.Graphics.getWidth() * 0.5,
        curY = 0,
        i = 0,
        x = 0,
        y = 0,
        gridImage = null,
        panelImage = null,
        topMargin = 0,
        highlightImage = null,
        panelOffsets = [],
        lastWidget = null,
        buttonImg = null,
        theWordGrid = null,
        self = this,
        downClueHandlers = [
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(0), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(1), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(2), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(3), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(4), commandHandler);}}
        ],
        upClueHandlers = [
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(0), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(1), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(2), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(3), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(4), commandHandler);}}
        ];

    this.guiManager = new joe.GuiClass();

    buttonImage = ccw.game.getImage("WORD_GRID");
    topMargin = (joe.Graphics.getWidth() - buttonImage.width) * 0.5;

    // Layout the layer: down clues, up clues, grid, down clues (repeat for wraparound).
    // LEFT PANE: -------------------------------------------------------------
    // "Down Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, downClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[0], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());

    // CENTER PANE: -----------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // The word grid.
    gridImage = ccw.game.getImage("WORD_GRID");
    panelImage = ccw.game.getImage("PANEL_CENTER");
    this.wordGrid = new ccw.WordGridClass(gridImage,
                                          midPane - gridImage.width * 0.5,
                                          topMargin,
                                          panelImage,
                                          midPane - panelImage.width * 0.5,
                                          topMargin * 2 + gridImage.height + ccw.PlayLayerClass.FUDGE_BOTTOM_PANEL_Y);
    this.labels.push(this.wordGrid);

    this.makeHelpButtons(midPane, topMargin, commandHandler);

    // Word grid capture box.
    x = Math.round(midPane - buttonImage.width * 0.5);
    y = topMargin;
    theWordGrid = this.wordGrid;
    lastWidget = this.guiManager.addWidget(new joe.GUI.CaptureBox(x,
                                                                  y,
                                                                  buttonImage.width,
                                                                  buttonImage.height,
                                                                  null,
                                                                  null,
                                                                  {
                                                                    mouseDown: function(x, y) {
                                                                      return theWordGrid.mouseDown(x, y, commandHandler);
                                                                    },
                                                                    mouseDrag: function(x, y) {
                                                                      return theWordGrid.mouseDrag(x, y, commandHandler);
                                                                    },
                                                                    mouseUp: function(x, y) {
                                                                      return theWordGrid.mouseUp(x, y, commandHandler);
                                                                    }
                                                                  },
                                                                  null));   
    this.widgets.push(this.guiManager.newContext());

    // RIGHT PANE: ------------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();

    // "Up Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.UP_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.UP_CLUES[i].clue, ccw.game.sysFont, midPane, curY, upClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_RIGHT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_RIGHT");

      gfx.drawImage(img, panelOffsets[1], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());

    // LEFT_REPEAT PANE: ------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // "Down clue" label.
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, downClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[2], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());
  },

  makeHelpButtons: function(midPane, topMargin, commandHandler) {
    var buttonImage = null,
        x = 0,
        y = 0;

    // The help button.
    buttonImage = ccw.game.getImage("HIGHLIGHT_CIRCLE");
    x = Math.round(midPane - buttonImage.width * 0.5);
    y = Math.round(joe.Graphics.getHeight() - topMargin - buttonImage.height + ccw.PlayLayerClass.FUDGE_HELP_Y);
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseDown: function(x, y) {
                                                                        ccw.game.playSound("CLICK_HIGH");
                                                                        return true;
                                                                      },
                                                                      mouseUp: function(x, y) {
                                                                      commandHandler.showHelp();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
    // Left arrow.
    buttonImage = ccw.game.getImage("HIGHLIGHT_ARROW_LEFT");
    x = Math.round(midPane - joe.Graphics.getWidth() * 0.5 + topMargin - ccw.PlayLayerClass.FUDGE_LEFT_ARROWS_X);
    y +=  ccw.PlayLayerClass.FUDGE_CENTER_ARROWS_Y;
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseUp: function(x, y) {
                                                                      commandHandler.slideLeft();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
    // Right arrow.
    buttonImage = ccw.game.getImage("HIGHLIGHT_ARROW_RIGHT");
    x = Math.round(midPane + joe.Graphics.getWidth() * 0.5 - topMargin - buttonImage.width + ccw.PlayLayerClass.FUDGE_RIGHT_ARROWS_X);
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseUp: function(x, y) {
                                                                      commandHandler.slideRight();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
  }
});

