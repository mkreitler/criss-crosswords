ccw.StateTitleClass = new joe.ClassEx({
},
{
  commands: null,

  init: function() {
    this.commands = {
      mouseUp: function(x, y) {
        ccw.game.startPlayState();
      },

      touchDown: function(id, x, y) {
        ccw.game.startPlayState();
      }
    }
  },

  enter: function() {
  },

  exit: function() {
  },

  draw: function(gfx) {
    joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR);
    gfx.drawImage(ccw.game.titleBack, 0, 0);

    if (ccw.game.sysFontLarge) {
      ccw.game.sysFontLarge.draw(gfx,
                                 ccw.STRINGS.TITLE_GREET,
                                 joe.Graphics.getWidth() / 2,
                                 joe.Graphics.getHeight() / 2 - ccw.game.sysFontLarge.height,
                                 joe.Resources.BitmapFont.ALIGN.CENTER);
    }

    if (ccw.game.sysFont) {
      ccw.game.sysFont.draw(gfx,
                            ccw.STRINGS.TITLE_PROMPT,
                            joe.Graphics.getWidth() / 2,
                            joe.Graphics.getHeight() / 2 + ccw.game.sysFontLarge.height,
                            joe.Resources.BitmapFont.ALIGN.CENTER);
    }
  },

  update: function(dt, gameTime) {

  },
});

