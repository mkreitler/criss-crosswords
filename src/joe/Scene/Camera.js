// The camera represents a 2D viewport, defined in terms of height and width,
// that determines which portion of a view gets rendered. The camera manages
// an image into which the visible portion of the associated view is rendered.

joe.Scene.Camera = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
  DEFAULT_TRANSITION_TIME: 1,
},
{
  // Instance Definition //////////////////////////////////////////////////////
  canvas: null,
  destPos: {x:0, y:0},            // Position in the output buffer.
  viewRect: {x:0, y:0, w:0, h:0}, // Window into the layer, determines size of off-screen buffer.
  srcRect: {x:0, y:0, w:0, h:0},  // Window defining region of layer source to render into view buffer.
  drawRect: {x:0, y:0, w:0, h:0, srcOffset: {x:0, y:0}}, // Window we will draw: overlap between viewRect and screen buffer.
  magnification: 1,
  workPoint: {x:0, y:0},
  srcTransInfo: {bTransitioning: false, wantX:0, wantY:0, startX:0, startY:0, elapsedTime:0, duration:0},
  destTransInfo: {bTransitioning: false, wantX:0, wantY:0, startX:0, startY:0, elapsedTime:0, duration:0},

  setSourceTransition: function(wantX, wantY, wantAnchorX, wantAnchorY, transDuration) {
    // TODO: add transition type.
    // TODO: allow transitions to interrupt transitions.
    if (!this.srcTransInfo.bTransitioning) {
      this.srcTransInfo.startX = this.viewRect.x;
      this.srcTransInfo.startY = this.viewRect.y;
      this.srcTransInfo.wantX = wantX - (wantAnchorX || 0);
      this.srcTransInfo.wantY = wantY - (wantAnchorY || 0);
      this.srcTransInfo.elapsedTime = 0;
      this.srcTransInfo.duration = Math.abs(transDuration || joe.Scene.Camera.DEFAULT_TRANSITION_TIME);
      this.srcTransInfo.bTransitioning = true;

      joe.UpdateLoop.addListener(this);
    }
  },

  setDestTransition: function(wantX, wantY, wantAnchorX, wantAnchorY, transDuration) {
    // TODO: add transition type.
    // TODO: allow transitions to interrupt transitions.
    if (!this.destTransInfo.bTransitioning) {
      this.destTransInfo.startX = this.destPos.x;
      this.destTransInfo.startY = this.destPos.y;
      this.destTransInfo.wantX = wantX - (wantAnchorX || 0);
      this.destTransInfo.wantY = wantY - (wantAnchorY || 0);
      this.destTransInfo.elapsedTime = 0;
      this.destTransInfo.duration = Math.abs(transDuration || joe.Scene.Camera.DEFAULT_TRANSITION_TIME);
      this.destTransInfo.bTransitioning = true;

      joe.UpdateLoop.addListener(this);
    }
  },

  isTransitioning: function() {
    return this.srcTransInfo.bTransitioning;
  },

  update: function(dt, gameTime) {
    var param = 0;

    if (this.srcTransInfo.bTransitioning) {
      this.srcTransInfo.elapsedTime += dt * 0.001;
      param = this.srcTransInfo.elapsedTime / this.srcTransInfo.duration;
      this.srcTransInfo.bTransitioning = 1 - param > joe.MathEx.EPSILON;

      if (this.srcTransInfo.bTransitioning) {
        this.setSourcePosition(this.srcTransInfo.startX * (1 - param) + this.srcTransInfo.wantX * param,
                               this.srcTransInfo.startY * (1 - param) + this.srcTransInfo.wantY * param);
      }
      else {
        this.setSourcePosition(this.srcTransInfo.wantX, this.srcTransInfo.wantY);

        if (!this.destTransInfo.bTransitioning) {
          joe.UpdateLoop.removeListener(this);
        }
      }
    }

    if (this.destTransInfo.bTransitioning) {
      this.destTransInfo.elapsedTime += dt * 0.001;
      param = this.destTransInfo.elapsedTime / this.destTransInfo.duration;
      this.destTransInfo.bTransitioning = 1 - param > joe.MathEx.EPSILON;

      if (this.destTransInfo.bTransitioning) {
        this.setDestPosition(this.destTransInfo.startX * (1 - param) + this.destTransInfo.wantX * param,
                             this.destTransInfo.startY * (1 - param) + this.destTransInfo.wantY * param);
      }
      else {
        this.setDestPosition(this.destTransInfo.wantX, this.destTransInfo.wantY);

        if (!this.srcTransInfo.bTransitioning) {
          joe.UpdateLoop.removeListener(this);
        }
      }
    }
  },

  init: function(width, height) {
    this.viewRect.w = Math.max(1, width);
    this.viewRect.h = Math.max(1, height);

    this.clipToScreen();

    this.canvas = joe.Graphics.createOffscreenBuffer(this.viewRect.w, this.viewRect.h, false);
  },

  viewToWorldPos: function(localPos) {
    this.workPoint.x = localPos.x - this.viewRect.x;
    this.workPoint.y = localPos.y - this.viewRect.y;

    return this.workPoint;
  },

  clipToScreen: function() {
    var clipRect = {x:this.destPos.x, y:this.destPos.y, w:this.viewRect.w, h:this.viewRect.h},
        screenRect = {x:0, y:0, w:joe.Graphics.getWidth(), h:joe.Graphics.getHeight()};

    clipRect = joe.MathEx.clip(clipRect, screenRect);

    this.drawRect.x = clipRect.x;
    this.drawRect.y = clipRect.y;
    this.drawRect.w = clipRect.w;
    this.drawRect.h = clipRect.h;
    this.drawRect.srcOffset.x = this.drawRect.x - this.destPos.x;
    this.drawRect.srcOffset.y = this.drawRect.y - this.destPos.y;
  },

  getViewRect: function() {
    return this.viewRect;
  },

  getScreenRect: function() {
    this.clipToScreen();
    return this.drawRect;
  },

  getSourceRect: function() {
    this.srcRect.x = this.viewRect.x;
    this.srcRect.y = this.viewRect.y;
    this.srcRect.w = this.viewRect.w / this.magnification;
    this.srcRect.h = this.viewRect.h / this.magnification;

    return this.srcRect;
  },

  getMagnification: function() {
    return this.magnification;
  },

  setSourcePosition: function(x, y, anchorX, anchorY) {
    anchorX = anchorX || 0;
    anchorY = anchorY || 0;

    this.viewRect.x = x - this.viewRect.w / this.magnification * anchorX;
    this.viewRect.y = y - this.viewRect.h / this.magnification * anchorY;
  },

  setDestPosition: function(x, y, anchorX, anchorY) {
    anchorX = anchorX || 0;
    anchorY = anchorY || 0;

    this.destPos.x = x - this.viewRect.w * anchorX;
    this.destPos.y = y - this.viewRect.h * anchorY;

    this.clipToScreen();
  },

  setMagnification: function(newmagnification) {
    this.magnification = Math.max(0.0001, newmagnification);
  },

  // TODO: add functions to interpolate to new src and dest positions over time.

  getGraphics: function() {
    return this.canvas.getContext('2d');
  },

  draw: function(gfx) {
    if (gfx && this.canvas && this.drawRect.w >= 0 && this.drawRect.h >= 0) {
      gfx.drawImage(this.canvas,
                    this.viewRect.x + this.drawRect.srcOffset.x, this.viewRect.y + this.drawRect.srcOffset.y, this.drawRect.w, this.drawRect.h,
                    this.drawRect.x, this.drawRect.y, this.drawRect.w, this.drawRect.h);
    }
  }
});

