/**
 * Renders a text label.
 */

joe.GUI.Label = new joe.ClassEx(
  // Static Definitions ////////////////////////////////////////////////////////
  {
    DEFAULT_V_SPACE_FACTOR: 0.1,
  },

  // Instance Definitions ///////////////////////////////////////////////////////
  {
    requires: joe.GUI.WidgetModule,

    buffer: null,
    context: null,

    init: function(text, font, x, y, inputCallbacks, anchorX, anchorY, maxWidth, vSpacing) {
      var metrics = null,
          dx = 0,
          dy = 0,
          substrings = [],
          tokens = [],
          curLen = 0,
          tokenLen = 0,
          spaceLen = 0,
          curStrIndex = 0,
          spaceFactorY = 0;

      spacefactorY = vSpacing || joe.GUI.Label.DEFAULT_V_SPACE_FACTOR;

      this.inputCallbacks = inputCallbacks || null;

      joe.assert(font, joe.Strings.ASSERT_LABEL_NO_FONT);
      joe.assert(text, joe.Strings.ASSERT_LABEL_NO_TEXT);

      if (maxWidth) {
        // Break the string into substrings below the maxWidth.
        // TODO: rewrite algorithm to preserve whitespace sequences.
        tokens = text.split(/\s+/);
        spaceLen = font.measureText(' ').width;

        for (i=0; i<tokens.length; ++i) {
          tokenLen = font.measureText(tokens[i]).width;
          if (curLen === 0 || curLen + spaceLen + tokenLen > maxWidth) {
            // First token in string, or need to start a new string.
            joe.assert(tokenLen < maxWidth, joe.Strings.ASSERT_LABEL_OVERFLOW);

            substrings.push(tokens[i]);
            curStrIndex = substrings.length - 1;
            curLen = tokenLen;
          }
          else {
            joe.assert(curLen + spaceLen + tokenLen < maxWidth, joe.Strings.ASSERT_LABEL_OVERFLOW);
            // We can continue to build the current substring.
            substrings[curStrIndex] += " " + tokens[i];
            curLen += spaceLen + tokenLen;
          }
        }
      }
      else {
        substrings.push(text);
      }

      for (i=substrings.length - 1; i>=0; --i) {
        metrics = font.measureText(substrings[i]);
        dx = Math.max(dx, metrics.width);

        if (i === 0) {
          dy += metrics.height;
        }
        else {
          dy += metrics.height * (1 + spaceFactorY);
        }
      }

      x = x - dx * (anchorX || 0);
      y = y - dy * (anchorY || 0);

      this.AABBset(x, y, dx, dy);

      this.buffer = joe.Graphics.createOffscreenBuffer(dx, dy);

      context = this.buffer.getContext('2d');

      for (i=0; i<substrings.length; ++i) {
        // Render the text into the buffer.
        font.draw(context, substrings[i], dx * anchorX - font.measureText(substrings[i]).width * anchorX, i * font.height * (1 + spaceFactorY), 0, 1);
      }
    },

    update: function(dt, gameTime) {
      // Nothing to do here...yet.
    },

    draw: function(context, parentX, parentY) {
      context.drawImage(this.buffer, parentX + this.bounds.x, parentY + this.bounds.y);
    }
  }
);