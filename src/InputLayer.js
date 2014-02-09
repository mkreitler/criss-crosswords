// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InputLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  backImage: null,
  commands: null,

  init: function(commands) {
    this.backImage = ccw.game.getImage("INSTRUCTIONS");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(this.backImage, 0, 0);

    gfx.restore();
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    this.commands.hideInstructions();
    return true;
  },

  touchUp: function(id, x, y) {
    return this.mouseUp(x, y);
  }
});
