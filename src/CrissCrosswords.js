ccw.GameClass = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
  WINDOW: {MARGIN_VERTICAL: 10,
           BOARD_HEIGHT: 150},

  IMAGES: {WORD_GRID: 0,
           PANEL_CENTER: 1,
           PANEL_RIGHT: 2,
           PANEL_LEFT: 3,
           HIGHLIGHT_SQUARE: 4,
           HIGHLIGHT_CIRCLE: 5,
           HIGHLIGHT_ARROW_RIGHT: 6,
           HIGHLIGHT_ARROW_LEFT: 7,
           INSTRUCTIONS: 8,
           HELP: 9,
           HIGHLIGHT_MENU_LARGE: 10,
           HIGHLIGHT_MENU_MEDIUM: 11,
           HIGHLIGHT_MENU_SMALL: 12
          },

  Z_ORDER: {
  },
},
{
  // Instance Definition //////////////////////////////////////////////////////
  requires: joe.GameState.stateMachine,
  
  sysFont: null,
  sysFontLarge: null,
  titleBack: null,
  titleState: null,
  playState: null,
  images: [],

  getImage: function(whichImage) {
    var index = ccw.GameClass.IMAGES[whichImage];

    return index >= 0 && index < this.images.length ? this.images[index] : null;
  },

  init: function() {
    this.sysFont = joe.Resources.loader.loadBitmapFont(["fonts/book_01.png",
                                                        "fonts/book_02.png"],
                                                        ccw.onResourceLoaded,
                                                        ccw.onResourceLoadFailed,
                                                        this);

    this.sysFontLarge = joe.Resources.loader.loadBitmapFont(["fonts/book_big_01.png",
                                                             "fonts/book_big_02.png",
                                                             "fonts/book_big_03.png"],
                                                             ccw.onResourceLoaded,
                                                             ccw.onResourceLoadFailed,
                                                             this);

    this.titleBack = joe.Resources.loader.loadImage("img/title_back.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this);

    this.images.push(joe.Resources.loader.loadImage("img/grid.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));
    if (joe.Utility.isMobile()) {
      this.images.push(joe.Resources.loader.loadImage("img/panel_center_tablet.png",
                                                      ccw.onResourceLoaded,
                                                      ccw.onResourceLoadFailed,
                                                      this));
    }
    else {
      this.images.push(joe.Resources.loader.loadImage("img/panel_center.png",
                                                      ccw.onResourceLoaded,
                                                      ccw.onResourceLoadFailed,
                                                      this));
    }

    this.images.push(joe.Resources.loader.loadImage("img/panel_right.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/panel_left.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_square.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_circle.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_arrowRight.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_arrowLeft.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    if (joe.Utility.isMobile()) {
      this.images.push(joe.Resources.loader.loadImage("img/instructions_tablet.png",
                                                      ccw.onResourceLoaded,
                                                      ccw.onResourceLoadFailed,
                                                      this));
    }
    else {
      this.images.push(joe.Resources.loader.loadImage("img/instructions_web.png",
                                                      ccw.onResourceLoaded,
                                                      ccw.onResourceLoadFailed,
                                                      this));
    }

    this.images.push(joe.Resources.loader.loadImage("img/menu_help.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_menuLarge.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));    

    this.images.push(joe.Resources.loader.loadImage("img/highlight_menuMedium.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_menuSmall.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    joe.MouseInput.addListener(this);
    joe.KeyInput.addListener(this);
  },

  start: function() {
    this.titleState = new ccw.StateTitleClass();

    this.startTitleState();

    joe.UpdateLoop.start();
    joe.Graphics.start();
  },

  startTitleState: function() {
    this.setState(this.titleState);
  },

  startPlayState: function() {
    this.playState = new ccw.StatePlayClass(this.images[ccw.GameClass.IMAGES.WORD_GRID], this.images[ccw.GameClass.IMAGES.PANEL_CENTER]);
    this.setState(this.playState);
  }
});

ccw.onResourceLoaded = function(resource) {
  if (joe.Resources.loadComplete()) {
    ccw.game.start();
  }
};

ccw.onResourceLoadFailed = function(resourceURL) {
  console.log("Failed to load font resource from " + resourceURL);
};

window.onload = function() {
  ccw.game = new ccw.GameClass();

  // Accept input.
  joe.KeyInput.addListener(ccw.game);
  joe.Multitouch.addListener(ccw.game);
};



