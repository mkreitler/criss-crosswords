ccw.GameClass = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
  WINDOW: {MARGIN_VERTICAL: 10,
           BOARD_HEIGHT: 150},

  IMAGES: {WORD_GRID: 0,
           SS_ARROWS: 1,
           SS_CIRCLES: 2,
           SS_SQUARE: 3,
           MSG_PANE: 4,
          },

  Z_ORDER: {
  },
},
{
  // Instance Definition //////////////////////////////////////////////////////
  requires: joe.GameStateClass.stateMachine,
  
  sysFont: null,
  sysFontLarge: null,
  titleBack: null,
  titleState: null,
  playState: null,
  images: [],

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
    this.images.push(joe.Resources.loader.loadImage("img/ss_arrows.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));
    this.images.push(joe.Resources.loader.loadImage("img/ss_circles.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));
    this.images.push(joe.Resources.loader.loadImage("img/ss_square.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));
    this.images.push(joe.Resources.loader.loadImage("img/message_pane.png",
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
    this.playState = new ccw.StatePlayClass(this.images[ccw.GameClass.IMAGES.WORD_GRID]);
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



