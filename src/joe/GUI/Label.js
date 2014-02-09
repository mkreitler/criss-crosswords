/**
 * Renders a text label.
 */

joe.GUI.Label = new joe.ClassEx(
  // Static Definitions ////////////////////////////////////////////////////////
  {
    DEFAULT_V_SPACE_FACTOR: 0.1,
    DEFAULT_CURSOR_SPACING: 0.75,
  },

  // Instance Definitions ///////////////////////////////////////////////////////
  {
    requires: joe.GUI.WidgetModule,

    buffer: null,
    context: null,
    font: null,
    maxWidth: joe.Graphics.getWidth(),
    vSpacing: 0,
    anchorX: 0,
    anchorY: 0,
    text: null,
    cursorChar: null,
    cursorPos: 0,
    cursorSpacing: 0,

    init: function(text, font, x, y, inputCallbacks, anchorX, anchorY, maxWidth, vSpacing, cursorChar, cursorPos, cursorSpacing) {
      this.font = font;
      this.inputCallbacks = inputCallbacks || null;
      this.maxWidth = maxWidth || joe.Graphics.getWidth();
      this.vSpacing = vSpacing || joe.GUI.Label.DEFAULT_V_SPACE_FACTOR;
      this.cursorChar = cursorChar || null;
      this.cursorPos = cursorPos || 0;
      this.cursorSpacing = cursorSpacing || joe.GUI.Label.DEFAULT_CURSOR_SPACING;

      this.setText(text, font, x, y, anchorX, anchorY, maxWidth, vSpacing);
    },

    setCursor: function(pos, char, spacing) {
      this.cursorPos = pos || 0;
      this.cursorChar = char || this.cursorChar;
      this.cursorSpacing = spacing || this.cursorSpacing;
    },

    getText: function() {
      return this.text;
    },

    setText: function(text, font, x, y, anchorX, anchorY, maxWidth, vSpacing) {
      var metrics = null,
          dx = 0,
          dy = 0,
          substrings = [],
          tokens = [],
          curLen = 0,
          tokenLen = 0,
          spaceLen = 0,
          curStrIndex = 0,
          spaceFactorY = 0,
          bounds = this.AABBgetRef();

      // Supply defaults (so caller doesn't have to supply old
      // info when changing text).
      vSpacing = vSpacing || this.vSpacing;
      spacefactorY = vSpacing || joe.GUI.Label.DEFAULT_V_SPACE_FACTOR;
      font = font || this.font;
      maxWidth = maxWidth || this.maxWidth;
      anchorX = anchorX || this.anchorX;
      anchorY = anchorY || this.anchorY;
      x = x || (bounds.x + bounds.width * this.anchorX);
      y = y || (bounds.y + bounds.height * this.anchorY);
      anchorX = anchorX || 0;
      anchorY = anchorY || 0;

      this.text = text;
      this.vSpacing = vSpacing;
      this.font = font;
      this.maxWidth = maxWidth;
      this.anchorX = anchorX;
      this.anchorY = anchorY;

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

      x = Math.round(x);
      y = Math.round(y);
      dx = Math.round(dx);
      dy = Math.round(dy);

      this.AABBset(x, y, dx, dy);

      this.buffer = joe.Graphics.createOffscreenBuffer(dx, dy);

      context = this.buffer.getContext('2d');

      for (i=0; i<substrings.length; ++i) {
        // Render the text into the buffer.
        font.draw(context,
                  substrings[i],
                  Math.round(dx * anchorX - font.measureText(substrings[i]).width * anchorX),
                  Math.round(i * font.height * (1 + spaceFactorY)),
                  0, 1);
      }
    },

    update: function(dt, gameTime) {
      // Nothing to do here...yet.
    },

    draw: function(context, parentX, parentY) {
      var cursorSize = null,
          bounds = null,
          cursorX = 0,
          cursorY = 0,
          foreString = null,
          atString = null;

      context.drawImage(this.buffer, parentX + this.bounds.x, parentY + this.bounds.y);

      if (this.cursorChar && this.cursorPos >= 0 && this.cursorPos < this.text.length) {
        // TODO: fix to work with multi-line text.
        cursorSize = this.font.measureText(this.cursorChar);
        bounds = this.AABBgetRef();
        cursorY = bounds.y + bounds.height + cursorSize.height * this.vSpacing;

        foreString = this.font.measureText(this.text.substr(0, this.cursorPos)).width;
        atString = this.font.measureText(this.text.substr(0, this.cursorPos + 1)).width

        cursorX = Math.round(bounds.x + foreString + (atString - foreString) * 0.5);
        this.font.draw(context, this.cursorChar, cursorX, cursorY, joe.Resources.BitmapFont.ALIGN.CENTER, this.cursorSpacing);
      }
    }
  }
);