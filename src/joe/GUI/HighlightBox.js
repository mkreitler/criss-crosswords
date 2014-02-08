/**
 * Draws a labeled box and responds to mouse and touch events.
 */

joe.GUI.HighlightBox = new joe.ClassEx(
  // Stati Definition ///////////////////////////////////////////////////////////
  {
    highlightBoxes: [],

    addHighlightBox: function(newBox) {
      this.highlightBoxes.push(newBox);
    },

    removeHighlightBox: function(box) {
      joe.Utility.erase(this.highlightBoxes, box);
    }
  },

  // Instance Definition ////////////////////////////////////////////////////////
  {
    requires: joe.GUI.WidgetModule,

    highlightImage: null,
    bOn: false,

    init: function(x, y, width, height, highlightImage, inputCallbacks) {
      this.AABBset(x, y, width, height);

      this.highlightImage = highlightImage;
      this.inputCallbacks = inputCallbacks || null;

      joe.GUI.HighlightBox.addHighlightBox(this);
    },

    destroy: function() {
      joe.GUI.HighlightBox.removeHighlightBox(this);
    },

    update: function(dt, gameTime, worldX, worldY) {
      // Anything to do here?
    },

    isOn: function() {
      return this.bIsOn && this.widgetActive();
    },

    press: function() {
      this.bIsOn = true;
    },

    release: function() {
      this.bIsOn = false;
    },

    draw: function(context, worldX, worldY) {
      var color = joe.GUI.INACTIVE_COLOR;

      if (context && this.widgetVisible() && this.bIsOn) {
        this.AABBoffset(worldX, worldY);

        context.save();
        context.drawImage(this.highlightImage, this.bounds.x, this.bounds.y);
        context.restore();

        this.AABBoffset(-worldX, -worldY);
      }
    },

    mouseDown: function(x, y) {
      var bConsumed = false;

      if (this.widgetActive() && this.widgetVisible()) {
        this.press();

        this.widgetInputHandlers.mouseDown.call(this, x, y);

        bConsumed = true;
      }

      return bConsumed;
    },

    mouseUp: function(x, y) {
      var bConsumed = false;

      if (this.widgetActive() && this.widgetVisible()) {
        this.release();

        this.widgetInputHandlers.mouseUp.call(this, x, y);

        bConsumed = true;
      }

      return bConsumed;
    }
  }
);
