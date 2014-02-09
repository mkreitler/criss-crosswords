/**
 * Captures mouse input and forwards to custom handler.
 */

joe.GUI.CaptureBox = new joe.ClassEx(
  // Static Definition //////////////////////////////////////////////////////
  {
  	captureBoxes: [],

  	addCaptureBox: function(newBox) {
  	  this.captureBoxes.push(newBox);
  	},

  	removeCaptureBox: function(box) {
  	  joe.Utility.erase(this.captureBoxes, box);
  	}
  },

  // Instance Definition ////////////////////////////////////////////////////
  {
    requires: joe.GUI.WidgetModule,

    onColor: "#ffff00",
    offColor: "#0000ff",
    bIsOn: false,
    customDraw: null,

    init: function(x, y, width, height, onColor, offColor, inputCallbacks, customDraw) {
      this.AABBset(x, y, width, height);

      this.onColor = onColor;
      this.offColor = offColor;

      this.inputCallbacks = inputCallbacks || null;
      this.customDraw = customDraw;

      joe.GUI.CaptureBox.addCaptureBox(this);
    },

    press: function() {
      this.bIsOn = true;
    },

    release: function() {
      this.bIsOn = false;
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
    },
    
    destroy: function() {
      joe.GUI.CaptureBox.removeCaptureBox(this);
    },

    isOn: function() {
    	return this.bIsOn && this.widgetActive();
    },

    draw: function(context, worldX, worldY) {
    	var color = this.bIsOn ? this.onColor : this.offColor;

    	if (this.widgetVisible()) {
    		this.AABBoffset(worldX, worldY);

        if ((this.isOn() && this.onColor) || this.offColor) {
        	context.save();

        	this.AABBdraw(context, color);

        	this.strokeStyle = color;

        	context.restore();
        }

        if (this.customDraw) {
          this.customDraw(context, worldX, worldY);
        }
        
      	this.AABBoffset(-worldX, -worldY);
     }
    }
	}
);
