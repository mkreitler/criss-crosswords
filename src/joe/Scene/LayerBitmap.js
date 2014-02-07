// The BitmapLayer renders a single bitmap into a scene.
// This is useful for displaying a background, for example.

joe.Scene.LayerBitmap = new joe.ClassEx({
},
{
  requires: joe.Scene.LayerInterface,

  bitmap: null,

  init: function(bitmap) {
    joe.assert(bitmap instanceof Image);

    this.bitmap = bitmap;
  },

  drawClipped: function(gfx, srcRect, scale) {
    joe.assert(this.bitmap && this.bitmap instanceof Image, joe.STRINGS.ASSERT_LAYER_BMP_INVALID_BITMAP);

    scale = scale || 1;

    gfx.save();

    if (Math.abs(scale - 1) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.drawImage(this.bitmap, srcRect.x, srcRect.y, srcRect.w, srcRect.h,
                  0, 0, srcRect.w, srcRect.h);
    gfx.restore();
  }
}
);

