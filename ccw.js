// Define a namespace for PhysWiz.

var ccw = {};
var gameWidth = 768;
var gameHeight = 1024;
// Define a namespace for the engine.
var joe = {};

joe.Utility = {};

joe.Utility.erase = function(array, item) {
  var iRemove = -1;
  var i = 0;
  
  if (array instanceof Array) {
    iRemove = array.indexOf(item);
    
    if (iRemove >= 0) {
      for (i=iRemove; i<array.length - 1; ++i) {
        array[i] = array[i + 1];
      }
      
      array.length = array.length - 1;
    }
  }
};

joe.Utility.fastErase = function(array, item) {
  var iRemove = array ? array.indexOf(item) : -1;

  if (iRemove >= 0) {
    array[iRemove] = array[array.length - 1];
    array.length = array.length - 1;
  }
};

joe.Utility.getPageWidth = function() {
  return Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]) || window.innerWidth;
};

joe.Utility.getPageHeight = function() {
  return Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]) | window.innerHeight;
};

joe.Utility.isMobile = function() {
  return navigator && navigator.isCocoonJS;
};
joe.Strings = {
  ASSERT_DEFAULT_MESSAGE: "Assertion failed!",
  ASSERT_DISMISSAL: "\n\nHit 'yes' to debug.",
  ASSERT_LABEL_NO_FONT: "Invalid font during label creation!",
  ASSERT_LABEL_NO_TEXT: "Invalid text during label creation!",
  ASSERT_LABEL_OVERFLOW: "Can't break string before length exceeded!",
  ASSERT_INVALID_ARGS: "Invalid arguments in function!",
  ASSERT_LAYER_BMP_INVALID_BITMAP: "Invalid bitmaps!",
  ASSERT_VIEW_NO_CAMERA_AVAILABLE: "No camera available!",
};
// ClassEx provides a means to create new constructors.
// It supports object compositing via "modules".

joe.assert = function(condition, message) {
  if (!condition) {
    if (joe.Utility.isMobile()) {
      console.log(message || joe.Strings.ASSERT_DEFAULT_MESSAGE);
    }
    else if (confirm(message + joe.Strings.ASSERT_DISMISSAL)) {
      debugger;
    }
  }
};

joe.loadModule = function(module) {
  var key = null;

  for (key in module) {
    this[key] = module[key];
  }
};

joe.ClassEx = function(classModules, instanceModules) {
  var classMods = classModules; 
  var instMods = instanceModules;

  var _class = function() {
    joe.ClassEx.extendVariables(this, instMods);

    // Call the new class' 'init' method 
    this.init.apply(this, arguments);
  };

  classModules = joe.ClassEx.include(classModules);
  instanceModules = joe.ClassEx.include(instanceModules);

  joe.ClassEx.staticInit(classModules);
  joe.ClassEx.staticInit(instanceModules);

  // Make the prototype object available to the class and
  // its instances outside of construction time.
  _class.static = _class.prototype;
  _class.prototype.static = _class.prototype;

  // Provide a default 'init' method.
  _class.prototype.init = function() {};

  _class.prototype.loadModule = joe.loadModule;

  // Copy instance-level functions into the class prototype.
  joe.ClassEx.extendMethods(_class.static, instanceModules);

  // Copy class data and methods into the new class.
  joe.ClassEx.extend(_class, classMods);

  return _class;
};

// Resolve 'requires' directives into a master list of modules.
joe.ClassEx.include = function(modules) {
  var modulesArray = null,
      key = null,
      module = null,
      i = 0,
      il = 0,
      j = 0,
      jl = 0,
      includes = null,
      included = [];
      extraModules = [];

  if (modules) {
    if (!(modules instanceof Array)) {
      modulesArray = [];
      modulesArray.push(modules);
    }
    else {
      modulesArray = modules;
    }

    for (i=0, il=modulesArray.length; i<il; ++i) {
      // Are there any 'includes'?
      includes = modulesArray[i]["requires"];
      if (includes) {
        // Yes. Add them to the list of modules.
        if (includes instanceof Array) {
          for (j=0, jl=includes.length; j<jl; ++j) {
            if (included.indexOf(includes[j])) {
              joe.assert(false, 'Circular dependency during include process!');
            }
            else {
              included.push(includes[j]);
              extraModules.push(includes[j]);
            }
          }
        }
        else {
          extraModules.push(includes);
        }
      }
    }

    if (extraModules.length) {
      // Found depdendencies. Recurse into them to handle
      // hierarchical dependencies.
      extraModules = joe.ClassEx.include(extraModules);
    }

    // Insert required modules into the start of the module array
    // (allows classes to override included methods).
    for (i=0; i<extraModules.length; ++i) {
      modulesArray.unshift(extraModules[i]);
    }
  }

  return modulesArray;
},

joe.ClassEx.staticInit = function(modules) {
  var modulesArray = modules && (modules instanceof Array) ? modules : null,
      i = 0;

  if (modules) {
    if (!modulesArray) {
      modulesArray = [];
      modulesArray.push(modules);
    }

    for (i=0; i<modulesArray.length; ++i) {
      if (modulesArray[i].staticInit) {
        modulesArray[i].staticInit();
      }
    }
  }
};

joe.ClassEx.extend = function(object, modules) {
  joe.ClassEx.extendVariables(object, modules);
  joe.ClassEx.extendMethods(object, modules);
};

// Copy functions from the specified module into the
// _class prototype.
joe.ClassEx.extendMethods = function(object, modules) {
  var key = null;
  var i = 0;
  var newModules = null;

  if (modules) {

    if (!(modules instanceof Array)) {
      newModules = [];
      newModules.push(modules);
      modules = newModules;
    }

    for (i=0; i<modules.length; ++i) {
      if (object && modules[i]) {
        for (key in modules[i]) {
          if (typeof(modules[i][key]) === "function") {
            object[key] = joe.ClassEx.cloneInstanceVars(modules[i][key]);
          }
        }
      }
    }
  }
};
// Copy instance variables into the current object.
joe.ClassEx.extendVariables = function(object, modules, bIgnoreRequires) {
  var key = null;
  var i = 0;
  var module = null;

  if (modules && object) {

    if (!(modules instanceof Array)) {
      newModules = [];
      newModules.push(modules);
      modules = newModules;
    }

    for(i=0; i<modules.length; ++i) {

      module = modules[i];

      for (key in module) {
        if (key === "requires") {
          if (!bIgnoreRequires) {
            joe.ClassEx.extendVariables(object, joe.ClassEx.include(module[key]), true);
          }
        }
        else if (typeof(module[key]) !== "function") {
          joe.assert(!(object[key]), "Found duplicate object during instantiation.");
          object[key] = joe.ClassEx.cloneInstanceVars(module[key]);
        }
      }
    }
  }
};

// Snippet taken from Code Dojo:
// http://davidwalsh.name/javascript-clone
joe.ClassEx.cloneInstanceVars = function(src) {
  function mixin(dest, source, copyFunc) {
    var name, s, i, empty = {};
    
    for(name in source){
      // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
      // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
      // don't overwrite it with the toString() method that source inherited from Object.prototype

      // Skip the 'requires' keyword. It has already been processed.
      if (name === 'requires') {
        continue;
      }

      s = source[name];
      if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
        dest[name] = copyFunc ? copyFunc(s) : s;
      }
    }
    return dest;
  }
  
  if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
    // Don't want to proces null, undefined, any non-object, or function
    return src;
  }
  if(src.nodeType && "cloneNode" in src){
    // DOM Node
    return src.cloneNode(true); // Node
  }
  if(src instanceof Date){
    // Date
    return new Date(src.getTime());	// Date
  }
  if(src instanceof RegExp){
    // RegExp
    return new RegExp(src);   // RegExp
  }
  var r, i, l;
  if(src instanceof Array){
    // array
    r = [];
    for(i = 0, l = src.length; i < l; ++i){
      if(i in src){
        r.push(joe.ClassEx.cloneInstanceVars(src[i]));
      }
    }
  }else{
    // generic objects
    r = src.constructor ? new src.constructor() : {};
  }
  return mixin(r, src, joe.ClassEx.cloneInstanceVars);
};// [HELP]
// Extend existing joe objects with this module to support the use of listeners.</em>
//
// <strong>Interface</strong>
// addListener(listener, fnCompare)
// removeListener(listener)
// removeAllListeners()
// sortListeners(fnCompare)
// callListeners(fnName, ...)
// callListenersUntilConsumed(fnName, ...)
//
// Usage:
// var myClass = new joe.ClassEx(..., [Listeners, ...]);
//
// var myObj = new myClass();
//
// myObj.addListener(l1);
// myObj.addListener(l2);
// myObj.addListener(l3);
// myObj.sortListeners(function(l1, l2) {
//   return l1.getOrder() < l2.getOrder() ? l1 : l2;
// });


joe.Listeners = {
  listeners: [],
  
  addListener: function(theListener, fnCompare) {
    if (theListener) {
      this.listeners.push(theListener);
      if (fnCompare) {
        this.sortListeners(fnCompare);
      }
    }
  },
  
  removeListener: function(theListener) {
    joe.Utility.fastErase(this.listeners, theListener);
  },
 
  removeAllListeners: function() {
    this.listeners.length = 0;
  },
  
  sortListeners: function(fnCompare) {
    var iInner = 0;
    var iOuter = 0;
    var minIndex = 0;
    var smallest = null;
        
    if (fnCompare && this.listeners.length > 1) {
      minIndex = iOuter;
      
      for (iOuter = 0; iOuter < this.listeners.length - 1; iOuter += 1) {
        for (iInner = iOuter + 1; iInner < this.listeners.length; ++iInner) {
          smallest = fnCompare.apply(this.listeners[minIndex], this.listeners[iInner]);
          
          if (smallest === this.listeners[iInner]) {
            minIndex = iInner;
          }
        }
        
        if (minIndex !== iOuter) {
          this.listeners[minIndex] = this.listeners[iOuter];
          this.listeners[iOuter] = smallest;
        }
      }
    }
  },
  
  callListeners: function(fnName) {
    var iListener = 0;
    var args = Array.prototype.slice.call(arguments);
    
    // Remove the function from the arguments list.
    args.shift();
    
    if (fnName) {
      for (iListener = 0; iListener < this.listeners.length; ++iListener) {
        if (this.listeners[iListener][fnName]) {
          this.listeners[iListener][fnName].apply(this.listeners[iListener], (args));
        }
      }
    }
  },
  
  callListenersUntilConsumed: function(fnName) {
    var iListener = 0;
    var args = Array.prototype.slice.call(arguments);
    var bConsumed = false;
    
    // Remove the function from the arguments list.
    args.shift();
    
    if (fnName) {
      for (iListener = 0; iListener < this.listeners.length; ++iListener) {
        if (this.listeners[iListener][fnName]) {
          bConsumed = this.listeners[iListener][fnName].apply(this.listeners[iListener], (args));
          
          if (bConsumed) {
            break;
          }
        }
      }
    }
    
    return bConsumed;
  }
};
// Provides access to the canvas.
//
// Usage:
// <pre>var newRenderObj = {
//   draw: function(graphics) {
//     graphics.lock();
//     /* Do drawing stuff here. */
//     graphics.unlock();
//   }
// }</pre>
// graphics.addListener(newRenderObj);
// graphics.start();
//
// <strong>Notes</strong>
// Update code adapted from Paul Irish's <a href="http://paulirish.com/2011/requestanimationframe-for-smart-animating/" target=_blank>article</a> on 'requestAnimFrame':
// [END HELP] 

// Create an on-screen canvas into which we'll render.
joe._gfx = {
  styles: window.frameElement ? window.frameElement.getAttribute("style").split(";") : null,
  i: 0,
  curStyle: null,
  index: -1,
  width: 0,
  height: 0
};

// From Paul Irish's article on 'requestAnimFrame':
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//
// Shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ) {
            window.setTimeout(callback, 1000 / 60);
          };
});

joe.GraphicsClass = new joe.ClassEx(null, [
  joe.Listeners,
  {
    gameCanvas: null,
    activeContext: null,
    buffers: [],
    bWantsToRender: false,
    newBufferCount: 0,
    screenContext: null,
    wantWidth: 0,
    wantHeight: 0,
    globalScale: 1,
    globalAlpha: 1,

    init: function(wantWidth, wantHeight) {

      this.wantWidth = wantWidth;
      this.wantHeight = wantHeight;

      // Create the game canvas (what we actually see).
      this.resizeCanvas();

      // Create the back buffer (what we render the game into).
      this.createOffscreenBuffer(wantWidth, wantHeight, true);
    },

    setGlobalAlpha: function(newAlpha) {
      if (this.activeContext) {
        this.activeContext.globalAlpha = newAlpha;
      }
    },

    resizeCanvas: function() {
      if (document.body) {
        var pageWidth = joe.Utility.getPageWidth(),
            pageHeight = joe.Utility.getPageHeight(),
            bAppendCanvas = !this.gameCanvas,
            wantAspectRatio = this.wantWidth / Math.max(1, this.wantHeight),
            aspectRatio = pageWidth / Math.max(1, pageHeight),
            width = this.wantWidth,
            height = this.wantHeight;

        if (aspectRatio < wantAspectRatio) {
          // The actual screen is narrower than the desired display.
          // In this case, we'll crop the height and scale to the
          // actual width.
          this.globalScale = pageWidth / this.wantWidth;
        }
        else {
          // The actual screen is wider (or exactly equal to) the
          // desired display. In this case we'll crop the width and
          // scale to the actual height.
          this.globalScale = pageHeight / this.wantHeight;
        }

        if (!this.gameCanvas) {
          this.gameCanvas = document.createElement(joe.Utility.isMobile() ? 'screencanvas' : 'canvas');
//          this.gameCanvas = document.createElement("canvas");
        }

        width = Math.round(width * this.globalScale);
        height = Math.round(height * this.globalScale);

        this.gameCanvas.setAttribute('width', width);
        this.gameCanvas.setAttribute('height', height);
        this.gameCanvas.setAttribute('id', 'gameCanvas');

        this.gameCanvas.style.position = "absolute";

        this.gameCanvas.style.left = Math.round((pageWidth - width) * 0.5) + "px";
        this.gameCanvas.style.top = Math.round((pageHeight - height) * 0.5) + "px";

        if (bAppendCanvas) {
          document.body.appendChild(this.gameCanvas);
        }

        this.setCanvas(this.gameCanvas);
      }
    },

    render: function() {
      var i;  // Dummy text node used to force WebKit browsers to refresh the canvas.
      
      if (this.bWantsToRender) {
        window.requestAnimFrame()(this.render.bind(this));
      }

      this.callListeners("draw", this.activeContext);

      if (this.activeContext !== this.screenContext) {
        this.screenContext.save();
        this.screenContext.scale(this.globalScale, this.globalScale);
        this.screenContext.drawImage(this.activeContext.canvas, 0, 0);
        this.screenContext.restore();
      }

      // var bStyle = document.body.style;
      // bStyle.backgroundColor = "#fad";

      // Force webkit browsers to refresh the page.
      // document.body.removeChild(document.body.appendChild(document.createElement('style')));      
      // document.body.style.webkitTransform = 'scale(1)';
      // this.gameCanvas.style.webkitTransform = 'scale(1)';

      // var n = document.createTextNode(' ');
      // this.gameCanvas.appendChild(n);
      // setTimeout(function(){n.parentNode.removeChild(n);}, 0);
    },

    setCanvas: function(newCanvas) {
      if (newCanvas) {
        this.gameCanvas = newCanvas;
        // The basic graphics object is the context of the primary canvas.
        this.screenContext = this.gameCanvas.getContext('2d');
        this.activeContext = this.screenContext;
      }
    },

    getCanvas: function() {
      return this.gameCanvas;
    },

    getScreenWidth: function() {
      return this.gameCanvas ? this.gameCanvas.width : 0;
    },

    getScreenHeight: function() {
      return this.gameCanvas ? this.gameCanvas.height : 0;
    },

    getWidth: function() {
      return this.wantWidth;
    },

    getHeight: function() {
      return this.wantHeight;
    },

    createOffscreenBuffer: function(width, height, setAsActive) {
      var offscreenBuffer = this.newCanvas(width || this.gameCanvas.width, height || this.gameCanvas.height);

      if (setAsActive) {
        this.setActiveBuffer(offscreenBuffer);
      }

      return offscreenBuffer;
    },

    destroyBuffer: function(buffer) {
      joe.Utility.erase(this.buffers, buffer);
    },

    setActiveBuffer: function(buffer) {
      this.activeContext = buffer ? buffer.getContext('2d') : this.screenContext;
    },

    getActiveContext: function() {
      return this.activeContext;
    },

    clear: function(buffer, width, height) {
      var targetBuffer = buffer || this.activeContext;
      var clearWidth = width || this.getWidth();
      var clearHeight = height || this.getHeight();
      
      targetBuffer.clearRect(0, 0, clearWidth, clearHeight);
    },

    copyFrom: function(otherBuffer, left, top) {
      this.activeContext.drawImage(otherBuffer, left, top);
    },

    lock: function(buffer) {
      var targetBuffer = buffer || this.activeContext;
      
      targetBuffer.save();
    },

    unlock: function(buffer) {
      var targetBuffer = buffer || this.activeContext;
      
      targetBuffer.restore();
    },

    clearToColor: function(color, buffer, width, height) {
      var targetBuffer = buffer || this.activeContext;
      var clearWidth = width || this.getWidth();
      var clearHeight = height || this.getHeight();
      
      targetBuffer.fillStyle = color;
      targetBuffer.fillRect(0, 0, clearWidth, clearHeight);
    },

    newCanvas: function(width, height) {
      this.newBufferCount++;
      var newCanvas = document.createElement("canvas");

      newCanvas.width = width;
      newCanvas.height = height;
      
      this.buffers.push(newCanvas);

      return newCanvas;   
    },

    start: function() {
      this.bWantsToRender = true;
      this.render();
    },

    stop: function() {
      this.bWantsToRender = false;
    }
  }
]);

// gameWidth and gameHeight, if used, should be set in the first file loaded
// into the browser.
joe.Graphics = new joe.GraphicsClass(gameWidth || 1024, gameHeight || 768);


// The UpdateLoop drives the update for all objects in the game.
//
// Usage:
// 
// var myObj = {update: function(dt, gameTime) { /* Do stuff here. */ }};
//
// joe.UpdateLoop.addListener(myObj);
// joe.UpdateLoop.start();
//
// Code adapted from "<a href="http://www.hive76.org/fast-javascript-game-loops" target=_blank>Fast Javascript Game Loops</a>," by Sean MacBeth.
// [END HELP]

joe.UpdateLoop = new joe.ClassEx([
  joe.Listeners, {
// Static Definition
  PRIORITY_INPUT: 1000,
  PRIORITY_PROCESS: 100,
  
  SEC_TO_MS: 1000,
  MS_TO_SEC: 0.001,
  TIME_EPSILON: 10, // 10 ms
  
  timeStep: Math.round(1000 / 60),
  lastTime: 0,
  gameTime: 0,
  elapsedTime: 0,
  interval: null,
  
  setTimeStep: function(newStep) {
    joe.UpdateLoop.timeStep = newStep;
  },
  
  getGameTime: function() {
    return joe.UpdateLoop.gameTime;
  },
  
  update: function() {
    var i;
    var dt;
    var curTime = (new Date).getTime();
    var updateTime;
    
    joe.UpdateLoop.elapsedTime += (curTime - joe.UpdateLoop.lastTime);
    joe.UpdateLoop.lastTime = curTime;
    
    dt = joe.UpdateLoop.timeStep;
    
    while (joe.UpdateLoop.elapsedTime >= dt) {
      // TODO: calculate gameTime.
      joe.UpdateLoop.gameTime += dt;
    
      // Update. For the sake of performance, we iterate the inherited
      // listener list directly, rather than use callListeners(...)
      for (i = 0; i < joe.UpdateLoop.listeners.length; ++i) {
        joe.UpdateLoop.listeners[i].update(dt, joe.UpdateLoop.gameTime);
      }
      
      joe.UpdateLoop.elapsedTime -= dt;
    }
      
    // Compute time to next update, accounting for the amount
    // if time the current update took.
    updateTime = (new Date).getTime() - joe.UpdateLoop.lastTime;
  },
  
  start: function(bOutsideTimer) {
    joe.UpdateLoop.lastTime = (new Date).getTime();
    joe.UpdateLoop.gameTime = 0;

    if (!bOutsideTimer) {
      joe.UpdateLoop.interval = setInterval(joe.UpdateLoop.update, joe.UpdateLoop.timeStep);
    }
  },
  
  stop: function() {
    clearInterval(joe.UpdateLoop.interval);
  },
}],
{
// No instance definitions -- UpdateLoop is a singleton.
});// Provides a singleton that processes keyboard events for the game.
// Handlers should return 'true' if they want to consume the event.
//
// Usage:
//  KeyListener module:
//   keyPress: function(keyCode) {};
//   keyRelease: function(keyCode) {};
//   keyTap: function(keyCode) {};
//   keyHold: function(keyCode) {};
//   keyDoubleTap: function(keyCode) {};
//
// myInstance = new joe.Class();
//
// joe.KeyInput.addListener(myInstance);</pre>


joe.KeyInput = new joe.ClassEx([
  joe.Listeners, {
  // Static Definitions ////////////////////////////////////////////////////////////
  keyState: [],
  doubleTapInterval: 150,
  holdInterval: 333,
  tapInterval: 150,
  
  setDoubleTapInterval: function(newInterval) {
    joe.KeyInput.doubleTapInterval = newInterval;
  },
  
  setHoldInterval: function(newInterval) {
    joe.KeyInput.holdInterval = newInterval;
  },
  
  setTapInterval: function(newInterval) {
    joe.KeyInput.tapInterval = newInterval;
  },
  
  init: function() {
    var key = null;
    var keyCode;
    var maxCode = -1;
    
    // Get the largest recognized keyCode.
    for (key in joe.KeyInput.KEYS) {
      keyCode = joe.KeyInput.KEYS[key];
      if (keyCode > maxCode) {
        maxCode = keyCode;
      }
    }
    
    // Add keyState trackers for all codes up
    // to the largets (many will be unused).
    while (maxCode >= 0) {
      joe.KeyInput.keyState.push({pressed:false, pressCount: 0, pressTime:-1});
      maxCode -= 1;
    }
  },

  update: function(dt, gameTime) {
    // Iterate through the keyStates.
    // For 'pressed' states, check for 'hold' events.
    // For 'unpressed' states, check for 'tap' events.
    var i;
    var curKeyState;
    
    for (i=0; i<joe.KeyInput.keyState.length; ++i) {
      curKeyState = joe.KeyInput.keyState[i];
      
      if (curKeyState.pressed && curKeyState.pressTime > 0) {
        // Check for hold.
        if (gameTime - curKeyState.pressTime > joe.KeyInput.holdInterval) {
            curKeyState.pressTime = 0;
            joe.KeyInput.keyHold(i);
        }
      }
      else if (curKeyState.pressTime > 0) {
        // Check for tap.
        if (gameTime - curKeyState.pressTime > joe.KeyInput.tapInterval) {
          curKeyState.pressTime = 0;
          joe.KeyInput.keyTap(i);
        }
      }
    }
  },
  
  keyPress: function(e) {
    var localEvent = window.event ? window.event : e;
    var keyCode = ('keyCode' in localEvent) ? localEvent.keyCode : event.charCode;
    var curKeyState = null;
    var curTime = 0;
    
    // Update the button state.
    if (typeof(joe.KeyInput.keyState[keyCode]) !== 'undefined') {
      curTime = joe.UpdateLoop.getGameTime();
      
      curKeyState = joe.KeyInput.keyState[keyCode];
      
      if (!curKeyState.pressed) {
        curKeyState.pressed = true;
      
        // Check for double-tap event.
        // Double taps measure time from the first
        // tap.
        if (curTime - curKeyState.pressTime < joe.KeyInput.doubleTapInterval) {
            curKeyState.pressCount = 0;
            curKeyState.pressTime = 0;
            joe.KeyInput.keyDoubleTap(keyCode);
        }
        else {
          curKeyState.pressCount = 1;
          curKeyState.pressTime = curTime;
        }
      }
    }
    
    joe.KeyInput.callListenersUntilConsumed("keyPress", keyCode);
    
    localEvent.preventDefault();
  },
  
  keyRelease: function(e) {
    var localEvent = window.event ? window.event : e;
    var keyCode = ('keyCode' in localEvent) ? localEvent.keyCode : event.charCode;
    var curKeyState = null;
    
    // Update the button state.
    if (typeof(joe.KeyInput.keyState[keyCode]) !== 'undefined') {
      curKeyState = joe.KeyInput.keyState[keyCode];
      curKeyState.pressed = false;
      curKeyState.pressTime = curKeyState.pressTime > 0 ? joe.UpdateLoop.getGameTime() : 0;
      curKeyState.pressCount = 0;
    }
    
    joe.KeyInput.callListenersUntilConsumed("keyRelease", keyCode);
    
    localEvent.preventDefault();
  },
  
  keyTap: function(keyCode) {
    joe.KeyInput.callListenersUntilConsumed("keyTap", keyCode);
  },
  
  keyHold: function(keyCode) {
    joe.KeyInput.callListenersUntilConsumed("keyHold", keyCode);
  },
  
  keyDoubleTap: function(keyCode) {
    joe.KeyInput.callListenersUntilConsumed("keyDoubleTap", keyCode);
  },
  
  // Key codes
  KEYS: {
  BACKSPACE: 8,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  },
}],
{
  // Object Definitions ////////////////////////////////////////////////////////////
});

document.addEventListener("keydown", joe.KeyInput.keyPress, true);
document.addEventListener("keyup", joe.KeyInput.keyRelease, true);

// Support for updates
joe.UpdateLoop.addListener(joe.KeyInput);// Singleton that captures mouse input for the game.
//
// MouseListener module:
//   mouseDown: function(x, y) {};
//   mouseUp: function(x, y) {};
//   mouseDrag: function(x, y) {};
//   mouseOver: function(x, y) {};
//   mouseClick: function(x, y) {};
//   mouseDoubleClick: function(x, y) {};
//
// myInstance = new myClass();
//
// joe.MouseInput.addListener(myInstance);</pre>

joe.MouseInput = new joe.ClassEx([
joe.Listeners, {
  // Static definitions /////////////////////////////////////////////////////
  doubleTapInterval: 200,
  holdInterval: 333,
  mouseState: {x: -1, y:-1, bDown: false, bOff: false, pressTime: 0, pressCount: 0},
  
  setDoubleTapInterval: function(newInterval) {
    joe.MouseInput.doubleTapInterval = newInterval;
  },
  
  setHoldInterval: function(newInterval) {
    joe.MouseInput.holdInterval = newInterval;
  },
  
  init: function() {
    // Nothing to do here.
  },
  
  getClientX: function(e) {
    return Math.round((e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX) / joe.Graphics.globalScale);
  },
  
  getClientY: function(e) {
    return Math.round((e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY) / joe.Graphics.globalScale);
  },
  
  mouseUp: function(e) {
    var x = joe.MouseInput.getClientX(e ? e : window.event);
    var y = joe.MouseInput.getClientY(e ? e : window.event);
    
    // console.log("Mouse up at ", x, y);
    
    joe.MouseInput.mouseState.bDown = false;
    window.removeEventListener("mousemove", joe.MouseInput.mouseDrag, true);
    
    joe.MouseInput.callListenersUntilConsumed("mouseUp", x, y);
    
    (e ? e : event).preventDefault();
  },
  
  mouseDown: function(e) {
    var x = joe.MouseInput.getClientX(e ? e : window.event);
    var y = joe.MouseInput.getClientY(e ? e : window.event);
    var curTime = joe.UpdateLoop.getGameTime();
    
    // console.log("Mouse down at", x, y);
    
    if (curTime - joe.MouseInput.mouseState.pressTime < joe.MouseInput.doubleTapInterval) {
        joe.MouseInput.mouseDoubleClick(e);
    }
    else {
      joe.MouseInput.mouseState.pressCount = 1;
      joe.MouseInput.mouseState.pressTime = curTime;
    }
    
    joe.MouseInput.mouseState.x = x;
    joe.MouseInput.mouseState.y = y;

    joe.MouseInput.callListenersUntilConsumed("mouseDown", x, y);    
    joe.MouseInput.mouseState.bDown = true;
    
    window.addEventListener("mousemove", joe.MouseInput.mouseDrag, true);
    
    (e ? e : event).preventDefault();
  },
  
  mouseDrag: function(e) {
    var x = joe.MouseInput.getClientX(e ? e : window.event);
    var y = joe.MouseInput.getClientY(e ? e : window.event);
    
    joe.MouseInput.mouseState.pressTime = 0;
    
    // console.log("Mouse drag at", x, y);

    joe.MouseInput.callListenersUntilConsumed("mouseDrag", x, y);    
    
    (e ? e : event).preventDefault();
  },
  
  mouseOver: function(e) {
    // var x = joe.MouseInput.getClientX(e ? e : window.event);
    // var y = joe.MouseInput.getClientY(e ? e : window.event);
    // console.log("Mouse over at", x, y);
  },
  
  mouseOut: function(e) {
    var x = joe.MouseInput.getClientX(e ? e : window.event);
    var y = joe.MouseInput.getClientY(e ? e : window.event);
    // console.log("Mouse out at", x, y);
    
    joe.MouseInput.mouseState.bDown = false;
    joe.MouseInput.mouseState.pressCount = 0;
    window.removeEventListener("mousemove", joe.MouseInput.mouseDrag, true);
  },
  
  mouseHold: function() {
    var x = joe.MouseInput.mouseState.x;
    var y = joe.MouseInput.mouseState.y;
    
    // console.log("Mouse hold at", x, y);
    
    joe.MouseInput.callListenersUntilConsumed("mouseHold", x, y);
  },
  
  mouseClick: function() {
    var x = joe.MouseInput.mouseState.x;
    var y = joe.MouseInput.mouseState.y;
    var i = 0;

    // console.log("Mouse click at", x, y);

    joe.MouseInput.callListenersUntilConsumed("mouseClick", x, y);    
  },
  
  mouseDoubleClick: function(e) {
    var x = e ? e.clientX : window.event.clientX;
    var y = e ? e.clientY : window.event.clientY;
    
    joe.MouseInput.mouseState.pressTime = 0;
    joe.MouseInput.mouseState.pressCount = 0;
    
    // console.log("Mouse double click at", x, y);

    joe.MouseInput.callListenersUntilConsumed("mouseDoubleClick", x, y);    
  },

  update: function(dt, gameTime) {    
    if (joe.MouseInput.mouseState.bDown && joe.MouseInput.mouseState.pressTime > 0) {
      // Check for hold.
      if (gameTime - joe.MouseInput.mouseState.pressTime > joe.MouseInput.holdInterval) {
          joe.MouseInput.mouseState.pressTime = 0;
          joe.MouseInput.mouseState.pressCount = 0;
          joe.MouseInput.mouseHold();
      }
    }
    else if (joe.MouseInput.mouseState.pressTime > 0 && !joe.MouseInput.mouseState.bDown) {
      // Check for click.
      if (gameTime - joe.MouseInput.mouseState.pressTime > joe.MouseInput.doubleTapInterval) {
        joe.MouseInput.mouseState.pressTime = 0;
        joe.MouseInput.mouseState.pressCount = 0;
        joe.MouseInput.mouseClick();
      }
    }
  },
}],
{
  // Object definitions /////////////////////////////////////////////////////
});

window.addEventListener("mouseover", joe.MouseInput.mouseOver, true);
window.addEventListener("mouseout", joe.MouseInput.mouseOut, true);
window.addEventListener("mousedown", joe.MouseInput.mouseDown, true);
window.addEventListener("mouseup", joe.MouseInput.mouseUp, true);

// Support for updates
joe.UpdateLoop.addListener(joe.MouseInput);
// >Converts touchStart, touchMove, and touchEnd events into mouseDown, mouseMove, and mouseEnd events, respectively.
//
// Usage
//  var myListenerObject = {
//  mousePress: function(x, y) { ... },
//  mouseRelease: function(x, y) { ... }
//};
//

joe.Multitouch = new joe.ClassEx([
  joe.Listeners,
  {
    pointInfo: {clientX:0, clientY:0, srcElement:null},
    
    touchStart: function(e) {
      var i = 0;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
        
        for (i=0; i<e.touches.length; ++i) {
          joe.Multitouch.getClientPos(e.touches[i]);
          // console.log("touchDown " + e.touches[i].identifier + " " + joe.Multitouch.pointInfo.clientX + " " + joe.Multitouch.pointInfo.clientY);
          joe.Multitouch.callListenersUntilConsumed("touchDown",
                                                    e.touches[i].identifier,
                                                    joe.Multitouch.pointInfo.clientX,
                                                    joe.Multitouch.pointInfo.clientY);    
        }
      }
    },
    
    touchMove: function(e) {
      var i = 0;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
        
        for (i=0; i<e.changedTouches.length; ++i) {
          joe.Multitouch.getClientPos(e.changedTouches[i]);
          // console.log("touchMove " + e.changedTouches[i].identifier + " " + joe.Multitouch.pointInfo.clientX + " " + joe.Multitouch.pointInfo.clientY);
          joe.Multitouch.callListenersUntilConsumed("touchMove",
                                                    e.changedTouches[i].identifier,
                                                    joe.Multitouch.pointInfo.clientX,
                                                    joe.Multitouch.pointInfo.clientY);    
        }
      }
    },
    
    getClientPos: function(touch) {
      // Adapted from gregers' response in StackOverflow:
      // http://stackoverflow.com/questions/5885808/includes-touch-events-clientx-y-scrolling-or-not
      
      var winOffsetX = window.pageXoffset;
      var winOffsetY = window.pageYoffset;
      var x = touch.clientX;
      var y = touch.clientY;
      
      if (touch.pageY === 0 && Math.floor(y) > Math.floor(touch.pageY) ||
          touch.pageX === 0 && Math.floor(x) > Math.floor(touch.pageX)) {
        x = x - winOffsetX;
        y = y - winOffsetY;
      }
      else if (y < (touch.pageY - winOffsetY) || x < (touch.pageX - winOffsetX)) {
        x = touch.pageX - winOffsetX;
        y = touch.pageY - winOffsetY;
      }

      x = Math.round(x / joe.Graphics.globalScale);
      y = Math.round(y / joe.Graphics.globalScale);
      
      joe.Multitouch.pointInfo.clientX = x;
      joe.Multitouch.pointInfo.clientY = y;
      joe.Multitouch.pointInfo.srcElement = document._gameCanvas ? document._gameCanvas : null;
    },
    
    touchEnd: function(e) {
      var i = 0;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
        
        for (i=0; i<e.changedTouches.length; ++i) {
          joe.Multitouch.getClientPos(e.changedTouches[i]);
          // console.log("touchUp " + e.changedTouches[i].identifier + " " + joe.Multitouch.pointInfo.clientX + " " + joe.Multitouch.pointInfo.clientY);
          joe.Multitouch.callListenersUntilConsumed("touchUp",
                                                    e.changedTouches[i].identifier,
                                                    joe.Multitouch.pointInfo.clientX,
                                                    joe.Multitouch.pointInfo.clientY);    
        }
      }
    }
  }
],
{
  // Object definitions /////////////////////////////////////////////////////
});

window.addEventListener("touchstart", joe.Multitouch.touchStart, true);
window.addEventListener("touchmove", joe.Multitouch.touchMove, true);
window.addEventListener("touchend", joe.Multitouch.touchEnd, true);

// Components /////////////////////////////////////////////////////////////////
joe.GameState = {};

joe.GameState.stateMachine = {
  currentState: null,

  setState: function(newState) {
    if (this.currentState !== newState) {
      if (this.currentState) {
        this.currentState.exit();
        joe.UpdateLoop.removeListener(this.currentState);
        joe.Graphics.removeListener(this.currentState);
      }

      if (newState) {
        newState.enter();
        joe.UpdateLoop.addListener(newState);
        joe.Graphics.addListener(newState);
      }

      this.currentState = newState;
    }
  },

  getState: function() {
    return this.currentState;
  },

  mouseDrag: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseDrag) {
      bConsumed = curState.commands.mouseDrag(x, y);
    }

    return bConsumed;
  },

  mouseUp: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseUp) {
      bConsumed = curState.commands.mouseUp(x, y);
    }

    return bConsumed;
  },

  mouseDown: function(x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.mouseDown) {
      bConsumed = curState.commands.mouseDown(x, y);
    }

    return bConsumed;
  },

  touchUp: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchUp) {
      bConsumed = curState.commands.touchUp(touchID, x, y);
    }

    return bConsumed;
  },

  touchDown: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchDown) {
      bConsumed = curState.commands.touchDown(touchID, x, y);
    }

    return bConsumed;
  },

  touchMove: function(touchID, x, y) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.touchMove) {
      bConsumed = curState.commands.touchMove(touchID, x, y);
    }

    return bConsumed;
  },

  keyPress: function(keyCode) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.keyPress) {
      bConsumed = curState.commands.keyPress(keyCode);
    }

    return bConsumed;
  },

  keyRelease: function(keyCode) {
    var curState = this.getState(),
        bConsumed = false;

    if (curState && curState.commands && curState.commands.keyRelease) {
      bConsumed = curState.commands.keyRelease(keyCode);
    }

    return bConsumed;
  }
};

joe.MathEx = {};

joe.MathEx.EPSILON = 0.001;
joe.MathEx.EPSILON_ANGLE = 0.0001;
joe.MathEx.resultRect = {x:0, y:0, w:0, h:0};
joe.MathEx.COS_TABLE = [];
joe.MathEx.SIN_TABLE = [];
joe.MathEx.TABLE_SIZE = 2048;
joe.MathEx.TWO_PI = 2 * Math.PI;

// Lookups --------------------------------------------------------------------
joe.MathEx.buildTables = function() {
  var i = 0;

  for (i=0; i<joe.MathEx.TABLE_SIZE; ++i) {
    joe.MathEx.COS_TABLE.push(Math.cos(2 * Math.PI * i / joe.MathEx.TABLE_SIZE));
    joe.MathEx.SIN_TABLE.push(Math.sin(2 * Math.PI * i / joe.MathEx.TABLE_SIZE));
  }
};

joe.MathEx.trigTransition = function(param) {
  param = Math.min(param, 1);
  param = Math.max(0, param);

  return (1 - joe.MathEx.cos(Math.PI * param)) * 0.5;
};

joe.MathEx.cos = function(angle) {
  var branchCut = Math.floor(angle / joe.MathEx.TWO_PI),
      lowIndex = 0,
      highIndex = 0,
      result = 0;

  angle = angle - branchCut * joe.MathEx.TWO_PI;

  // Angle is now in the range [0, 2PI).
  
  lowIndex = joe.MathEx.TABLE_SIZE * angle / joe.MathEx.TWO_PI;
  highIndex = Math.floor(lowIndex);

  if (Math.abs(lowIndex - highIndex) > joe.MathEx.EPSILON ) {
    // LERP to final result.
    result = joe.MathEx.COS_TABLE[highIndex] * (1 - (lowIndex - highIndex));
    highIndex += 1;
    result += joe.MathEx.COS_TABLE[highIndex] * (1 - (highIndex - lowIndex));
  }
  else {
    result = joe.MathEx.COS_TABLE[highIndex];
  }

  return result;
};

joe.MathEx.sin = function(angle) {
  var branchCut = Math.floor(angle / joe.MathEx.TWO_PI),
      lowIndex = 0,
      highIndex = 0,
      result = 0;

  angle = angle - branchCut * joe.MathEx.TWO_PI;

  // Angle is now in the range [0, 2PI).
  
  lowIndex = joe.MathEx.TABLE_SIZE * angle / joe.MathEx.TWO_PI;
  highIndex = Math.floor(lowIndex);

  if (Math.abs(lowIndex - highIndex) > joe.MathEx.EPSILON ) {
    // LERP to final result.
    result = joe.MathEx.SIN_TABLE[highIndex] * (1 - (lowIndex - highIndex));
    highIndex += 1;
    result += joe.MathEx.SIN_TABLE[highIndex] * (1 - (highIndex - lowIndex));
  }
  else {
    result = joe.MathEx.SIN_TABLE[highIndex];
  }

  return result;
};

joe.MathEx.tan = function(angle) {
  var sin = joe.MathEx.sin(angle),
      cos = joe.MathEx.cos(angle),
      result = cos ? sin / cos : undefined;

  return result;
};

// Rectangles ----------------------------------------------------------------
joe.MathEx.rect2 = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
};

joe.MathEx.rectContainsPoint = function(r, x, y) {
  return (x >= r.x &&
          x <= r.x + r.w &&
          y >= r.y &&
          y <= r.y + r.h);
},

joe.MathEx.clip = function(r1, r2) {
  var rt = null,
      result = joe.MathEx.resultRect;

  // Ensure that r1.w < r2.w.
  if (r2.w < r1.w) {
    rt = r1;
    r1 = r2;
    r2 = rt;
  }

  if (r1.x + r1.w < r2.x ||
      r1.x > r2.x + r2.w) {
    // No overlap.
    result = null;
  }
  else {
    result.x = Math.max(r1.x, r2.x);
    result.w = Math.min(r1.x + r1.w, r2.x + r2.w) - result.x;
  }

  if (result) {
    if (r2.h < r1.h) {
      rt = r1;
      r1 = r2;
      r2 = rt;
    }

    if (r1.y + r1.h < r2.y ||
        r1.y > r2.y + r2.h) {
      // No overlap.
      result = null;
    }
    else {
      result.y = Math.max(r1.y, r2.y);
      result.h = Math.min(r1.y + r1.h, r2.y + r2.h) - result.y;
    }
  }

  return result;
};

// 2D Vectors ----------------------------------------------------------------
joe.MathEx.vec2 = function(x, y) {
  this.x = x;
  this.y = y;
};

joe.MathEx.vec2.prototype.distSqFrom = function(vOther) {
  var dx = this.x - vOther.x;
  var dy = this.y - vOther.y;

  return dx * dx + dy * dy;
};

joe.MathEx.vec2.prototype.dotWith = function(vOther) {
  return this.x * vOther.x + this.y * vOther.y;
};

joe.MathEx.vec2.prototype.crossWith = function(vOther) {
  return new joe.MathEx.vec2(this.x * vOther.y - vOther.x * this.y);
};

joe.MathEx.vec2.prototype.distSq = function() {
  return this.x * this.x + this.y * this.y;
};

joe.MathEx.vec2.prototype.normalize = function() {
  var dist = Math.sqrt(this.distSq());

  if (dist) {
    this.x = this.x / dist;
    this.y = this.y / dist;
  }
};

joe.MathEx.vec2.prototype.add = function(vOther) {
  this.x += vOther.x;
  this.y += vOther.y;

  return this;
};

joe.MathEx.vec2.prototype.multiply = function(scale) {
  this.x *= scale;
  this.y *= scale;

  return this;
};

joe.MathEx.vec2.prototype.subtract = function(vOther) {
  this.x -= vOther.x;
  this.y -= vOther.y;

  return this;
};

joe.MathEx.vec2.prototype.copy = function(vOther) {
  this.x = vOther.x;
  this.y = vOther.y;
};

joe.MathEx.vec2FromPoints = function(x0, y0, xf, yf) {
  return new joe.MathEx.vec2(xf - x0, yf - y0);
};

joe.MathEx.vec2Copy = function(vOther) {
  return new joe.MathEx.vec2(vOther.x, vOther.y);
};

// Bezier Helpers -------------------------------------------------------------
joe.MathEx.bezierComputePoint = function(t, p0, p1, p2, p3) {
  var u = 1 - t;
  var tt = t * t;
  var uu = u * u;
  var uuu = uu * u;
  var ttt = tt * t;

  p = new joe.MathEx.vec2(p0.x * uuu, p0.y * uuu);

  p.x += p1.x * (3 * uu * t);
  p.y += p1.y * (3 * uu * t);
 
  p.x += p2.x * (3 * u * tt);
  p.y += p2.y * (3 * u * tt);

  p.x += p3.x * ttt;
  p.y += p3.y * ttt;
   
  return p;
};

joe.MathEx.bezierGetPointFromCurve = function(controlPoints, segmentIndex, segmentParam) {
  var p0 = controlPoints[segmentIndex];
  var p1 = controlPoints[segmentIndex + 1];
  var p2 = controlPoints[segmentIndex + 2];
  var p3 = controlPoints[segmentIndex + 3];

  return joe.MathEx.bezierComputePoint(segmentParam, p0, p1, p2, p3);
};

joe.MathEx.bezierGeneratePixels = function(controlPoints, pointsPerSegment) {
  var drawingPoints = [];
  var i = 0;
  var j = 0;
  var p0 = null;
  var p1 = null;
  var p2 = null;
  var p3 = null;
  var t = 0;

  for (i=0; i<controlPoints.length - 3; i+=3)
  {
    p0 = controlPoints[i];
    p1 = controlPoints[i + 1];
    p2 = controlPoints[i + 2];
    p3 = controlPoints[i + 3];    

    if (i == 0) //Only do this for the first endpoint.
                //When i != 0, this coincides with the end
                //point of the previous segment
    {
      drawingPoints.push(joe.MathEx.bezierComputePoint(0, p0, p1, p2, p3));
    }    

    for(j=1; j<=pointsPerSegment; j++)
    {
      t = j / pointsPerSegment;
      drawingPoints.push(joe.MathEx.bezierComputePoint(t, p0, p1, p2, p3));
    }
  }

  return drawingPoints;
};

joe.MathEx.bezierInterpolate = function(pointList, scale)
{
    var i = 0;
    var controlPoints = null;
    var p1 = null;
    var p2 = null;
    var tangent = null;
    var q0 = null;
    var q1 = null;
    var dp = null;
    var mag = 0;
 
    if (pointList.length >= 2)
    {
      controlPoints = [];

      for (i=0; i<pointList.length; i++)
      {
          if (i === 0) // is first
          {
              p1 = pointList[i];
              p2 = pointList[i + 1];                
   
              tangent = new joe.MathEx.vec2(p2.x - p1.x, p2.y - p1.y);
              q1 = joe.MathEx.vec2Copy(p1);
              q1.add(tangent.multiply(scale));

              controlPoints.push(p1);
              controlPoints.push(q1);
          }
          else if (i === pointList.length - 1) //last
          {
              p0 = pointList[i - 1];
              p1 = pointList[i];

              tangent = new joe.MathEx.vec2(p1.x - p0.x, p1.y - p0.y);
              q0 = joe.MathEx.vec2Copy(p1);
              q0.subtract(tangent.multiply(scale));
   
              controlPoints.push(q0);
              controlPoints.push(p1);
          }
          else
          {
              p0 = pointList[i - 1];
              p1 = pointList[i];
              p2 = pointList[i + 1];

              tangent = new joe.MathEx.vec2(p2.x - p0.x, p2.y - p0.y);
              tangent.normalize();
              tangent.multiply(scale);

              dp = new joe.MathEx.vec2(p1.x - p0.x, p1.y - p0.y);
              mag = Math.sqrt(dp.distSq());

              q0 = new joe.MathEx.vec2(p1.x - tangent.x * mag, p1.y - tangent.y * mag);

              dp = new joe.MathEx.vec2(p2.x - p1.x, p2.y - p1.y);
              mag = Math.sqrt(dp.distSq());

              q1 = new joe.MathEx.vec2(p1.x + tangent.x * mag, p1.y + tangent.y * mag);
   
              controlPoints.push(q0);
              controlPoints.push(p1);
              controlPoints.push(q1);
          }
      }
    }
 
    return controlPoints;
}

// Cubic Splines --------------------------------------------------------------
joe.MathEx.cubic = function(a, b, c, d, u) {
   this.a = a;
   this.b = b;
   this.c = c;
   this.d = d;
};

joe.MathEx.cubic.prototype.getValueAt = function(u){
  return (((this.d * u) + this.c) * u + this.b) * u + this.a;
};

joe.MathEx.calcNaturalCubic = function(values, component, cubics) {
   var num = values.length - 1;
   var gamma = []; // new float[num+1];
   var delta = []; // new float[num+1];
   var D = []; // new float[num+1];
   var i = 0;

   /*
        We solve the equation
       [2 1       ] [D[0]]   [3(x[1] - x[0])  ]
       |1 4 1     | |D[1]|   |3(x[2] - x[0])  |
       |  1 4 1   | | .  | = |      .         |
       |    ..... | | .  |   |      .         |
       |     1 4 1| | .  |   |3(x[n] - x[n-2])|
       [       1 2] [D[n]]   [3(x[n] - x[n-1])]
       
       by using row operations to convert the matrix to upper triangular
       and then back sustitution.  The D[i] are the derivatives at the knots.
   */
   gamma.push(1.0 / 2.0);
   for(i=1; i< num; i++) {
      gamma.push(1.0/(4.0 - gamma[i-1]));
   }
   gamma.push(1.0/(2.0 - gamma[num-1]));

   p0 = values[0][component];
   p1 = values[1][component];
         
   delta.push(3.0 * (p1 - p0) * gamma[0]);
   for(i=1; i< num; i++) {
      p0 = values[i-1][component];
      p1 = values[i+1][component];
      delta.push((3.0 * (p1 - p0) - delta[i - 1]) * gamma[i]);
   }
   p0 = values[num-1][component];
   p1 = values[num][component];

   delta.push((3.0 * (p1 - p0) - delta[num - 1]) * gamma[num]);

   D.unshift(delta[num]);
   for(i=num-1; i >= 0; i--) {
      D.unshift(delta[i] - gamma[i] * D[0]);
   }

   /*
        now compute the coefficients of the cubics 
   */
   cubics.length = 0;

   for(i=0; i<num; i++) {
      p0 = values[i][component];
      p1 = values[i+1][component];

      cubics.push(new joe.MathEx.cubic(
                     p0, 
                     D[i], 
                     3*(p1 - p0) - 2*D[i] - D[i+1],
                     2*(p0 - p1) +   D[i] + D[i+1]
                   )
               );
   }
};

joe.MathEx.Spline2D = function() {
   this.points = [];
   this.xCubics = [];
   this.yCubics = [];

   this.reset = function() {
     this.points.length = 0;
     this.xCubics.length = 0;
     this.yCubics.length = 0;
   };
   
   this.addPoint = function(point) {
      this.points.push(point);
   };
   
   this.getPoints = function() {
      return this.points;
   };
   
   this.calcSpline = function() {
      joe.MathEx.calcNaturalCubic(this.points, "x", this.xCubics);
      joe.MathEx.calcNaturalCubic(this.points, "y", this.yCubics);
   };
   
   this.getPoint = function(position) {
      position = position * this.xCubics.length; // extrapolate to the arraysize
      
      var cubicNum = Math.floor(position);
      var cubicPos = (position - cubicNum);
      
      return {x: this.xCubics[cubicNum].getValueAt(cubicPos),
              y: this.yCubics[cubicNum].getValueAt(cubicPos)};
   };
};

joe.MathEx.Spline3D = function() {
   this.points = [];
   this.xCubics = [];
   this.yCubics = [];
   this.zCubics = [];

   this.reset = function() {
     this.points.length = 0;
     this.xCubics.length = 0;
     this.yCubics.length = 0;
     this.zCubics.length = 0;
   };
   
   this.addPoint = function() {
      this.points.push(point);
   };
   
   this.getPoints = function() {
      return this.points;
   };
   
   this.calcSpline = function() {
      joe.MathEx.calcNaturalCubic(this.points, "x", this.xCubics);
      joe.MathEx.calcNaturalCubic(this.points, "y", this.yCubics);
      joe.MathEx.calcNaturalCubic(this.points, "z", this.zCubics);
   };
   
   this.getPoint = function(position) {
      position = position * this.xCubics.length; // extrapolate to the arraysize
      
      var cubicNum = Math.floor(position);
      var cubicPos = (position - cubicNum);
      
      return {x: this.xCubics[cubicNum].getValueAt(cubicPos),
              y: this.yCubics[cubicNum].getValueAt(cubicPos),
              z: this.zCubics[cubicNum].getValueAt(cubicPos)};
   };
};

joe.MathEx.buildTables();
/**
 * Extend existing joe objects with this axis-aligned bounding box.
 */

joe.MathEx.AABB_SHARED = {x:0, y:0, width:0, height:0};
joe.MathEx.AABB_BOUNDS_KEY_MAP = {"0":"x", "1":"y", "2":"width", "3":"height"};

joe.MathEx.AABBmodule = {
  bounds: {x:0, y:0, width:0, height: 0},
  boundRect: {x:0, y:0, w:0, h:0},

  // Set bounds directly.
  AABBset: function(x, y, w, h) {
    this.bounds.x = x;
    this.bounds.y = y;
    this.bounds.width = w;
    this.bounds.height = h;
  },

  // Copy from another bounds object. Assumes the bounds will define
  // its fields in the order of x, y, width, and height, but may use
  // different names.
  AABBcopy: function(bounds) {
    var i = 0;
    var key = null;

    for (key in bounds) {
      bounds[key] = this.bounds[joe.MathEx.AABB_BOUNDS_KEY_MAP["" + i]]
      i += 1;
    }
  },

  AABBgetX: function() {
    return this.bounds.x;
  },

  AABBgetY: function() {
    return this.bounds.y;
  },

  // Generates bounds from a list of points. Assumes the points are
  // passed as an array of objects with 'x' and 'y' fields.
  AABBfromPoints: function(points) {
    var xMin = Number.POSITIVE_INFINITY;
    var yMin = Number.POSITIVE_INFINITY;
    var xMax = Number.NEGATIVE_INFINITY;
    var yMax = Number.NEGATIVE_INFINITY;
    var x = 0;
    var y = 0;
    var i = 0;

    for (i=0; i<points.length; ++i) {
      x = points[i].x;
      y = points[i].y;

      if (x < xMin) {
        xMin = x;
      }
      else if (x > xMax) {
        xMax = x;
      }

      if (y < yMin) {
        yMin = y;
      }
      else if (y > yMax) {
        yMax = y;
      }
    }

    this.bounds.x = xMin;
    this.bounds.y = yMin;
    this.bounds.width = xMax - xMin;
    this.bounds.height = yMax - yMin;
  },

  // Gets a reference to this object's 'bounds' field.
  // DANGEROUS: allows other objects to overwrite the bounds.
  AABBgetRef: function() {
    return this.bounds;
  },

  // HACK: return a rect, rather than a bounds. Useful for clipping
  // TODO: resolve the differences between rect and bounds.
  AABBgetRectRef: function() {
    this.boundRect.x = this.bounds.x;
    this.boundRect.y = this.bounds.y;
    this.boundRect.w = this.bounds.width;
    this.boundRect.h = this.bounds.height;

    return this.boundRect;
  },

  // Returns a copy of the bounds in a shared static object.
  // DANGEROUS: other calls to getVolatile will overwrite the
  // object returned in this function. It is best to copy the
  // results of getVolatile() immediately after the call.
  AABBgetVolatile: function() {
    this.copy(joe.MathEx.AABB_SHARED);

    return joe.MathEx.AABB_SHARED;
  },

  AABBoffset: function(dx, dy) {
    this.bounds.x += dx;
    this.bounds.y += dy;
  },

  AABBcontainsPoint: function(x, y) {
    return x >= this.bounds.x &&
           x <= this.bounds.x + this.bounds.width &&
           y >= this.bounds.y &&
           y <= this.bounds.y + this.bounds.height;
  },

  AABBdraw: function(ctx, color) {
    var color = color || "#ff0000";
    var context = ctx ? ctx : joe.Graphics.getActiveContext();

    if (context && color) {
      context.save();

      context.strokeStyle = color;
      context.lineWidth = 2;

      context.beginPath();
      context.moveTo(this.bounds.x, this.bounds.y);
      context.lineTo(this.bounds.x + this.bounds.width, this.bounds.y);
      context.lineTo(this.bounds.x + this.bounds.width, this.bounds.y + this.bounds.height);
      context.lineTo(this.bounds.x, this.bounds.y + this.bounds.height);
      context.closePath();

      context.stroke();

      context.restore();
    }
  }
};

joe.MathEx.AABB = new joe.ClassEx(null, [joe.MathEx.AABBmodule,
  {
    init: function(x, y, w, h) {
      this.AABBset(x, y, w, h);
    }
  }]
);


// [HELP]
// <h1>joe.Resources</h1><hr>
//
// <em>Retrieves image, audio, font, and text/svg data from the server.</em>
//
// <strong>Interface</strong>
// loadImage = function(imageURL);
// loadSound = function(soundURL);
// loadFont = function(fontURL);
// loadSVG = function(svgURL);
//
// <strong>Use</strong>
// <pre> var myLoader = {
//   onSoundLoaded = function(sound, soundName) {...},
//   onImageLoaded = function(image) {...},
//   onFontLoaded = function(font) {...},
//   onSVGloaded = function(svgText) {...},
//   onErrorCallback = function(errorText) {...}
// };
//
// joe.Resources.loadSound("mySound", myLoader.onSoundLoaded, myLoader.onErrorCallback, this, nChannels, minDelay);
// joe.Resources.loadImage("myImage", myLoader.onImageLoaded, myLoader.onErrorCallback, this);
// joe.Resources.loadFont("myFont", myLoader.onFontLoaded, myLoader.onErrorCallback, this);
// joe.Resources.loadSVG("mySVG", myLoader.onSVGloaded, myLoader.onErrorCallback, this);</pre>
//
// <strong>Notes</strong>
// TODO: maintain a total resource count and add a progress API.
// [END HELP]

joe.Resources = {
  resourcesPending: 0,
  bResourceLoadSuccessful: true,
  resourcesLoaded: 0,

  incPendingCount: function() {
    this.resourcesPending += 1;
  },

  incLoadedCount: function(bLoadSuccessful) {
    this.resourcesLoaded += 1;

    this.bResourceLoadSuccessful &= bLoadSuccessful;

    if (this.resourcesLoaded === this.resourcesPending) {
      this.clearResourceCount();
    }
  },

  clearResourceCount: function() {
    this.resourcesPending = 0;
    this.resourcesLoaded = 0;
  },

  loadComplete: function() {
    return this.resourcesPending === 0 && this.resourcesLoaded === 0;
  },

  loadSuccessful: function() {
    return this.bResourceLoadSuccessful;
  }
},

joe.ResourceLoader = new joe.ClassEx(null, {
// Static Definitions /////////////////////////////////////////////////////////
  resourcesPending: 0,
  resourcesLoaded: 0,

  loadImage: function(imageURL, onLoadedCallback, onErrorCallback, observer) {
    var image = new Image();

    joe.Resources.incPendingCount();
  
    image.onload = function() {
      joe.Resources.incLoadedCount(true);
      if (onLoadedCallback) { onLoadedCallback.call(observer, image); }
    }
    
    image.onerror = function() {
      joe.Resources.incLoadedCount(false);
      if (onErrorCallback) { onErrorCallback.call(observer, imageURL); }
    }
  
    image.src = imageURL;
  
    return image;
  },

  loadBitmapFont: function(fontURLs, onLoadedCallback, onErrorCallback, observer) {
    var font = null,
        image = null,
        fontURL = null,
        i = 0;

        if (!(fontURLs instanceof Array)) {
          fontURL = fontURLs;
          fontURLs = [];
          fontURLs.push(fontURL);
        }

        font = new joe.Resources.BitmapFont();

        for (i=0; i<fontURLs.length; ++i) {
          image = joe.Resources.loader.loadImage(fontURLs[i],
                                                 function() {
                                                              if (onLoadedCallback) { onLoadedCallback.call(observer, image) }
                                                              font.onLoad(image);
                                                            },
                                                 onErrorCallback,
                                                 observer);
          font.addImage(image);
        }

    return font;
  },
  
  loadFont: function(fontURL, onLoadedCallback, onErrorCallback, observer) {
    joe.Resources.incPendingCount();

    var font = joe.Resources.FontEx.newFromResource(fontURL,
               function() {
                 joe.Resources.incLoadedCount(true);
                 if (onLoadedCallback) { onLoadedCallback.call(observer, font); }
               },
               function() {
                 joe.Resources.incLoadedCount(false);
                 if (onErrorCallback) { onErrorCallback.call(observer, fontURL); }
               },
               observer);    
    
    return font;
  },
  
  loadSound: function(soundURL, onLoadedCallback, onErrorCallback, observer, nChannels, repeatDelaySec) {
    joe.Resources.incPendingCount();

    return joe.Sound.load(soundURL,
        function() {
          joe.Resources.incLoadedCount(true);
          if (onLoadedCallback) { onLoadedCallback.call(observer, soundURL); }
        },
        function() {
          joe.Resources.incLoadedCount(false);
          if (onLoadedCallback) { onLoadedCallback.call(observer, soundURL); }
        },
        nChannels, repeatDelaySec);
  },

  loadSVG: function(svgName, onLoadedCallback, onErrorCallback, observer) {
    var xhr = new XMLHttpRequest();
    var url = "http://www.freegamersjournal.com/svg-edit-2.6/php/loadSVG.php";
    var title = svgName;
    var matches = null;
  
    joe.Resources.incPendingCount();

    xhr.open("POST", url, true);

    // Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (xhr.responseText && xhr.responseText.substring(0, "ERROR:".length) === "ERROR:") {
            if (onErrorCallback) onErrorCallback.call(observer);
          }
          else if (onLoadedCallback) {
            joe.Resources.incLoadedCount(true);
            onLoadedCallback.call(observer, xhr.responseText);
          }
        }
        else if (xhr.responseText) {
          joe.Resources.incLoadedCount(false);
          if (onErrorCallback) onErrorCallback.call(observer, svgName);
        }
      }
    }

    xhr.send("name=" + svgName);  
  }
},
{
// Instance Definitions ///////////////////////////////////////////////////////
});

joe.Resources.loader = new joe.ResourceLoader();

// [HELP]
// <h1>joe.FontEx</h1><hr>
// <em>Supports download and display of TrueType and OpenType fonts.</em>
//
// <strong>Interface</strong>
// measureText: function(textString, fontSize);
// measureSegment: function(textSegment, fontSize, metrics);
//
// <strong>Use</strong>
// <pre>var FontTest = function() {
//   this.onLoaded = function(fontName, font) {
//     /* Use getContext to use the canvas for drawing. */
//     graphics.lock();
//     graphics.clearToColor("#000000");
//  
//     graphics.fillStyle    = '#00FFFF';
//     graphics.font         = "30px '" + this.testFont.fontFamily + "'";
//     graphics.textBaseline = 'top';
//      
//     graphics.fillText('Asteroids!', document._gameCanvas.width * 0.5, document._gameCanvas.height * 0.5);
//    
//     graphics.unlock();
//   };
//  
//   this.onError = function(fontName) {
//     alert("Failed to load " + fontName);
//   };
// };
//
// var fontTest = new FontTest();</pre>

// <strong>Notes</strong>
// Adapted from use from WebJS from Mike "Pomax" Kamermans' <a href="http://github.com/Pomax/Font.js" target=_blank>Font.js class.</a>
// Used and distributed under the MIT "expat" license.
// [END HELP]

/**
  Font.js v2012.01.25
  (c) Mike "Pomax" Kamermans, 2012
  Licensed under MIT ("expat" flavour) license.
  Hosted on http://github.com/Pomax/Font.js

  This library adds Font objects to the general pool
  of available JavaScript objects, so that you can load
  fonts through a JavaScript object similar to loading
  images through a new Image() object.

  Font.js is compatible with all browsers that support
  <canvas> and Object.defineProperty - This includes
  all versions of Firefox, Chrome, Opera, IE and Safari
  that were 'current' (Firefox 9, Chrome 16, Opera 11.6,
  IE9, Safari 5.1) at the time Font.js was released.

  Font.js will not work on IE8 or below due to the lack
  of Object.defineProperty - I recommend using the
  solution outlined in http://ie6update.com/ for websites
  that are not corporate intranet sites, because as a home
  user you have no excuse not to have upgraded to Internet
  Explorer 9 yet, or simply not using Internet Explorer if
  you're still using Windows XP. If you have friends or
  family that still use IE8 or below: intervene.

  You may remove every line in this header except for
  the first block of four lines, for the purposes of
  saving space and minification. If minification strips
  the header, you'll have to paste that paragraph back in.

  Issue tracker: https://github.com/Pomax/Font.js/issues

**/

(function(window){

  // 1) Do we have a mechanism for binding implicit get/set?
  if(!Object.defineProperty) {
    throw("Font.js requires Object.defineProperty, which this browser does not support.");
  }

  // 2) Do we have Canvas2D available?
  if(!document.createElement("canvas").getContext) {
    throw("Font.js requires <canvas> and the Canvas2D API, which this browser does not support.");
  }

  // Make sure type arrays are available in IE9
  // Code borrowed from pdf.js (https://gist.github.com/1057924)
  (function(window) {
    try { var a = new Uint8Array(1); return; } catch (e) { }
    function subarray(start, end) { return this.slice(start, end); }
    function set_(array, offset) {
      var i, n = array.length;
      if (arguments.length < 2) { offset = 0; }
      for (i = 0; i < n; ++i, ++offset) { this[offset] = array[i] & 0xFF; }}
    function TypedArray(arg1) {
      var result, i;
      if (typeof arg1 === "number") {
        result = new Array(arg1);
        for (i = 0; i < arg1; ++i) { result[i] = 0; }
      } else { result = arg1.slice(0); }
      result.subarray = subarray;
      result.buffer = result;
      result.byteLength = result.length;
      result.set = set_;
      if (typeof arg1 === "object" && arg1.buffer) {
        result.buffer = arg1.buffer; }
      return result; }
    window.Uint8Array = TypedArray;
    window.Uint32Array = TypedArray;
    window.Int32Array = TypedArray;
  }(window));

  // Also make sure XHR understands typing.
  // Code based on pdf.js (https://gist.github.com/1057924)
  (function(window) {
    // shortcut for Opera - it's already fine
    if(window.opera) return;
    // shortcuts for browsers that already implement XHR minetyping
    if ("response" in XMLHttpRequest.prototype ||
        "mozResponseArrayBuffer" in XMLHttpRequest.prototype ||
        "mozResponse" in XMLHttpRequest.prototype ||
        "responseArrayBuffer" in XMLHttpRequest.prototype) { return; }
    var getter;
    // If we have access to the VBArray (i.e., we're in IE), use that
    if(window.VBArray) {
      getter = function() {
        return new Uint8Array(new VBArray(this.responseBody).toArray()); }}
    // Okay... umm.. untyped arrays? This may break completely.
    // (Android browser 2.3 and 3 don't do typed arrays)
    else { getter = function() { this.responseBody; }}
    Object.defineProperty(XMLHttpRequest.prototype, "response", {get: getter});
  }(window));


  // IE9 does not have binary-to-ascii built in O_O
  if(!window.btoa) {
    // Code borrowed from PHP.js (http://phpjs.org/functions/base64_encode:358)
    window.btoa = function(data) {
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
      if (!data) { return data; }
      do { // pack three octets into four hexets
          o1 = data.charCodeAt(i++);
          o2 = data.charCodeAt(i++);
          o3 = data.charCodeAt(i++);
          bits = o1 << 16 | o2 << 8 | o3;
          h1 = bits >> 18 & 0x3f;
          h2 = bits >> 12 & 0x3f;
          h3 = bits >> 6 & 0x3f;
          h4 = bits & 0x3f;
          // use hexets to index into b64, and append result to encoded string
          tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);
      enc = tmp_arr.join('');
      var r = data.length % 3;
      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    };
  }

  /**

    Not-borrowed-code starts here!

   **/
  function Font() {
    // if this is not specified, a random name is used
    this.fontFamily = "fjs" + (999999 * Math.random() | 0);
  }

  // the font resource URL
  Font.prototype.url = "";

  // the font's format ('truetype' for TT-OTF or 'opentype' for CFF-OTF)
  Font.prototype.format = "";

  // the font's byte code
  Font.prototype.data = "";

  // custom font, implementing the letter 'A' as zero-width letter.
  Font.prototype.base64 = "AAEAAAAKAIAAAwAgT1MvMgAAAAAAAACsAAAAWGNtYXAA"+
                          "AAAAAAABBAAAACxnbHlmAAAAAAAAATAAAAAQaGVhZAAAA"+
                          "AAAAAFAAAAAOGhoZWEAAAAAAAABeAAAACRobXR4AAAAAA"+
                          "AAAZwAAAAIbG9jYQAAAAAAAAGkAAAACG1heHAAAAAAAAA"+
                          "BrAAAACBuYW1lAAAAAAAAAcwAAAAgcG9zdAAAAAAAAAHs"+
                          "AAAAEAAEAAEAZAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"+
                          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"+
                          "AAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAABAAMAAQA"+
                          "AAAwABAAgAAAABAAEAAEAAABB//8AAABB////wAABAAAA"+
                          "AAABAAAAAAAAAAAAAAAAMQAAAQAAAAAAAAAAAABfDzz1A"+
                          "AAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAEAAg"+
                          "AAAAAAAAABAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAA"+
                          "AAAAAAAAAAQAAAAAAAAAAAAAAAAAIAAAAAQAAAAIAAQAB"+
                          "AAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAIAHgADAAEEC"+
                          "QABAAAAAAADAAEECQACAAIAAAAAAAEAAAAAAAAAAAAAAA"+
                          "AAAA==";

  // these metrics represent the font-indicated values,
  // not the values pertaining to text as it is rendered
  // on the page (use fontmetrics.js for this instead).
  Font.prototype.metrics = {
    quadsize: 0,
    leading: 0,
    ascent: 0,
    descent: 0,
    weightclass: 400
  };

  // Will this be a remote font, or a system font?
  Font.prototype.systemfont = false;

  // internal indicator that the font is done loading
  Font.prototype.loaded = false;

  /**
   * This function gets called once the font is done
   * loading, its metrics have been determined, and it
   * has been parsed for use on-page. By default, this
   * function does nothing, and users can bind their
   * own handler function.
   */
  Font.prototype.onload = function () {};

  /**
   * This function gets called when there is a problem
   * loading the font.
   */
  Font.prototype.onerror = function () {};

  // preassigned quad × quad context, for measurements
  Font.prototype.canvas = false;
  Font.prototype.context = false;

  /**
   * validation function to see if the zero-width styled
   * text is no longer zero-width. If this is true, the
   * font is properly done loading. If this is false, the
   * function calls itself via a timeout
   */
  Font.prototype.validate = function (target, zero, mark, font, timeout) {
    if (timeout !== false && timeout < 0 ) {
      this.onerror("Requested system font '"+this.fontFamily+"' could not be loaded (it may not be installed).");
      return;
    }

    var computedStyle = document.defaultView.getComputedStyle(target, '');
    var width = computedStyle.getPropertyValue("width").replace("px", '');
    // font has finished loading - remove the zero-width and
    // validation paragraph, but leave the actual font stylesheet (mark);
    if (width > 0) {
      document.head.removeChild(zero);
      document.body.removeChild(target);
      this.loaded = true;
      this.onload();
    }
    // font has not finished loading - wait 50ms and try again
    else { setTimeout(function () { font.validate(target, zero, mark, font, timeout === false ? false : timeout-50); }, 50); }
  };

  /**
   * This gets called when the file is done downloading.
   */
  Font.prototype.ondownloaded = function () {
    var instance = this;

    // decimal to character
    var chr = function (val) {
      return String.fromCharCode(val);
    };

    // decimal to ushort
    var chr16 = function (val) {
      if (val < 256) { return chr(0) + chr(val); }
      var b1 = val >> 8;
      var b2 = val & 0xFF;
      return chr(b1) + chr(b2);
    };

    // decimal to hexadecimal
    // See http://phpjs.org/functions/dechex:382
    var dechex =  function (val) {
      if (val < 0) { val = 0xFFFFFFFF + val + 1; }
      return parseInt(val, 10).toString(16);
    };

    // unsigned short to decimal
    var ushort = function (b1, b2) {
      return 256 * b1 + b2;
    };

    // signed short to decimal
    var fword = function (b1, b2) {
      var negative = b1 >> 7 === 1, val;
      b1 = b1 & 0x7F;
      val = 256 * b1 + b2;
      // positive numbers are already done
      if (!negative) { return val; }
      // negative numbers need the two's complement treatment
      return val - 0x8000;
    };

    // unsigned long to decimal
    var ulong = function (b1, b2, b3, b4) {
      return 16777216 * b1 + 65536 * b2 + 256 * b3 + b4;
    };

    // unified error handling
    var error = function (msg) {
      instance.onerror(msg);
    };

    // we know about TTF (0x00010000) and CFF ('OTTO') fonts
    var ttf = chr(0) + chr(1) + chr(0) + chr(0);
    var cff = "OTTO";

    // so what kind of font is this?
    var data = this.data;
    var version = chr(data[0]) + chr(data[1]) + chr(data[2]) + chr(data[3]);
    var isTTF = (version === ttf);
    var isCFF = (isTTF ? false : version === cff);
    if (isTTF) { this.format = "truetype"; }
    else if (isCFF) { this.format = "opentype"; }
    // terminal error: stop running code
    else { error("Error: file at " + this.url + " cannot be interpreted as OpenType font."); return; }

    // ================================================================
    // if we get here, this is a legal font. Extract some font metrics,
    // and then wait for the font to be available for on-page styling.
    // ================================================================

    // first, we parse the SFNT header data
    var numTables = ushort(data[4], data[5]),
        tagStart = 12, ptr, end = tagStart + 16 * numTables, tags = {},
        tag;
    for (ptr = tagStart; ptr < end; ptr += 16) {
      tag = chr(data[ptr]) + chr(data[ptr + 1]) + chr(data[ptr + 2]) + chr(data[ptr + 3]);
      tags[tag] = {
        name: tag,
        checksum: ulong(data[ptr+4], data[ptr+5], data[ptr+6], data[ptr+7]),
        offset:   ulong(data[ptr+8], data[ptr+9], data[ptr+10], data[ptr+11]),
        length:   ulong(data[ptr+12], data[ptr+13], data[ptr+14], data[ptr+15])
      };
    }

    // first we define a quick error shortcut function:
    var checkTableError = function (tag) {
      if (!tags[tag]) {
        error("Error: font is missing the required OpenType '" + tag + "' table.");
        // return false, so that the result of this function can be used to stop running code
        return false;
      }
      return tag;
    };

    // Then we access the HEAD table for the "font units per EM" value.
    tag = checkTableError("head");
    if (tag === false) { return; }
    ptr = tags[tag].offset;
    tags[tag].version = "" + data[ptr] + data[ptr+1] + data[ptr+2] + data[ptr+3];
    var unitsPerEm = ushort(data[ptr+18], data[ptr+19]);
    this.metrics.quadsize = unitsPerEm;

    // We follow up by checking the HHEA table for ascent, descent, and leading values.
    tag = checkTableError("hhea");
    if (tag===false) { return; }
    ptr = tags[tag].offset;
    tags[tag].version = "" + data[ptr] + data[ptr+1] + data[ptr+2] + data[ptr+3];
    this.metrics.ascent  = fword(data[ptr+4], data[ptr+5]) / unitsPerEm;
    this.metrics.descent = fword(data[ptr+6], data[ptr+7]) / unitsPerEm;
    this.metrics.leading = fword(data[ptr+8], data[ptr+9]) / unitsPerEm;

    // And then finally we check the OS/2 table for the font-indicated weight class.
    tag = checkTableError("OS/2");
    if (tag===false) { return; }
    ptr = tags[tag].offset;
    tags[tag].version = "" + data[ptr] + data[ptr+1];
    this.metrics.weightclass = ushort(data[ptr+4], data[ptr+5]);

    // ==================================================================
    // Then the mechanism for determining whether the font is not
    // just done downloading, but also fully parsed and ready for
    // use on the page for typesetting: we pick a letter that we know
    // is supported by the font, and generate a font that implements
    // only that letter, as a zero-width glyph. We can then test
    // whether the font is available by checking whether a paragraph
    // consisting of just that letter, styled with "desiredfont, zwfont"
    // has zero width, or a real width. As long as it's zero width, the
    // font has not finished loading yet.
    // ==================================================================

    // To find a letter, we must consult the character map ("cmap") table
    tag = checkTableError("cmap");
    if (tag===false) { return; }
    ptr = tags[tag].offset;
    tags[tag].version = "" + data[ptr] + data[ptr+1];
    numTables = ushort(data[ptr+2], data[ptr+3]);

    // For the moment, we only look for windows/unicode records, with
    // a cmap subtable format 4 because OTS (the sanitiser used in
    // Chrome and Firefox) does not actually support anything else
    // at the moment.
    //
    // When http://code.google.com/p/chromium/issues/detail?id=110175
    // is resolved, remember to stab me to add support for the other
    // maps, too.
    //
    var encodingRecord, rptr, platformID, encodingID, offset, cmap314 = false;
    for (var encodingRecord = 0; encodingRecord < numTables; encodingRecord++) {
      rptr = ptr + 4 + encodingRecord * 8;
      platformID = ushort(data[rptr], data[rptr+1]);
      encodingID = ushort(data[rptr+2], data[rptr+3]);
      offset     = ulong(data[rptr+4], data[rptr+5], data[rptr+6], data[rptr+7]);
      if (platformID === 3 && encodingID === 1) { cmap314 = offset; }
    }

    // This is our fallback font - a minimal font that implements
    // the letter "A". We can transform this font to implementing
    // any character between 0x0000 and 0xFFFF by altering a
    // handful of letters.
    var printChar = "A";

    // Now, if we found a format 4 {windows/unicode} cmap subtable,
    // we can find a suitable glyph and modify the 'base64' content.
    if (cmap314 !== false) {
      ptr += cmap314;
      version = ushort(data[ptr], data[ptr+1]);
      if (version === 4) {
        // First find the number of segments in this map
        var segCount = ushort(data[ptr+6], data[ptr+7]) / 2;

        // Then, find the segment end characters. We'll use
        // whichever of those isn't a whitespace character
        // for our verification font, which we check based
        // on the list of Unicode 6.0 whitespace code points:
        var printable = function (chr) {
          return [0x0009,0x000A,0x000B,0x000C,0x000D,0x0020,0x0085,0x00A0,
                   0x1680,0x180E,0x2000,0x2001,0x2002,0x2003,0x2004,0x2005,
                   0x2006,0x2007,0x2008,0x2009,0x200A,0x2028,0x2029,0x202F,
                   0x205F,0x3000].indexOf(chr) === -1; }

        // Loop through the segments in search of a usable character code:
        var i = ptr + 14, e = ptr + 14 + 2 * segCount, endChar = false;
        for (; i < e; i += 2) {
          endChar = ushort(data[i], data[i+1]);
          if (printable(endChar)) { break; }
          endChar = false;
        }

        if (endChar !== false) {
          // We now have a printable character to validate with!
          // We need to make sure to encode the correct "idDelta"
          // value for this character, because our "glyph" will
          // always be at index 1 (index 0 is reserved for .notdef).
          // As such, we need to set up a delta value such that:
          //
          //   [character code] + [delta value] == 1
          //
          printChar = String.fromCharCode(endChar);
          var delta = -(endChar - 1) + 65536;

          // Now we need to substitute the values in our
          // base64 font template. The CMAP modification
          // consists of generating a new base64 string
          // for the bit that indicates the encoded char.
          // In our 'A'-encoding font, this is:
          //
          //   0x00 0x41 0xFF 0xFF 0x00 0x00
          //   0x00 0x41 0xFF 0xFF 0xFF 0xC0
          //
          // which is the 20 letter base64 string at [380]:
          //
          //   AABB//8AAABB////wAAB
          //
          // We replace this with our new character:
          //
          //   [hexchar] 0xFF 0xFF 0x00 0x00
          //   [hexchar] 0xFF 0xFF [ delta ]
          //
          // Note: in order to do so properly, we need to
          // make sure that the bytes are base64 aligned, so
          // we have to add a leading 0x00:
          var newhex = btoa(chr(0) +                         // base64 padding byte
                            chr16(endChar) + chr16(0xFFFF) + // "endCount" array
                            chr16(0) +                       // cmap required padding
                            chr16(endChar) + chr16(0xFFFF) + // "startCount" array
                            chr16(delta) +                   // delta value
                            chr16(1));                       // delta terminator

          // And now we replace the text in 'base64' at
          // position 380 with this new base64 string:
          this.base64 = this.base64.substring(0, 380) + newhex +
                         this.base64.substring(380 + newhex.length);
        }
      }
    }

    this.bootstrapValidation(printChar, false);
  }

  Font.prototype.bootstrapValidation = function (printChar, timeout) {
    // Create a stylesheet for using the zero-width font:
    var tfName = this.fontFamily+" testfont";
    var zerowidth = document.createElement("style");
    zerowidth.setAttribute("type", "text/css");
    zerowidth.innerHTML =  "@font-face {\n" +
                          "  font-family: '" + tfName + "';\n" +
                          "  src: url('data:application/x-font-ttf;base64," + this.base64 + "')\n" +
                          "       format('truetype');}";
    document.head.appendChild(zerowidth);

    // Create a validation stylesheet for the requested font, if it's a remote font:
    var realfont = false;
    if (!this.systemfont) {
      realfont = this.toStyleNode();
      document.head.appendChild(realfont);
    }

    // Create a validation paragraph, consisting of the zero-width character
    var para = document.createElement("p");
    para.style.cssText = "position: absolute; top: 0; left: 0; opacity: 0;";
    para.style.fontFamily = "'" + this.fontFamily + "', '" + tfName + "'";
    para.innerHTML = printChar + printChar + printChar + printChar + printChar +
                     printChar + printChar + printChar + printChar + printChar;
    document.body.appendChild(para);

    // Quasi-error: if there is no getComputedStyle, claim loading is done.
    if (!document.defaultView.getComputedStyle) {
      this.onload();
      error("Error: document.defaultView.getComputedStyle is not supported by this browser.\n" +
            "Consequently, Font.onload() cannot be trusted."); }

    // If there is getComputedStyle, we do proper load completion verification.
    else {
      // If this is a remote font, we rely on the indicated quad size
      // for measurements. If it's a system font there will be no known
      // quad size, so we simply fix it at 1000 pixels.
      var quad = this.systemfont ? 1000 : this.metrics.quadsize;

      // Because we need to 'preload' a canvas with this
      // font, we have no idea how much surface area
      // we'll need for text measurements later on. So
      // be safe, we assign a surface that is quad² big,
      // and then when measureText is called, we'll
      // actually build a quick <span> to see how much
      // of that surface we don't need to look at.
      var canvas = document.createElement("canvas");
      canvas.width = quad;
      canvas.height = quad;
      this.canvas = canvas;

      // The reason we preload is because some browsers
      // will also take a few milliseconds to assign a font
      // to a Canvas2D context, so if measureText is called
      // later, without this preloaded context, there is no
      // time for JavaScript to "pause" long enough for the
      // context to properly load the font, and metrics may
      // be completely wrong. The solution is normally to
      // add in a setTimeout call, to give the browser a bit
      // of a breather, but then we can't do synchronous
      // data returns, and we need a callback just to get
      // string metrics, which is about as far from desired
      // as is possible.
      var context = canvas.getContext("2d");
      context.font = "1em '" + this.fontFamily + "'";
      context.fillStyle = "white";
      context.fillRect(-1, -1, quad+2, quad+2);
      context.fillStyle = "black";
      context.fillText("test text", 50, quad / 2);
      this.context = context;

      // ===================================================
      // Thanks to Opera and Firefox, we need to add in more
      // "you can do your thing, browser" moments. If we
      // call validate() as a straight function call, the
      // browser doesn't get the breathing space to perform
      // page styling. This is a bit mad, but until there's
      // a JS function for "make the browser update the page
      // RIGHT NOW", we're stuck with this.
      // ===================================================

      // We need to alias "this" because the keyword "this"
      // becomes the global context after the timeout.
      var local = this;
      var delayedValidate = function() { local.validate(para, zerowidth, realfont, local, timeout); };
      setTimeout(delayedValidate, 50);
    }
  };

  /**
   * We take a different path for System fonts, because
   * we cannot inspect the actual byte code.
   */
  Font.prototype.processSystemFont = function () {
    // Mark system font use-case
    this.systemfont = true;
    // There are font-declared metrics to work with.
    this.metrics = false;
    // However, we do need to check whether the font
    // is actually installed.
    this.bootstrapValidation("A", 1000);
  }

  /**
   * This gets called when font.src is set, (the binding
   * for which is at the end of this file).
   */
  Font.prototype.loadFont = function () {
    var font = this;

    // System font?
    if(this.url.indexOf(".") === -1) {
      setTimeout(function(){
        font.processSystemFont();
      }, 10);
      return;
    }

    // Remote font.
    var xhr = new XMLHttpRequest();
    xhr.open('GET', font.url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (evt) {
      var arrayBuffer = xhr.response;
      if (arrayBuffer) {
        font.data = new Uint8Array(arrayBuffer);
        font.ondownloaded();
      } else {
        font.onerror("Error downloading font resource from "+font.url);
      }
    };
    xhr.send(null);
  };

  // The stylenode can be added to the document head
  // to make the font available for on-page styling,
  // but it should be requested with .toStyleNode()
  Font.prototype.styleNode = false;

  /**
   * Get the DOM node associated with this Font
   * object, for page-injection.
   */
  Font.prototype.toStyleNode = function () {
    // If we already built it, pass that reference.
    if (this.styleNode) { return this.styleNode; }
    // If not, build a style element
    this.styleNode = document.createElement("style");
    this.styleNode.type = "text/css";
    var styletext = "@font-face {\n";
       styletext += "  font-family: '" + this.fontFamily + "';\n";
       styletext += "  src: url('" + this.url + "') format('" + this.format + "');\n";
       styletext += "}";
    this.styleNode.innerHTML = styletext;
    return this.styleNode;
  }

  /**
   * Measure a specific string of text, given this font.
   * If the text is too wide for our preallocated canvas,
   * it will be chopped up and the segments measured
   * separately.
   */
  Font.prototype.measureText = function (textString, fontSize) {
    // error shortcut
    if (!this.loaded) {
      error("measureText() was called while the font was not yet loaded");
      return false;
    }

    // Set up the right font size.
    this.context.font = fontSize + "px '"+this.fontFamily+"'";

    // Get the initial string width through our preloaded Canvas2D context
    var metrics = this.context.measureText(textString);

    // Assign the remaining default values, because the
    // TextMetrics object is horribly deficient.
    metrics.fontsize = fontSize;
    metrics.ascent  = 0;
    metrics.descent = 0;
    metrics.bounds  = { minx: 0,
                        maxx: metrics.width,
                        miny: 0,
                        maxy: 0 };
    metrics.height = 0;

    // Does the text fit on the canvas? If not, we have to
    // chop it up and measure each segment separately.
    var segments = [],
        minSegments = metrics.width / this.metrics.quadsize;
    if (minSegments <= 1) { segments.push(textString); }
    else {
      // TODO: add the chopping code here. For now this
      // code acts as placeholder
      segments.push(textString);
    }

    // run through all segments, updating the metrics as we go.
    var segmentLength = segments.length, i;
    for (i = 0; i < segmentLength; i++) {
      this.measureSegment(segments[i], fontSize, metrics);
    }
    return metrics;
  };

  /**
   * Measure a section of text, given this font, that is
   * guaranteed to fit on our preallocated canvas.
   */
  Font.prototype.measureSegment = function(textSegment, fontSize, metrics) {
    // Shortcut function for getting computed CSS values
    var getCSSValue = function (element, property) {
      return document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
    };

    // We are going to be using you ALL over the place, little variable.
    var i;

    // For text leading values, we measure a multiline
    // text container as built by the browser.
    var leadDiv = document.createElement("div");
    leadDiv.style.position = "absolute";
    leadDiv.style.opacity = 0;
    leadDiv.style.font = fontSize + "px '" + this.fontFamily + "'";
    var numLines = 10;
    leadDiv.innerHTML = textSegment;
    for (i = 1; i < numLines; i++) {
      leadDiv.innerHTML += "<br/>" + textSegment;
    }
    document.body.appendChild(leadDiv);

    // First we guess at the leading value, using the standard TeX ratio.
    metrics.leading = 1.2 * fontSize;

    // We then try to get the real value based on how
    // the browser renders the text.
    var leadDivHeight = getCSSValue(leadDiv,"height");
    leadDivHeight = leadDivHeight.replace("px","");
    if (leadDivHeight >= fontSize * numLines) {
      metrics.leading = (leadDivHeight / numLines) | 0;
    }
    document.body.removeChild(leadDiv);

    // If we're not with a white-space-only string,
    // this is all we will be able to do.
    if (/^\s*$/.test(textSegment)) { return metrics; }

    // If we're not, let's try some more things.
    var canvas = this.canvas,
        ctx = this.context,
        quad = this.systemfont ? 1000 : this.metrics.quadsize,
        w = quad,
        h = quad,
        baseline = quad / 2,
        padding = 50,
        xpos = (quad - metrics.width) / 2;

    // SUPER IMPORTANT, HARDCORE NECESSARY STEP:
    // xpos may be a fractional number at this point, and
    // that will *complete* screw up line scanning, because
    // cropping a canvas on fractional coordiantes does
    // really funky edge interpolation. As such, we force
    // it to an integer.
    if (xpos !== (xpos | 0)) { xpos = xpos | 0; }

    // Set all canvas pixeldata values to 255, with all the content
    // data being 0. This lets us scan for data[i] != 255.
    ctx.fillStyle = "white";
    ctx.fillRect(-padding, -padding, w + 2 * padding, h + 2 * padding);
    // Then render the text centered on the canvas surface.
    ctx.fillStyle = "black";
    ctx.fillText(textSegment, xpos, baseline);

    // Rather than getting all four million+ subpixels, we
    // instead get a (much smaller) subset that we know
    // contains our text. Canvas pixel data is w*4 by h*4,
    // because {R,G,B,A} is stored as separate channels in
    // the array. Hence the factor 4.
    var scanwidth = (metrics.width + padding) | 0,
        scanheight = 4 * fontSize,
        x_offset = xpos - padding / 2,
        y_offset = baseline-scanheight / 2,
        pixelData = ctx.getImageData(x_offset, y_offset, scanwidth, scanheight).data;

    // Set up our scanline variables
    var i = 0,
        j = 0,
        w4 = scanwidth * 4,
        len = pixelData.length,
        mid = scanheight / 2;

    // Scan 1: find the ascent using a normal, forward scan
    while (++i < len && pixelData[i] === 255) {}
    var ascent = (i / w4) | 0;

    // Scan 2: find the descent using a reverse scan
    i = len - 1;
    while (--i > 0 && pixelData[i] === 255) {}
    var descent = (i / w4) | 0;

    // Scan 3: find the min-x value, using a forward column scan
    for (i = 0, j = 0; j < scanwidth && pixelData[i] === 255;) {
      i += w4;
      if (i >= len) { j++; i = (i - len) + 4; }}
    var minx = j;

    // Scan 3: find the max-x value, using a reverse column scan
    var step = 1;
    for (i = len-3, j = 0; j<scanwidth && pixelData[i] === 255; ) {
      i -= w4;
      if (i < 0) { j++; i = (len - 3) - (step++) * 4; }}
    var maxx = scanwidth - j;

    // We have all our metrics now, so fill in the
    // metrics object and return it to the user.
    metrics.ascent  = (mid - ascent);
    metrics.descent = (descent - mid);
    metrics.bounds  = { minx: minx - (padding / 2),
                        maxx: maxx - (padding / 2),
                        miny: -metrics.descent,
                        maxy: metrics.ascent };
    metrics.height = 1 + (descent - ascent);
    return metrics;
  };

  /**
   * we want Font to do the same thing Image does when
   * we set the "src" property value, so we use the
   * Object.defineProperty function to bind a setter
   * that does more than just bind values.
   */
  Object.defineProperty(Font.prototype, "src", { set: function(url) { this.url=url; this.loadFont(); }});


  /**
   * Bind to global scope
   */
  window.Font = Font;

}(window));

joe.Resources.FontEx = new joe.ClassEx(
{
  newFromResource: function(url, onLoadCallback, onErrorCallback, observer) {
    var newFont = new Font();
    var newFontEx = new joe.Resources.FontEx();
    
    newFont.fontFamily = url;
    newFontEx.setFont(newFont);
    
    if (observer && onLoadCallback) {
      newFont.onload = function() { onLoadCallback.call(observer, newFontEx); };
    }
    
    if (observer && onErrorCallback) {
      newFont.onerror = function() { onErrorCallback.call(observer, url); };
    }
    
    newFont.src = url;
    
    return newFontEx;
  }
},
{
  font: null,

  draw: function(context, text, x, y, color, size, hAlign, vAlign) {
    var textColor = color || "#00FFFF";
    var vertAlign = "top";
    var textSize = (size || 30) + "px";
    var measure = hAlign || vAlign ? this.measureText(text, size) : null;

    if (hAlign) {
      x = x - hAlign * (measure.bounds.maxx - measure.bounds.minx);
    }

    if (vAlign) {
      y = y - vAlign * (measure.bounds.maxy - measure.bounds.miny);
    }

    context.save();

    context.fillStyle    = textColor;
    context.font         = textSize + " '" + this.font.fontFamily + "'";
    context.textBaseline = vertAlign;
     
    context.fillText(text, x, y);
   
    context.restore();
  },
  
  setFont: function(font) {
    this.font = font;
  },
  
  getFont: function() {
    return this.font;
  },
  
  getMetrics: function() {
    return this.font ? this.font.metrics : null;
  },
  
  measureText: function(text, size) {
    return this.font ? this.font.measureText(text, size) : null;
  }
});// Modified from Dominic Szablewski's Impact engine (www.impactjs.com),
// version 1.23.

joe.Resources.BitmapFont = new joe.ClassEx(
	// Class Definition /////////////////////////////////////////////////////////
	{
		ALIGN: {
							LEFT: 0,
							RIGHT: 1,
							CENTER: 2
						},
		ALPHA_THRESHOLD: 128
	},
	// Instance Definition //////////////////////////////////////////////////////
	{
		widthMap: [],
		indices: [],
		firstChar: 32,
		alpha: 1,
		letterSpacing: 1,
		lineSpacing: 0,
		data: null,
		height: 0,
		width: 0,
		loaded: false,
		extImages: [],
		extBreakpoints: [],
		nLoaded: 0,
		metricsOut: {width:0, height:0},

		addImage: function(image) {
			this.extImages.push(image);
		},

		onLoad: function(image) {
			this.nLoaded += 1;

			if (this.nLoaded === this.extImages.length) {
				this._loadMetrics();
				this.loaded = true;
			}
		},

		_loadMetrics: function( ) {
			// Draw the bottommost line of this font image into an offscreen canvas
			// and analyze it pixel by pixel.
			// A run of non-transparent pixels represents a character and its width
			
			this.widthMap = [];
			this.indices = [];
			this.height = this.extImages[0].height - 1;
			this.width = this.extImages[0].width;
			
			var px = null;
			var currentImage = 0;
			var currentChar = 0;
			var currentWidth = 0;
			var lastChar = -1;
			for (var i=0; i<this.extImages.length; ++i) {
				image = this.extImages[i];
				this.extBreakpoints.push(currentChar);
				currentWidth = 0;

				if (image) {
						canvas = document.createElement('canvas');
						canvas.width = image.width;
						canvas.height = image.height;
						ctx = canvas.getContext('2d');
						ctx.drawImage( image, 0, 0 );
						px = this._getImagePixels(image, 0, image.height-1, image.width, 1);
				}
				else {
					break;
				}

				for( var x = 0; x < image.width; x++ ) {
					var index = x * 4 + 3; // alpha component of this pixel
					if( px.data[index] > joe.Resources.BitmapFont.ALPHA_THRESHOLD ) {
						currentWidth++;
					}
					else if( px.data[index] < joe.Resources.BitmapFont.ALPHA_THRESHOLD && currentWidth ) {
						this.widthMap.push( currentWidth );
						this.indices.push( x-currentWidth );
						currentChar++;
						currentWidth = 0;
						lastChar = currentChar;
					}
				}

				if (lastChar != currentChar) {
					this.widthMap.push( currentWidth );
					this.indices.push( x-currentWidth );
					lastChar = currentChar;
				}
			}
		},

		draw: function( gfx, text, x, y, align, vAlign ) {
			var horzAlign = (1 - (vAlign || 0.5)) * (this.height + this.lineSpacing);

			if( typeof(text) != 'string' ) {
				text = text.toString();
			}
			
			// Multiline?
			if( text.indexOf('\n') !== -1 ) {
				var lines = text.split( '\n' );
				var lineHeight = this.height + this.lineSpacing;
				for( var i = 0; i < lines.length; i++ ) {
					this.draw( gfx, lines[i], x, y + i * lineHeight, align );
				}
				return;
			}
			
			if( align == joe.Resources.BitmapFont.ALIGN.RIGHT || align == joe.Resources.BitmapFont.ALIGN.CENTER ) {
				var width = this._widthForLine( text );
				x -= align == joe.Resources.BitmapFont.ALIGN.CENTER ? width/2 : width;
			}
			

			if( this.alpha !== 1 ) {
				joe.Graphics.setGlobalAlpha(this.alpha);
			}

			for( var i = 0; i < text.length; i++ ) {
				var c = text.charCodeAt(i);
				x += this._drawChar( gfx, c - this.firstChar, x, y - horzAlign);
			}

			if( this.alpha !== 1 ) {
				joe.Graphics.setGlobalAlpha(1);
			}
		},

		measureText: function(text) {
			this.metricsOut.width = this.widthForString(text);
			this.metricsOut.height = this.height;

			return this.metricsOut;
		},
		
		widthForString: function( text ) {
			// Multiline?
			if( text.indexOf('\n') !== -1 ) {
				var lines = text.split( '\n' );
				var width = 0;
				for( var i = 0; i < lines.length; i++ ) {
					width = Math.max( width, this._widthForLine(lines[i]) );
				}
				return width;
			}
			else {
				return this._widthForLine( text );
			}
		},
		
		_widthForLine: function( text ) {
			var width = 0;
			for( var i = 0; i < text.length; i++ ) {
				width += this.widthMap[text.charCodeAt(i) - this.firstChar] + this.letterSpacing;
			}
			return width;
		},

		heightForString: function( text ) {
			return text.split('\n').length * (this.height + this.lineSpacing);
		},


		_drawChar: function( gfx, c, targetX, targetY ) {
			if( !this.loaded || c < 0 || c >= this.indices.length ) { return 0; }
			
			var curImage = this.extImages[0],
					scale = 1;
			
			// Figure out which image to use.
			for (var i=0; i<this.extImages.length; ++i) {
				if (c >= this.extBreakpoints[i]) {
					curImage = this.extImages[i];
				}
			}

			var charX = this.indices[c] * scale;
			var charY = 0;
			var charWidth = this.widthMap[c] * scale;
			var charHeight = (this.height-2) * scale;		
			
			gfx.drawImage( 
				curImage,
				charX, charY,
				charWidth, charHeight,
				targetX, targetY,
				charWidth, charHeight
			);
			
			return this.widthMap[c] + this.letterSpacing;
		},
		
		_getVendorAttribute: function( el, attr ) {
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
		},

		_normalizeVendorAttribute: function( el, attr ) {
			var prefixedVal = this._getVendorAttribute( el, attr );
			if( !el[attr] && prefixedVal ) {
				el[attr] = prefixedVal;
			}
		},

		_setVendorAttribute: function( el, attr, val ) {
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
		},

		_getImagePixels: function( image, x, y, width, height ) {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext('2d');
			
			// Try to draw pixels as accurately as possible
			this._CRISP(canvas, ctx);

			var ratio = this._getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
			this._normalizeVendorAttribute( ctx, 'getImageDataHD' );

			var realWidth = image.width / ratio,
				realHeight = image.height / ratio;

			canvas.width = Math.ceil( realWidth );
			canvas.height = Math.ceil( realHeight );

			ctx.drawImage( image, 0, 0, realWidth, realHeight );
			
			return (ratio === 1)
				? ctx.getImageData( x, y, width, height )
				: ctx.getImageDataHD( x, y, width, height );
		},

		_CRISP: function( canvas, context ) {
			this._setVendorAttribute( context, 'imageSmoothingEnabled', false );
			canvas.style.imageRendering = '-moz-crisp-edges';
			canvas.style.imageRendering = '-o-crisp-edges';
			canvas.style.imageRendering = '-webkit-optimize-contrast';
			canvas.style.imageRendering = 'crisp-edges';
			canvas.style.msInterpolationMode = 'nearest-neighbor'; // No effect on Canvas :/
		},
	}
);
// [HELP]
// <h1>joe.Sound</h1><hr>
// <em>Allows programs to load and play sounds.</em>
//
// <strong>Interface</strong>
// joe.Sound.setMasterVolume(newVolume); /*Where newVolume must be in the range [0, 1];*/
// var volume = joe.Sound.getMasterVolume();
// var newSound = joe.Sound.load(soundName, onLoadedCallback, onErrorCallback, nChannels, repeatDelay);
// joe.Sound.deactivate();
// joe.Sound.activate();
// joe.Sound.stopAll();
// joe.Sound.resetAll();
// joe.Sound.unloadAll();
// joe.Sound.unload(soundName);
//
// <strong>Use</strong>
// <pre> joe.Sound.init();
// var newSound = joe.Sound.load(soundName, onLoadedCallback.bind(this), onErrorCallback.bind(this), nChannels, repeatDelay);
//
// /* Where soundName is the name of an audio resource uploaded to the server.
//       nChannels is the max number of voices that can play this sound simultaneously.
//       repeatDelay is the time, in seconds, that must pass before a subsequent voice is allowed to play.
//       onLoadedCallback(soundName, nChannels, loadEvent) is a function that will be called when
//       the sound data has loaded. */
//
// var channelIndex = joe.Sound.play(newSound);
// Returns index of the channel that was played. -1 indicates the sound didn't play.
//
// joe.Sound.loop(newSound);
// joe.Sound.stop(newSound);
// joe.Sound.pause(newSound);
// joe.Sound.resume(newSound);
//
// [END HELP]

joe.Sound = new joe.ClassEx({
// Class Definitions /////////////////////////////////////////////////////////////////
  FORMAT: {
	    MP3: {ext: 'mp3', mime: 'audio/mpeg'},
	    OGG: {ext: 'ogg', mime: 'audio/ogg; codecs=vorbis'}
	  },
  DEFAULT_CHANNELS: 2,
  DEFAULT_DELAY:    0.1,
  STOP_ALL_CHANNELS:-1,
  INVALID_CHANNEL:  -99,
	  
  isEnabled:       true,
  isAvailable:     window.Audio,
  preferredFormat: null,
  sounds:          {},
  masterVolume:    1.0,
  
  init: function() {
    var capTester = new Audio();
    var iFormat = 0;
    
    for (iFormat in joe.Sound.FORMAT) {
      if (capTester.canPlayType(joe.Sound.FORMAT[iFormat].mime)) {
        joe.Sound.preferredFormat = joe.Sound.FORMAT[iFormat];
        break;
      }
    }
    
    if (!joe.Sound.preferredFormat) {
      joe.Sound.isAvailable = false;
      joe.Sound.isEnabled = false;
    }
  },
  
  activate: function() {
    joe.Sound.isEnabled = true;
  },
  
  deactivate: function() {
    joe.Sound.stopAll();
    joe.Sound.isEnabled = false;
  },
  
  getFreeChannelIndex: function(sound, now) {
    var i = 0;
    var iChannel = joe.Sound.INVALID_CHANNEL;
    var mostDelay = 0;
    var testDelay = 0;
    
    if (sound && sound.channels.length && sound.playing.length && sound.lastPlayTime.length) {
      for (var i=0; i<sound.channels.length; ++i) {
        testDelay = (now - sound.lastPlayTime[i]) * 0.001;
        if (testDelay > mostDelay && testDelay > sound.minDelay) {
          mostDelay = testDelay;
          iChannel = i;
        }
      }
    }
    
    return iChannel;
  },
  
  play: function(sound, volume) {
    var totalVolume = typeof(volume) === 'undefined' ? 1 : volume;
    totalVolume = joe.Sound.clampVolume(totalVolume * joe.Sound.getMasterVolume());
    var playedIndex = joe.Sound.INVALID_CHANNEL;
    var now = Date.now();
    
    if (sound) {
      playedIndex = joe.Sound.getFreeChannelIndex(sound, now);
      
      try {
        if (playedIndex !== joe.Sound.INVALID_CHANNEL) {
          sound.iChannel = playedIndex;
          sound.lastPlayTime[playedIndex] = now;
          sound.channels[playedIndex].pause();
          sound.channels[playedIndex].loop = false;
          sound.channels[playedIndex].volume = totalVolume;
          sound.channels[playedIndex].currentTime = 0;
          sound.playing[playedIndex] = true;
          sound.channels[playedIndex].play();
        }
      }
      catch(err) {
        // Error message?
      }
    }
    
    return playedIndex;
  },
  
  loop: function(sound, volume) {
    var now = Date.now();
    var totalVolume = typeof(volume) === 'undefined' ? 1 : volume;
    totalVolume = joe.Sound.clampVolume(totalVolume * joe.Sound.getMasterVolume());
    var playedIndex = joe.Sound.INVALID_CHANNEL;
    
    if (sound) {
      playedIndex = joe.Sound.getFreeChannelIndex(sound, now);
      
      try {
        if (playedIndex !== joe.Sound.INVALID_CHANNEL) {
          sound.iChannel = playedIndex;
          sound.lastPlayTime[playedIndex] = now;
          sound.channels[playedIndex].pause();
          sound.channels[playedIndex].loop = true;
          sound.channels[playedIndex].volume = totalVolume;
          sound.channels[playedIndex].currentTime = 0;
          sound.playing[playedIndex] = true;
          sound.channels[playedIndex].play();
        }
      }
      catch(err) {
        // Error message?
      }
    }
    
    return playedIndex;
  },
  
  pause: function(sound, channelIndex) {
    var iChannel = 0;
    var iStart = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? 0 : channelIndex;
    var iEnd = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;
    
    for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
      sound.channels[iChannel].pause();
      sound.playing[iChannel] = false;
    }
  },
  
  resume: function(sound, channelIndex) {
    var iChannel = 0;
    var iStart = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? 0 : channelIndex;
    var iEnd = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;
    
    for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
      sound.channels[iChannel].play();
      sound.playing[iChannel] = true;
    }
  },
  
  stop: function(sound, channelIndex) {
    var iChannel = 0;
    var iStart = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? 0 : channelIndex;
    var iEnd = typeof(channelIndex) === 'undefined' || channelIndex === joe.Sound.INVALID_CHANNEL ? sound.channels.length - 1 : channelIndex;

    if (channelIndex === joe.Sound.STOP_ALL_CHANNELS) {
      iStart = 0;
      iEnd = sound.channels.length - 1;
    }
    
    try {
      for (iChannel = iStart; iChannel <= iEnd; ++iChannel) {
        sound.channels[iChannel].pause();
        sound.channels[iChannel].loop = false;
        sound.channels[iChannel].currentTime = 0;
        sound.playing[iChannel] = false;
      }
    }
    catch(err) {
      // Error message?
    }
  },
  
  stopAll: function() {
    var key;
    
    for (key in joe.Sound.sounds) {
      joe.Sound.stop(joe.Sound.sounds[key], joe.Sound.STOP_ALL_CHANNELS);
    }
  },
  
  setMasterVolume: function(newMasterVolume) {
    joe.Sound.masterVolume = joe.Sound.clampVolume(newMasterVolume);
  },
  
  getMasterVolume: function() {
    return joe.Sound.masterVolume;
  },
  
  clampVolume: function(volume) {
    return Math.min(1, Math.max(0, volume));
  },
  
  load: function(resourceName, onLoadedCallback, onErrorCallback, nChannels, replayDelay) {
    var numChannels = nChannels || joe.Sound.DEFAULT_CHANNELS;
    var minReplayDelay = replayDelay || joe.Sound.DEFAULT_DELAY;
    
    var path = resourceName;
    var extension = path.substring(path.lastIndexOf("."));
    var nNewChannels = 0;
    var i = 0;
    var newChannel = null;

    if (joe.Sound.preferredFormat) {
      if (extension) {
        path = path.replace(extension, "");
      }
    
      path = path + "." + joe.Sound.preferredFormat.ext;
      
      if (!joe.Sound.sounds[resourceName] ||
        joe.Sound.sounds[resourceName].length < nChannels) {
      
        if (!joe.Sound.sounds[resourceName]) {
          joe.Sound.sounds[resourceName] = {
            channels:     [],
            playing:      [],
            lastPlayTime: [],
            minDelay:     minReplayDelay,
          };
        }
        
        nNewChannels = numChannels - joe.Sound.sounds[resourceName].channels.length;
        for (i=0; i<nNewChannels; ++i) {
          newChannel = new Audio(path);
          
          if (onLoadedCallback) {
            newChannel.addEventListener('canplaythrough', function callback() {
              onLoadedCallback(joe.Sound.sounds[resourceName], resourceName);
            }, false);
          }
          
          if (onErrorCallback) {
            newChannel.addEventListener('onerror', function callback() {
              onErrorCallback(resourceName);
            }, false);
          }
        
          newChannel.preload = "auto";
          newChannel.load();
          joe.Sound.sounds[resourceName].channels.push(newChannel);
          joe.Sound.sounds[resourceName].playing.push(false);
          joe.Sound.sounds[resourceName].lastPlayTime.push(0);
        }
      }
    }
    else if (onLoadedCallback) {
      onLoadedCallback(resourceName, "Error: no preferred format");
    }
    
    return joe.Sound.sounds[resourceName];
  },
},  
{
// Instance Definitions //////////////////////////////////////////////////////////////
  audioClip: null,
  
});

joe.Sound.init();// Contains modules that implement common physics behaviors.

joe.kinematicObject = {
  pos: null,
  vel: null,
  acc: null,
  oldPos: null,

  kinInit: function(x, y, vx, vy, ax, ay) {
    this.pos = new joe.MathEx.vec2(x || 0, y || 0);
    this.vel = new joe.MathEx.vec2(vx || 0, vy || 0);
    this.acc = new joe.MathEx.vec2(ax || 0, ay || 0);
    this.oldPos = new joe.MathEx.vec2(this.pos.x, this.pos.y);
  },

  kinUpdate: function(dt) {
    var newVx = this.vel.x + this.acc.x * dt;
    var newVy = this.vel.y + this.acc.y * dt;
    var vAveX = (newVx + this.vel.x) * 0.5;
    var vAveY = (newVy + this.vel.y) * 0.5;
    var newX = this.pos.x + vAveX * dt;
    var newY = this.pos.y + vAveY * dt;

    this.vel.x = newVx;
    this.vel.y = newVy;

    this.oldPos.x = this.pos.x;
    this.oldPos.y = this.pos.y;

    this.pos.x = newX;
    this.pos.y = newY;
  },

  getX: function() {
    return this.pos.x;
  },

  getY: function() {
    return this.pos.y;
  },

  getPosRef: function() {
    return this.pos;
  }
},

joe.physicsCollider = {
  bounds: null,
  collisionMasks: {blocks: 0, blockedBy: 0},

  collideInit: function(x, y, w, h, blocksMask, blockedByMask) {
    this.bounds = new joe.MathEx.rect2(0, 0, 0, 0),
    this.bounds.x = x || 0;
    this.bounds.y = y || 0;
    this.bounds.w = w || 0;
    this.bounds.h = h || 0;

    this.collisionMasks.blocks = blocksMask;
    this.collisionMasks.blockedBy = blockedByMask;
  },

  getHeight: function() {
    return this.bounds.h;
  },

  getWidth: function() {
    return this.bounds.w;
  },

  getBoundsRef: function() {
    return this.bounds;
  },

  isBlockedBy: function(blockMask) {
    return (this.collisionMasks.blockedBy & blockMask) !== 0;
  },

  blocks: function(isBlockedBy) {
    return (this.collisionMasks.blocks & isBlockedBy) !== 0;
  },

  onBlockedBy: function(blocker) {
    if (blocker) {
      // TODO: 
    }
  },

  getBlocksMask: function() {
    return this.collisionMasks.blocks;
  },

  getBlockedByMask: function() {
    return this.collisionMasks.blockedBy;
  },
};

// The Collider manages interactions between collidable entities.

joe.Collider = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
  collisionGroups: [],

  getCollisionGroupFromMask: function(mask) {
    var iGroup = 0,
        group = null;

    if (mask) {
      for (iGroup=0; iGroup<this.collisionGroups.length; ++iGroup) {
        if (this.collisionGroups[iGroup].mask === mask) {
          group = this.collisionGroups[iGroup];
          break;
        }
      }
    }

    return group;
  },

  addToCollisionGroup: function(mover) {
    var group = null,
        blocksMask = mover ? mover.getBlocksMask() : 0;

    group = getCollisionGroupFromMask(blocksMask);

    if (group) {
      group.list.push(mover);
    }
    else if (blocksMask) {
      group = {mask: blocksMask, list:[]};
      group.list.push(mover);
      this.collisionGroups.push(group);
    }
  },

  removeFromCollisionGroup: function(mover) {
    var group = null,
        blocksMask = mover ? mover.getBlocksMask() : 0;

    group = getCollisionGroupFromMask(blocksMask);

    if (group) {
      joe.Utiliy.fastErase(group.list, mover);
    }
  },

  collide: function(collider) {
    // Colliders must have the following interface:
    // getBounds(): returns {x:#, y:#, w:#, h:#}
    // isBlockedBy(): returns an 8-bit number representing collision flags.
    // onBlockedBy(blocker): called to notify mover of a collision.

    var bCollided = false,
        blocker = null;

    // TODO: collide with static geometry.

    if (!bCollided) {
      blocker = collideWithmovers(collider);
      if (blocker) {
        collider.onCollidedWith(blocker);
        bCollided = true;
      }
    }

    // TODO: collide with dynamic, non-mover objects.
  }
},
{
  // Instance Definition //////////////////////////////////////////////////////
})// TODO: add support for a 'Scene' object? What would that be?

joe.Scene = {
  DEFAULTS: {
              VIEW_ORDER: 100
            },

  views: [],
  viewPort: {x:0, y:0, w:joe.Graphics.getWidth(), h:joe.Graphics.getHeight()},
  ioIndex: 0,

  getFirstViewContainingPoint: function(x, y) {
    var i=0;

    this.ioIndex = -1;
    return this.getNextViewContainingPoint(x, y);
  },

  getNextViewContainingPoint: function(x, y) {
    var i=0,
        view = null;

    for (i=this.ioIndex+1; i<this.views.length; ++i) {
      if (joe.MathEx.rectContainsPoint(this.views[i].view.getWorldRect(), x, y)) {
        this.ioIndex = i;
        view = this.views[i].view;
        break;
      }
    }

    return view;
  },

  addView: function(view, zOrder) {
    var i = 0,
        bInserted = false;

    zOrder = zOrder || joe.Scene.DEFAULTS.VIEW_ORDER;

    if (view) {
      for (i=0; i<this.views.length; ++i) {
        if (this.views[i].zOrder >= zOrder) {
          this.views.splice(i, 0, {view:view, zOrder:zOrder});
          bInserted = true;
          break;
        }
      }

      if (!bInserted) {
        this.views.push({view:view, zOrder:zOrder});
        bInserted = true;
      }
    }

    return bInserted;
  },

  removeView: function(view) {
    var i = 0,
        bRemoved = false;

    for (i=0; i<this.views.length; ++i) {
      if (this.views.view === view) {
        joe.Utility.erase(this.views, this.views[i]);
        bRemoved = true;
      }
    }
  },

  draw: function(gfx) {
    var i = 0,
        clippedRect = null;

    for (i=this.views.length - 1; i>=0; --i) {
      clippedRect = joe.MathEx.clip(this.viewPort, this.views[i].view.getWorldRect());
      if (clippedRect && clippedRect.w && clippedRect.h) {
        this.views[i].view.draw(gfx);
      }
    }
  }, 

  LayerInterface: {
    parent: null,

    setParent: function(view) {
      this.parent = view;
    },

    drawClipped: function(gfx) {
      // Override to provide custom functionality.
    },

    // Default IO handlers.
    mouseDown: function(x, y) {
      return true;
    },

    mouseOver: function(x, y) {
      return true;
    },

    mouseHold: function(x, y) {
      return true;
    },

    mouseDrag: function(x, y) {
      return true;
    },

    mouseUp: function(x, y) {
      return true;
    },

    touchDown: function(id, x, y) {
      return true;
    },

    touchMove: function(id, x, y) {
      return true;
    },

    touchDown: function(id, x, y) {
      return true;
    }
  } 
};



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
    return this.srcTransInfo.bTransitioning || this.destTransInfo.bTransitioning;
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

// A view is a component of a scene that knows how to render itself.
// It may be composed of layers and is rendered to a viewport via a camera.
//
// Layers are arranged by zOrder, with order 0 at the front of the screen, and
// high-ordered layers moving further to the rear of the view.

joe.Scene.View = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
},
{
  // Instance Definition //////////////////////////////////////////////////////
  width: 0,
  height: 0,
  camera: null,
  layers: [],
  workPos: {x:0, y:0},

  init: function(width, height, viewportWidth, viewportHeight) {
    this.width = width;
    this.height = height;
    this.camera = new joe.Scene.Camera(viewportWidth, viewportHeight);

    this.setWorldPos(0, 0);
    this.setSourcePos(0, 0);
  },

  getLayer: function(index) {
    return index >= 0 && index < this.layers.length ? this.layers[index].layer : null;
  },

  isTransitioning: function() {
    return this.camera.isTransitioning();
  },

  getViewport: function() {
    return this.camera;
  },

  setSourceTransition: function(wantX, wantY, wantAnchorX, wantAnchorY, transDuration) {
    joe.assert(this.camera, joe.Strings.ASSERT_VIEW_NO_CAMERA_AVAILABLE);

    this.camera.setSourceTransition(wantX, wantY, wantAnchorX, wantAnchorY, transDuration);
  },

  setWorldTransition: function(wantX, wantY, wantAnchorX, wantAnchorY, transDuration) {
    joe.assert(this.camera, joe.Strings.ASSERT_VIEW_NO_CAMERA_AVAILABLE);

    this.camera.setDestTransition(wantX, wantY, wantAnchorX, wantAnchorY, transDuration);
  },

  setWorldPos: function(x, y) {
    if (this.camera) {
      this.camera.setDestPosition(x, y);
    }
  },

  getWorldPos: function(x, y) {
    this.workPos.x = x;
    this.workPos.y = y;
    
    return this.camera.viewToWorldPos(this.workPos);
  },

  getWorldRect: function() {
    return this.camera.getScreenRect();
  },

  setSourcePos: function(x, y) {
    if (this.camera) {
      this.camera.setSourcePosition(x, y);
    }
  },

  getSourceRect: function() {
    joe.assert(this.camera, joe.Strings.ASSERT_VIEW_NO_CAMERA_AVAILABLE);

    return this.camera.getSourceRect();
  },

  getBounds: function() {
    return this.camera.getScreenRect();
  },

  draw: function(gfx) {
    var iLayer = 0,
        camGfx = null;

    joe.assert(this.camera);

    camGfx = this.camera.getGraphics();
    camGfx.save();

    // Render layers into the camera's buffer.
    for (iLayer=this.layers.length-1; iLayer>=0; --iLayer) {
      this.layers[iLayer].layer.drawClipped(this.camera.getGraphics(),
                                            this.camera.getSourceRect(),
                                            this.camera.getMagnification());
    }

    // Draw the camera's buffer into the primary buffer.
    if (this.layers.length) {
      this.camera.draw(gfx);
    }

    camGfx.restore();
  },

  addLayer: function(layer, zOrder) {
    var iLayer = 0,
        bInserted = false;

    joe.assert(layer);

    for (iLayer=0; iLayer<this.layers.length; ++iLayer) {
      if (this.layers[iLayer].zOrder >= zOrder) {
        // Insert the layer at this point in the array;
        this.layers.splice(iLayer, 0, {layer:layer, zOrder:zOrder});
        layer.setParent(this);
        bInserted = true;
        break;
      }
    }

    if (!bInserted) {
      this.layers.push({layer:layer, zOrder:zOrder});
      layer.setParent(this);
    }

    return layer;
  }
});


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

// "Sprites" layers render sprites into a scene. Each sprite receives a z-order, with 0
// representing the foreground and higher numbers moving further into the background.
// Layers are responsible for calling 'update' and 'draw' for the sprites in their view.

// TODO: implement interface
// drawClipped(gfx, srcRect, scale) -- draws the layer and returns the bounds of the drawn area.

joe.Scene.SpriteLayer = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
},
{
  // Instance Definition //////////////////////////////////////////////////////
  requires: joe.Scene.LayerInterface,
  
  sprites: [],

  addSprite: function(sprite, zOrder) {
    // Insert at the start of all sprites with identical zOrder.
    var insertAt = zOrder || 0,
        i = 0,
        bInserted = false;

    for (i=0; i<this.sprites.length; ++i) {
      if (this.sprites[i].getZOrder() >= insertAt) {
        // Insert the sprite here.
        this.sprites.splice(i, 0, sprite);
        bInserted = true;
        break;
      }
    }

    if (!bInserted) {
      // Add to the end.
      this.sprites.push(sprite);
    }

    sprite.setZOrder(zOrder);
  },

  removeSprite: function(sprite) {
    joe.Utility.erase(this.sprites, sprite);
  },

  drawClipped: function(gfx, srcRect, scale) {
    var i=0;

    if (gfx && srcRect) {
      gfx.save();

      scale = scale || 1;

      if (Math.abs(scale - 1) > joe.MathEx.EPSILON) {
        gfx.scale(scale, scale);
      }

      // Loop through sprites from back to front...
      for (i=this.sprites.length - 1; i >= 0; --i) {

        // ...clip against the view and draw if visible.
        if (joe.MathEx.clip(srcRect, this.sprites[i].bounds)) {
          this.sprites[i].drawToWorld(gfx, srcRect.x, srcRect.y);
        }
      }

      gfx.restore();
    }
  },
});

joe.SpriteSheet = new joe.ClassEx({
  // Class Definition /////////////////////////////////////////////////////////
},
{
  // Instance Definition //////////////////////////////////////////////////////
  srcImage: null,
  rows: 0,
  cols: 0,
  spriteWidth: 0,
  spriteHeight: 0,
  alignX: 0,
  alignY: 0,

  init: function(srcImage, rows, cols, alignX, alignY) {
    this.srcImage = srcImage;
    this.rows = Math.max(1, rows);
    this.cols = Math.max(1, cols);
    this.spriteWidth = this.srcImage.width / this.cols;
    this.spriteHeight = this.srcImage.height / this.rows;
    this.setAlignment(alignX, alignY);
  },

  setAlignment: function(alignX, alignY) {
    this.alignX = alignX || 0;
    this.alignY = alignY || 0;
  },

  getCellWidth: function() {
    return this.spriteWidth;
  },

  getCellHeight: function() {
    return this.spriteHeight;
  },

  draw: function(gfx, x, y, row, col) {
    var index = row;

    if (typeof(col) === 'undefined') {
      // Interpret the 'row' as a pure index.
      row = Math.floor(index / this.cols);
      col = index % this.cols;
    }

    joe.assert(row >= 0 && row < this.rows, "Rows = " + this.rows);
    joe.assert(typeof(col) === 'undefined' || (col >= 0 && col < this.cols));
    joe.assert(gfx);


    gfx.drawImage(this.srcImage, col * this.spriteWidth, row * this.spriteHeight, this.spriteWidth, this.spriteHeight,
                  x - this.alignX * this.spriteWidth, y - this.alignY * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
});
// 2D animated game object, possibly with a collision model. Usually rendered
// as part of a SpriteLayer object (see LayerSprite.js).

joe.Sprite = new joe.ClassEx({

},
[
  joe.kinematicObject,
  joe.physicsCollider,
  {
    spriteSheet: null,
    align: {x:0, y:0},
    frameIndex: 0,
    zOrder: 0,
    
    init: function(spriteSheet, frameIndex, alignX, alignY, x, y, vx, vy, ax, ay, blocksMask, blockedByMask) {
      joe.assert(spriteSheet);

      this.spriteSheet = spriteSheet;
      this.spriteSheet.setAlignment(alignX, alignY);
      this.frameIndex = frameIndex || 0;

      this.kinInit(x, y, vx, vy, ax, ay);
      this.collideInit(x,
                       y,
                       this.spriteSheet ? this.spriteSheet.getCellWidth() : 0,
                       this.spriteSheet ? this.spriteSheet.getCellHeight() : 0,
                       blocksMask,
                       blockedByMask);

      // TODO: add collision callback?
    },

    setZOrder: function(zOrder) {
      this.zOrder = zOrder;
    },

    getZOrder: function() {
      return this.zOrder;
    },

    setAlignment: function(alignX, alignY) {
      joe.assert(this.spriteSheet);
      this.spriteSheet.setAlignment(alignX, alignY);
    },

    setFrame: function(index) {
      this.frameIndex = index;
    },

    draw: function(gfx) {
      joe.assert(this.spriteSheet);

      this.spriteSheet.draw(gfx, this.pos.x, this.pos.y, this.frameIndex);
    },

    drawToWorld: function(gfx, worldX, worldY) {
      joe.assert(this.spriteSheet);

      this.spriteSheet.draw(gfx, this.pos.x - worldX, this.pos.y - worldY, this.frameIndex);
    },

    update: function(dt, gameTime) {
      this.kinUpdate(dt);
    },

    setPos: function(x, y) {
      this.pos.x = x;
      this.pos.y = y;

      this.updateBounds(x, y);
    },

    updateBounds: function(x, y) {
      this.bounds.x = this.pos.x - this.align.x * this.bounds.w;
      this.bounds.y = this.pos.y - this.align.y * this.bounds.h;
    }
  }
]);

/**
 * Manages gui elements.
 */

joe.GuiClass = new joe.ClassEx(
  null,
  {
    requires: joe.Listeners,
    
    widgets: [],
    focusWidget: null,
    viewOffset: {x:0, y:0},
    clipRect: null,
    curTouchID: -1,

    getContext: function() {
      return this.widgets;
    },

    setContext: function(widgetList) {
      this.widgets = widgetList;
    },

    newContext: function() {
      var oldContext = this.widgets;

      this.widgets = [];

      return oldContext;
    },

    setViewOffset: function(x, y) {
      this.viewOffset.x = x;
      this.viewOffset.y = y;
    },

    setClipRect: function(clipRect) {
      this.clipRect = clipRect;
    },

    addWidget: function(widget, toFront) {
      toFront ? this.widgets.unshift(widget) : this.widgets.push(widget);

      return widget;
    },

    removeWidget: function(widget) {
      joe.Utility.erase(this.widgets, widget);
    },

    setFocusWidget: function(widget) {
      this.focusWidget = widget;
    },

    update: function(dt, gameTime) {
      // Update widgets.
      var i = 0;

      for (i=0; i<this.widgets.length; ++i) {
        if (this.widgets[i].widgetActive()) {
          this.widgets[i].updateWidget(dt, gameTime, 0, 0);
        }
      }
    },

    draw: function(context) {
      // Draw widgets.
      var i = 0;

      for (i=0; i<this.widgets.length; ++i) {
        if (this.widgets[i].widgetVisible()) {
          if (!this.clipRect || joe.MathEx.clip(this.clipRect, this.widgets[i].AABBgetRectRef())) {
            this.widgets[i].drawWidget(context, 0, 0);
          }
        }
      }
    },

    getWidgetAt: function(x, y) {
      var widget  = null,
          i       = 0,
          bounds  = null;

      for (i=0; i<this.widgets.length; ++i) {
        if (this.widgets[i].AABBcontainsPoint(x, y)) {
          bounds = this.widgets[i].AABBgetRef();
          widget = this.widgets[i].widgetGetChildAt(x - bounds.x, y - bounds.y);
          break;
        }
      }

      return widget;
    },

    touchDown: function(id, x, y) {
      if (this.curTouchID < 0) {
        this.curTouchID = id;
        this.mouseDown(x, y);
      }
    },

    touchMove: function(id, x, y) {
      if (this.curTouchID === id) {
        this.mouseDrag(x, y);
      }
    },

    touchUp: function(id, x, y) {
      if (this.curTouchID === id) {
        this.mouseUp(x, y);
        this.curTouchID = -1;
      }
    },

    mouseUp: function(x, y) {
      var widget = this.focusWidget,
          bConsumed = widget ? widget.mouseUp(x + this.viewOffset.x, y + this.viewOffset.y) : false,
          newFocusWidget = bConsumed ? widget : null;

      this.setFocusWidget(newFocusWidget);

      return bConsumed;
    },

    mouseDown: function(x, y) {
      var widget = this.getWidgetAt(x + this.viewOffset.x, y + this.viewOffset.y),
          bConsumed = widget ? widget.mouseDown(x + this.viewOffset.x, y + this.viewOffset.y) : false,
          newFocusWidget = bConsumed ? widget : null;

      this.setFocusWidget(newFocusWidget);

      return bConsumed;
    },

    mouseDrag: function(x, y) {
      var widget = this.focusWidget,
          bConsumed = widget ? widget.mouseDrag(x + this.viewOffset.x, y + this.viewOffset.y) : false,
          newFocusWidget = widget;

      return bConsumed;
    },

    mouseOver: function(x, y) {
      var widget = this.getWidgetAt(x + this.viewOffset.x, y + this.viewOffset.y),
          bConsumed = widget && (!this.focusWidget || this.focusWidget === widget) ? widget.mouseOver(x + this.viewOffset.x, y + this.viewOffset.y) : false;

      return bConsumed;
    },

    mouseHold: function(x, y) {
      var widget = this.focusWidget,
          bConsumed = widget ? widget.mouseHold(x + this.viewOffset.x, y + this.viewOffset.y) : false;

      return bConsumed;
    },

    mouseClick: function(x, y) {
      var widget = this.getWidgetAt(x + this.viewOffset.x, y + this.viewOffset.y),
          bConsumed = widget ? widget.mouseClick(x + this.viewOffset.x, y + this.viewOffset.y) : false,
          newFocusWidget = bConsumed ? widget : null;

      this.setFocusWidget(newFocusWidget);

      return bConsumed;
    },

    mouseDoubleClick: function(x, y) {
      var widget = this.getWidgetAt(x + this.viewOffset.x, y + this.viewOffset.y),
          bConsumed = widget ? widget.mouseDoubleClick(x + this.viewOffset.x, y + this.viewOffset.y) : false,
          newFocusWidget = bConsumed ? widget : null;

      this.setFocusWidget(newFocusWidget);

      return bConsumed;
    }
  }
);

joe.GUI = new joe.GuiClass();
joe.GUI.INACTIVE_COLOR = "#aaaaaa";

joe.UpdateLoop.addListener(joe.GUI);
joe.Graphics.addListener(joe.GUI);
/**
 * Provides the base interface for objects managed by the GUI.
 */
joe.GUI.TRANSITION_TYPES = {NONE:0, FADE:1, SLIDE_X:2, SLIDE_Y:3};
joe.GUI.DEFAULT_TRANSITION_TIME = 1;  // In seconds

joe.GUI.WidgetModule = {
  requires: joe.MathEx.AABBmodule,

  widgetChildren: [],
  bWidgetVisible: true,
  bWidgetActive: true,
  inputHandlers: null,
  bWidgetInitialized: false,
  widgetTransIn: null,
  widgetTransOut: null,
  widgetTransType: joe.GUI.TRANSITION_TYPES.NONE,
  widgetTransPeriod: joe.GUI.DEFAULT_TRANSITION_TIME,
  widgetTransTimer: 0,
  widgetTransGoal: 0,
  bWidgetTransitioning: false,
  widgetAlpha: 1,
  widgetTransObserver: null,
  widgetTransWantPos: {x:0, y:0},

  staticInit: function() {
    if (!this.bWidgetInitialized) {
      joe.loadModule.call(this, this.widgetInputHandlers);
      this.bWidgetInitialized = true;
    }
  },

  widgetSetTransition: function(transType, transPeriod, observer) {
    this.widgetTransPeriod = transPeriod || Math.max(0, joe.GUI.DEFAULT_TRANSITION_TIME);
    this.widgetTransObserver = observer || null;

    switch(transType) {
      case joe.GUI.TRANSITION_TYPES.FADE:
        this.widgetTransIn = this.widgetFadeIn;
        this.widgetTransOut = this.widgetFadeOut;
      break;

      case joe.GUI.TRANSITION_TYPES.SLIDE_X:
        this.widgetTransIn = this.widgetSlideInX;
        this.widgetTransOut = this.widgetSlideOutX;
        this.widgetTransWantPos.x = this.bounds.x;
        this.widgetTransWantPos.y = this.bounds.y;
      break;

      case joe.GUI.TRANSITION_TYPES.SLIDE_Y:
        this.widgetTransIn = this.widgetSlideInY;
        this.widgetTransOut = this.widgetSlideOutY;
        this.widgetTransWantPos.x = this.bounds.x;
        this.widgetTransWantPos.y = this.bounds.y;
      break;

      default:
        this.widgetTransIn = null;
        this.widgetTransOut = null;
      break;
    }
  },

  widgetSetVisible: function(newVisible) {
    this.bWidgetVisible = newVisible;
  },

  widgetSetActive: function(newActive) {
    if (this.bWidgetActive !== newActive) {
      if (this.transType) {
        this.bWidgetTransitioning = true;
        this.widgetTransGoal = newActive ? this.widgetTransPeriod : 0;

        // Deactivate widget until transition complete.
        this.bWidgetActive = false;
      }
      else {
        this.bWidgetActive = newActive;
      }
    }
  },

  widgetVisible: function() {
    return this.bWidgetVisible;
  },

  widgetActive: function() {
    return this.bWidgetActive;
  },

  widgetAddChild: function(child) {
    this.widgetChildren.push(child);
  },

  widgetRemoveChild: function(child) {
    joe.Utility.erase(this.widgetChildren, child);
  },

  widgetGetChildAt: function(x, y) {
    var widget  = this,
        i       = 0,
        bounds  = null;

    for (i=0; i<this.widgetChildren.length; ++i) {
      if (this.widgetChildren[i].AABBcontainsPoint(x, y)) {
        bounds = this.widgetChildren[i].AABBgetRef();
        widget = this.widgetChildren[i].widgetGetChildAt(x - bounds.x, y - bounds.y);

        break;
      }
    }

    return widget;
  },

  updateWidgetTransition: function(dt) {
    var param = -1; // Indicates transition complete

    if (this.widgetTransTimer < this.widgetTransGoal && this.widgetTransIn) {
      this.widgetTransTimer += dt * 0.001;
      this.widgetTransTimer = Math.min(this.widgetTransTimer, this.widgetTransGoal);
      param = MathEx.sin(Math.PI * 0.5 * this.widgetTransTimer / this.widgetTransPeriod);
      this.widgetTransIn(param);

      if (param === 1) {
        this.bWidgetActive = true;

        if (this.widgetTransObserver) {
          this.widgetTransObserver.onWidgetTransitionedIn(this);
        }
      }
    }
    else if (this.widgetTransTimer > this.widgetTransGoal) {
      this.widgetTransTimer -= dt * 0.001;
      this.widgetTransTimer = Math.max(0, this.widgetTransTimer);
      param = MathEx.sin(Math.PI * 0.5 * this.widgetTransTimer / this.widgetTransPeriod);
      this.widgetTransOut(param);

      if (param === 0) {
        this.bWidgetActive = false; // Should already be the case, but for safety's sake...

        if (this.widgetTransObserver) {
          this.widgetTransObserver.onWidgetTrasitionedOut(this);
        }
      }
    }

    if (this.widgetTransTimer === this.widgetTransGoal) {
      this.bWidgetTransitioning = false;
    }

    return param;
  },

  updateWidget: function(dt, gameTime, parentX, parentY) {
    if (this.bWidgetTransitioning || this.bWidgetActive) {
      if (this.bWidgetTransitioning) {
        this.updateWidgetTransition(dt);
      }

      if (this.update) {
        this.update(dt, gameTime, parentX, parentY);
      }

      this.updateWidgetChildren(dt, gameTime, parentX, parentY);
    }
  },

  drawWidget: function(context, parentX, parentY) {
    if (this.bWidgetVisible) {
      context.save();
      context.globalAlpha = this.widgetAlpha;

      if (this.draw) {
        this.draw(context, parentX, parentY);
      }

      this.drawWidgetChildren(context, parentX, parentY);
      context.restore();
    }
  },

  updateWidgetChildren: function(dt, gameTime, parentX, parentY) {
    var i = 0,
        bounds = this.AABBgetRef();

    // Update self... (in this case, do nothing)

    // ...update children relative to self.
    for (i=0; i<this.widgetChildren.length; ++i) {
      if (this.widgetChildren[i].widgetActive()) {
        this.widgetChildren[i].update(dt, gameTime, parentX + bounds.x, parentY + bounds.y);
      }
    }
  },

  drawWidgetChildren: function(context, parentX, parentY) {
    var i = 0,
        bounds = this.AABBgetRef();

    // Draw self... (in this case, do nothing)

    // ...draw children relative to self.
    for (i=0; i<this.widgetChildren.length; ++i) {
      if (this.widgetChildren[i].widgetVisible()) {
        this.widgetChildren[i].draw(context, parentX + bounds.x, parentY + bounds.y);
      }
    }
  },

  widgetSetInputCallbacks: function(newCallbacks) {
    this.inputCallbacks = newCallbacks;
  },

  // Default Transitions //////////////////////////////////////////////////////
  widgetTransitions: {
    widgetFadeIn: function(param) {
      this.widgetAlpha = param;
    },

    widgetFadeOut: function(param) {
      this.widgetAlpha = param;
    },

    widgetSlideInX: function(param) {
      this.bounds.x = this.widgetTransWantPos.x * param + (1 - param) * -(joe.Graphics.getWidth() + this.bounds.width);
    },

    widgetSlideOutX: function(param) {
      this.bounds.x = this.widgetTransWantPos.x * param + (1 - param) * joe.Graphics.getWidth();
    },

    widgetSlideInY: function(param) {
      this.bounds.y = this.widgetTransWantPos.y * param + (1 - param) * -(joe.Graphics.getHeight() + this.bounds.height);
    },

    widgetSlideOutY: function(param) {
      this.bounds.y = this.widgetTransWantPos.y * param + (1 - param) * joe.Graphics.getHeight();
    }
  },

  // Default Input Handlers ///////////////////////////////////////////////////
  widgetInputHandlers: {
    mouseUp: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseUp ? this.widgetChildren[i].mouseUp(x, y) : true;
          }
        }
      }

      if (!bHandled && this.AABBcontainsPoint(x, y)) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseUp ? this.inputCallbacks.mouseUp(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseDown: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseDown ? this.widgetChildren[i].mouseDown(x, y) : true;
          }
        }
      }

      if (!bHandled) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseDown ? this.inputCallbacks.mouseDown(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseDrag: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseDrag ? this.widgetChildren[i].mouseDrag(x, y) : true;
          }
        }
      }

      if (!bHandled) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseDrag ? this.inputCallbacks.mouseDrag(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseOver: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseOver ? this.widgetChildren[i].mouseOver(x, y) : true;
          }
        }
      }

      if (!bHandled) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseOver ? this.inputCallbacks.mouseOver(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseHold: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseHold ? this.widgetChildren[i].mouseHold(x, y) : true;
          }
        }
      }

      if (!bHandled) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseHold ? this.inputCallbacks.mouseHold(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseClick: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseClick ? this.widgetChildren[i].mouseClick(x, y) : true;
          }
        }
      }

      if (!bHandled && this.AABBcontainsPoint(x, y)) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseClick ? this.inputCallbacks.mouseClick(x, y) : true) : false;
      }

      return bHandled;
    },

    mouseDoubleClick: function(x, y) {
      var i = 0,
          bHandled = false;

      // Give children a chance to consume the event.
      if (this.bWidgetActive && this.bWidgetVisible) {
        for (i=0; !bHandled && i<this.widgetChildren.length; ++i) {
          if (this.widgetChildren[i].inputCallbacks) {
            bHandled = this.widgetChildren[i].inputCallbacks.mouseDoubleClick ? this.widgetChildren[i].mouseDoubleClick(x, y) : true;
          }
        }
      }

      if (!bHandled) {
        bHandled = this.inputCallbacks ? (this.inputCallbacks.mouseDoubleClick ? this.inputCallbacks.mouseDoubleClick(x, y) : true) : false;
      }

      return bHandled;
    },
  }
};
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
// Draws custom shapes into the specified Graphics context.

joe.GUI.Ring = {
  DEFAULT_THICKNESS: 4,
  DEFAULT_LINE_COLOR: "#000000",
  DEFAULT_FILL_COLOR: "#FFFFFF",
  bounds: {x:0, y:0, w:0, h:0},

  clip: function(clipRect) {
    return !clipRect || joe.MathEx.clip(this.bounds, clipRect);
  },

  drawClipped: function(gfx, clipRect, originX, originY, radius, thickness, lineColor, alpha) {
    this.bounds.x = originX - radius;
    this.bounds.y = originY - radius;
    this.bounds.w = 2 * radius;
    this.bounds.h = 2 * radius;

    if (!clipRect || this.clip(clipRect)) {
      gfx.strokeStyle = lineColor || this.DEFAULT_LINE_COLOR;
      gfx.lineWidth = thickness || this.DEFAULT_THICKNESS;
      gfx.globalAlpha = alpha;

      gfx.beginPath();
      gfx.arc(originX, originY, radius, 0, 2 * Math.PI, true); 
      gfx.stroke();
      gfx.closePath();

      gfx.globalAlpha = 1;
    }
  }
};

// Arrow containing 7 vertices, default orientation along positive x-axis.
joe.GUI.Arrow = {
  ARROW_MIN_HEAD_SIZE: 12,
  DEFAULT_LINE_COLOR: "#000000",
  DEFAULT_FILL_COLOR: "#FFFFFF",
  DEFAULT_LINE_WIDTH: 2,
  bounds: {x:0, y:0, w:0, h:0},
  points: [{x:0, y:0},
           {x:0, y:0},
           {x:0, y:0},
           {x:0, y:0},
           {x:0, y:0},
           {x:0, y:0},
           {x:0, y:0}],

  generatePoints: function(x, y, a, l, hl, hw) {
    var i = 0,
        xMin = 0,
        yMin = 0,
        xMax = 0,
        yMax = 0,
        cosA = joe.MathEx.cos(a),
        sinA = joe.MathEx.sin(a),
        newX = 0,
        newY = 0;

    this.points[0].x = 0;
    this.points[0].y = -hw * 0.25;

    this.points[1].x = l - hl;
    this.points[1].y = -hw * 0.25;

    this.points[2].x = l - hl;
    this.points[2].y = -hw * 0.5;

    this.points[3].x = l;
    this.points[3].y = 0;

    this.points[4].x = l - hl;
    this.points[4].y = hw * 0.5;

    this.points[5].x = l - hl;
    this.points[5].y = hw * 0.25;

    this.points[6].x = 0;
    this.points[6].y = hw * 0.25;

    // Transform and construct bounds.
    for (i=0; i<this.points.length; ++i) {
      newX = this.points[i].x * cosA - this.points[i].y * sinA;
      newY = this.points[i].x * sinA + this.points[i].y * cosA;
      this.points[i].x = x + newX;
      this.points[i].y = y + newY;
    }

    maxX = this.points[0].x;
    minX = maxX;
    maxY = this.points[0].y;
    minY = maxY;

    for (i=1; i<this.points.length; ++i) {
      if (this.points[i].x < minX) {
        minX = this.points[i].x;
      }
      else if (this.points[i].x > maxX) {
        maxX = this.points[i].x;
      }

      if (this.points[i].y < minY) {
        minY = this.points[i].y;
      }
      else if (this.points[i].y > maxY) {
        maxY = this.points[i].y;
      }
    }

    this.bounds.x = minX;
    this.bounds.y = minY;
    this.bounds.w = maxX - minX;
    this.bounds.h = maxY - minY;
  },

  clip: function(clipRect) {
    return !clipRect || joe.MathEx.clip(this.bounds, clipRect);
  },

  drawClipped: function(gfx, clipRect, originX, originY, length, angle, lineColor, fillColor, alpha, lineWidth, minHeadSize) {
    var headLength = Math.abs(minHeadSize || this.ARROW_MIN_HEAD_SIZE),
        headWidth = Math.abs(minHeadSize || this.ARROW_MIN_HEAD_SIZE),
        i = 0;

    if (alpha > joe.MathEx.EPSILON) {
      if (length < 2 * this.ARROW_MIN_HEAD_SIZE) {
        headLength = length * 0.5;
        headWidth = length * 0.5;
      }

      this.generatePoints(originX, originY, angle, length, headLength, headWidth);

      if (!clipRect || this.clip(clipRect)) {
        gfx.save();
        gfx.strokeStyle = lineColor || this.DEFAULT_LINE_COLOR;
        gfx.fillStyle = fillColor || this.DEFAULT_FILL_COLOR;
        gfx.lineWidth = lineWidth || this.DEFAULT_LINE_WIDTH;

        if (alpha < 1 - joe.MathEx.EPSILON) {
          gfx.globalAlpha = alpha;
        }

        gfx.beginPath();

        gfx.moveTo(this.points[0].x, this.points[0].y);
        for (i=1; i<this.points.length; ++i) {
          gfx.lineTo(this.points[i].x, this.points[i].y);
        }

        gfx.closePath();
        gfx.fill();
        gfx.stroke();
        gfx.restore();
      }
    }
  }
};/**
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
/**
 * Draws a labeled box and responds to mouse and touch events.
 */

joe.GUI.ClickBox = new joe.ClassEx(
  // Stati Definition ///////////////////////////////////////////////////////////
  {
    clickBoxes: [],

    addClickBox: function(newBox) {
      this.clickBoxes.push(newBox);
    },

    removeClickBox: function(box) {
      joe.Utility.erase(this.clickBoxes, box);
    }
  },

  // Instance Definition ////////////////////////////////////////////////////////
  {
    requires: joe.GUI.WidgetModule,

    onColor: "#ffff00",
    offColor: "#0000ff",
    bOn: false,
    customDraw: null,

    init: function(x, y, width, height, onColor, offColor, inputCallbacks, customDraw) {
      this.AABBset(x, y, width, height);

      this.onColor = onColor || "#ffff00";
      this.offColor = offColor || "#0000ff";

      this.inputCallbacks = inputCallbacks || null;
      this.customDraw = customDraw;

      joe.GUI.ClickBox.addClickBox(this);
    },

    destroy: function() {
      joe.GUI.ClickBox.removeClickBox(this);
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

      if (context && this.widgetVisible()) {
        this.AABBoffset(worldX, worldY);

        if (this.customDraw) {
          this.customDraw.call(this, context, worldX, worldY);
        }
        else {
          context.save();
          if (this.widgetActive()) {
            color = this.bIsOn ? this.onColor : this.offColor;
          }

          context.strokeStyle = color;
          context.fillStyle = color;

          this.AABBdraw(context, color);

          context.restore();
        }

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
/**
 * Draws a labeled box and responds to mouse and touch events.
 */

joe.GUI.ToggleBox = new joe.ClassEx(
  // Stati Definition ///////////////////////////////////////////////////////////
  {
    toggleBoxes: [],

    untoggleGroup: function(group, toggled) {
      var i = 0;

      for (i=0; i<this.toggleBoxes.length; ++i) {
        if (this.toggleBoxes[i] !== toggled && this.toggleBoxes[i].getGroup() === group) {
          this.toggleBoxes[i].forceUntoggled();
        }
      }
    },

    addToggleBox: function(newBox) {
      this.toggleBoxes.push(newBox);
    },

    removeToggleBox: function(box) {
      joe.Utility.erase(this.toggleBoxes, box);
    }
  },

  // Instance Definition ////////////////////////////////////////////////////////
  [
    {
      requires: joe.GUI.WidgetModule,

      onColor: "#ffff00",
      offColor: "#0000ff",
      bOn: false,
      customDraw: null,
      group: null,

      init: function(x, y, width, height, onColor, offColor, group, inputCallbacks, customDraw, getValue) {
        this.AABBset(x, y, width, height);

        this.onColor = onColor || "#ffff00";
        this.offColor = offColor || "#0000ff";

        this.getValue = getValue;

        this.inputCallbacks = inputCallbacks || null;

        this.setGroup(group);
        this.customDraw = customDraw;

        joe.GUI.ToggleBox.addToggleBox(this);
      },

      destroy: function() {
        joe.GUI.ToggleBox.removeToggleBox(this);
      },

      update: function(dt, gameTime, worldX, worldY) {
        // Anything to do here?
      },

      isOn: function() {
        return this.bIsOn && this.widgetActive();
      },

      setGroup: function(newGroup) {
        this.group = newGroup;
      },

      getGroup: function() {
        return this.group;
      },

      forceUntoggled: function() {
        this.bIsOn = false;
      },

      toggle: function() {
        if (!this.bIsOn && this.group) {
          joe.GUI.ToggleBox.untoggleGroup(this.group, this);
        }

        this.bIsOn = !this.bIsOn;
      },

      draw: function(context, worldX, worldY) {
        var color = joe.GUI.INACTIVE_COLOR;

        if (context && this.widgetVisible()) {
          this.AABBoffset(worldX, worldY);

          context.save();
          if (this.widgetActive()) {
            color = this.bIsOn ? this.onColor : this.offColor;
          }

          context.strokeStyle = color;
          context.fillStyle = color;

          this.AABBdraw(context, color);

          if (this.customDraw) {
            this.customDraw.call(this, context, worldX, worldY);
          }

          context.restore();

          this.AABBoffset(-worldX, -worldY);
        }
      },

      mouseDown: function(x, y) {
        var bConsumed = false;

        if (this.widgetActive() && this.widgetVisible()) {
          this.toggle();

          this.widgetInputHandlers.mouseDown.call(this, x, y);

          bConsumed = true;
        }

        return bConsumed;
      },
    }
  ]
);
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
);// String tables
ccw.STRINGS = {
  GAME_BACK_COLOR: "#ffffff",

  TITLE_GREET: "Criss-Crosswords",
  TITLE_PROMPT: joe.Utility.isMobile() ? "Tap to Play" : "Click to Play",

  DOWN_CLUE_TITLE: "Down Clues",

  DOWN_CLUES: [
    {clue: "1. Cowboy's scarves missing low-grade herbs. (7)", hint:"deletion"},
    {clue: "2. Director Besson moves to Kentucky, wins lottery. (5)", hint:"charade"},
    {clue: "3. Little dance in Tampa square? (3)", hint:"hidden"},
    {clue: "4. Carradine near miss confused Quantum Mechanic. (5)", hint:"deletion and anagram"},
    {clue: "5. Listened to average talk show host. (3)", hint:"homophone"},
  ],

  UP_CLUE_TITLE: "Up Clues",

  UP_CLUES: [
    {clue: "4. Boy flipped for Indian stew. (3)", hint:"reversal"},
    {clue: "5. Constant pre-nuptials captivate Betty Page. (3-2)", hint:"container"},
    {clue: "6. Cadaver with scarred back and a bloating midsection sprawls on Venezuala's coast. (7)", hint:"container and deletion"},
    {clue: "7. Sergeant and Corporal take first bite of hot dogs. (5)", hint:"deletion"},
    {clue: "8. What I heard was 'small island.' (3)", hint:"homophone"}],

  ASSERT_INVALID_GAME_VIEW: "Invalid game view!",
  ASSERT_IMAGE_NOT_FOUND: "Image not found!",
  ASSERT_RESOURCE_LOAD_FAILED: "Some resources failed to load!",

  HINT_LABEL_HINT: "HINT",
  HINT_LABEL_CLUE: "CLUE",
  NO_MORE_HINTS: "You are out of hints. Please use the help menu to get more.",
  HINT_PREAMBLE: "This is a ",
  HINT_MIDAMBLE: " clue. You have ",
  HINT_POSTAMBLE_SINGULAR: " hint left.",
  HINT_POSTAMBLE_PLURAL: " hints left.",
  HINT_POSTAMBLE_ZERO: " clue. This is your last hint.",

  DEFAULT_MESSAGE: "Default Message",

  DIALOG_CHECK_SOLUTION: "You have no more solutions. You can get more via the 'help' menu.",
  DIALOG_NEW_PUZZLE: "This demo includes only one puzzle. You can get more via the 'help' menu.",
  DIALOG_IAP_OFFLINE: "The purchasing server is currently offline.",
};


// Manages the input, update, and draw for the word grid.

ccw.WordGridClass = new joe.ClassEx({
},
{
  requires: joe.MathEx.AABBmodule,

  BORDER_WIDTH: 2,
  DRAG_DIR: {NONE:0,
             UP: -1,
             DOWN:1},

  HIGHLIGHT_DELAY: 250,

  commands: null,
  gridImage: null,
  top: 0,
  left: 0,
  panelImage: null,
  panelLeft: 0,
  panelTop: 0,
  dragStart: {row:-1, col:-1},
  bDragged: false,

  cleanGrid: [
    "1*2*3*.",
    "*.*.*.*",
    "4*.*.*.",
    "*.*.*.*",
    "5*.*.*.",
    "*.*.*.*",
    "6*7*8*.",
  ],
  grid: [
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
    "*.*.*.*",
    ".*.*.*.",
  ],

  clues: {
    up: {"4": ccw.STRINGS.UP_CLUES[0],
         "5": ccw.STRINGS.UP_CLUES[1],
         "6": ccw.STRINGS.UP_CLUES[2],
         "7": ccw.STRINGS.UP_CLUES[3],
         "8": ccw.STRINGS.UP_CLUES[4]},
    down: {"1": ccw.STRINGS.DOWN_CLUES[0],
           "2": ccw.STRINGS.DOWN_CLUES[1],
           "3": ccw.STRINGS.DOWN_CLUES[2],
           "4": ccw.STRINGS.DOWN_CLUES[3],
           "5": ccw.STRINGS.DOWN_CLUES[4]},
  },

  block: '*',
  selection: {startRow: -1, startCol: -1, clueDir: 0, clueNum: -1},  // clueDir = DRAG_DIR.NONE
  gridPos: {row:-1, col:-1},

  unselect: function() {
    this.selection.clueDir = this.DRAG_DIR.NONE;
  },

  selectFromClueList: function(bUp, selectNum, commands) {
    var clueList = bUp ? this.clues.up : this.clues.down;
        inputCallback = commands.showInput,
        bSuccess = false;

    if (clueList.hasOwnProperty(selectNum)) {
      this.selection.clueDir = bUp ? this.DRAG_DIR.UP : this.DRAG_DIR.DOWN;
      this.selection.clueNum = selectNum;
      this.commands = commands;
      setTimeout(function() {inputCallback.call(commands)}, this.HIGHLIGHT_DELAY);
      ccw.game.playSound("SWEEP");
      bSuccess = true;
    }

    return bSuccess;
  },

  updateSelectedAnswer: function(newAnswer) {
    // Write the new clue back into the grid.
    var i = 0,
        row = 0,
        col = 0,
        answerChar = null,
        gridStart = this.getGridStartForClue(this.selection.clueNum);

    if (this.selection.clueDir && gridStart) {
      switch(this.selection.clueDir) {
        case this.DRAG_DIR.UP:
          // Build up to find the answer.
          for (i=0; i<Math.min(newAnswer.length, this.grid.length); ++i) {
            row = gridStart.row - i;
            col = gridStart.col + i;
            if (row < 0 || col >= this.grid[0].length) {
              break;
            }
            else {
              answerChar = newAnswer.charAt(i);
              answerChar = answerChar === "_" ? "." : answerChar;

              this.grid[row] = this.grid[row].slice(0, col) + answerChar + this.grid[row].slice(col + 1);
            }
          }
        break;

        case this.DRAG_DIR.DOWN:
          // Build down to find the answer.
          for (i=0; i<Math.min(newAnswer.length, this.grid.length); ++i) {
            row = gridStart.row + i;
            col = gridStart.col + i;
            if (row >= this.grid.length || col >= this.grid[0].length) {
              break;
            }
            else {
              answerChar = newAnswer.charAt(i);
              answerChar = answerChar === "_" ? "." : answerChar;

              this.grid[row] = this.grid[row].slice(0, col) + answerChar + this.grid[row].slice(col + 1);
            }
          }
        break;
      }
    }
  },

  getGridStartForClue: function(clueNum) {
    var iRow = 0,
        iCol = 0,
        gridStart = this.gridPos;

    for (iRow=0; iRow<this.cleanGrid.length; ++iRow) {
      for (iCol=0; iCol<this.cleanGrid[0].length; ++iCol) {
        if (this.cleanGrid[iRow][iCol] === clueNum) {
          gridStart.row = iRow;
          gridStart.col = iCol;
          gridStart = this.gridPos;
          iRow = this.cleanGrid.length;
          break;
        }
      }
    }

    return gridStart;
  },

  getSelectedAnswerText: function() {
    var answerText = "",
        i = 0,
        row = 0,
        col = 0,
        gridStart = this.getGridStartForClue(this.selection.clueNum);

    if (this.selection.clueDir && gridStart) {
      switch(this.selection.clueDir) {
        case this.DRAG_DIR.UP:
          // Build up to find the answer.
          for (i=0; i<this.grid.length; ++i) {
            row = gridStart.row - i;
            col = gridStart.col + i;
            if (row < 0 || col >= this.grid[0].length) {
              break;
            }
            else {
              answerText += this.grid[row][col] === '.' ? "_" : this.grid[row][col];
            }
          }
        break;

        case this.DRAG_DIR.DOWN:
          // Build down to find the answer.
          for (i=0; i<this.grid.length; ++i) {
            row = gridStart.row + i;
            col = gridStart.col + i;
            if (row >= this.grid.length || col >= this.grid[0].length) {
              break;
            }
            else {
              answerText += this.grid[row][col] === '.' ? "_" : this.grid[row][col];
            }
          }
        break;
      }
    }

    return answerText;
  },

  getSelectedClue: function() {
    var clue = "";

    switch(this.selection.clueDir) {
      case this.DRAG_DIR.UP:
        clue = this.clues.up.hasOwnProperty(this.selection.clueNum) ? this.clues.up[this.selection.clueNum] : null;
      break;

      case this.DRAG_DIR.DOWN:
        clue = this.clues.down.hasOwnProperty(this.selection.clueNum) ? this.clues.down[this.selection.clueNum] : null;
      break;

      default:
        // Invalid. Leave clue blank.
      break;
    }

    return clue;
  },

  getSelectedClueText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.clue : "";
  },
  getSelectedHintText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.hint : "";
  },

  getSelectedHintText: function() {
    var clue = this.getSelectedClue();

    return clue ? clue.hint : "";
  },

  resolveRow: function(y) {
    var localY = y - this.top - this.BORDER_WIDTH;

    return Math.floor(this.grid.length * localY / (this.gridImage.height - 2 * this.BORDER_WIDTH));
  },

  resolveCol: function(x) {
    var localX = x - this.left - this.BORDER_WIDTH;

    return Math.floor(this.grid[0].length * localX / (this.gridImage.width - 2 * this.BORDER_WIDTH));
  },

  getXCoordinateForCol: function(col) {
    var toCenterX = (this.gridImage.width - 2 * this.BORDER_WIDTH) / this.grid[0].length * 0.5;

    return Math.round(col * (this.gridImage.width - 2 * this.BORDER_WIDTH) / this.grid[0].length + this.left + this.BORDER_WIDTH + toCenterX);
  },

  getYCoordinateForRow: function(row) {
    var toCenterY = (this.gridImage.height - 2 * this.BORDER_WIDTH) / this.grid.length * 0.5;

    return Math.round(row * (this.gridImage.height - 2 * this.BORDER_WIDTH) / this.grid.length + this.top + this.BORDER_WIDTH + toCenterY);
  },

  getGridLeft: function(col) {
    var left = 0;

    if (col >= 0 && col < this.grid[0].length) {
      left = Math.round(this.left + this.BORDER_WIDTH + col / this.grid[0].length * (this.gridImage.width - 2 * this.BORDER_WIDTH));
    }

    return left;
  },

  getGridTop: function(row) {
    var top = 0;

    if (row >= 0 && row < this.grid.length) {
      top = Math.round(this.top + this.BORDER_WIDTH + row / this.grid.length * (this.gridImage.height - 2 * this.BORDER_WIDTH));
    }

    return top;
  },

  init: function(gridImage, left, top, panelImage, panelLeft, panelTop) {
    this.gridImage = gridImage;
    this.top = top;
    this.left = left;

    this.panelImage = panelImage;
    this.panelTop = panelTop;
    this.panelLeft = panelLeft;

    this.bounds.x = left;
    this.bounds.y = top;
    this.bounds.width = gridImage.width;
    this.bounds.height = gridImage.height;
  },

  selectClue: function(commands) {
    // Select a clue based on the starting row/col
    // and the drag direction.
    var dRow = this.dragDir === this.DRAG_DIR.DOWN ? -1 : +1.
        dCol = -1,
        row = this.dragStart.row,
        col = this.dragStart.col,
        clueNum = null,
        newRow = 0,
        newCol = 0,
        inputCallback = commands.showInput;

    this.selection.clueDir = this.DRAG_DIR.NONE;

    // Move backwards from the starting block, looking for
    // one of the "clue start" blocks, indicated by a number
    // in the grid space.
    newRow = row + dRow;
    newCol = col + dCol;

    while (newCol >= 0 && (newRow >= 0 && newRow < this.grid.length)) {
      row = newRow;
      col = newCol;
      newRow += dRow;
      newCol += dCol;
    }

    if (this.isValidSquare(row, col)) {
      clueNum = /[1-9]/.exec(this.cleanGrid[row][col]);

      clueNum = clueNum && clueNum.length === 1 ? clueNum[0] : null;

      if (clueNum &&
          (this.dragDir === this.DRAG_DIR.UP && ccw.StatePlayClass.UP_CLUES.indexOf(clueNum) >= 0) ||
          (this.dragDir === this.DRAG_DIR.DOWN && ccw.StatePlayClass.DOWN_CLUES.indexOf(clueNum) >= 0)) {
        this.selection.startRow = row;
        this.selection.startCol = col;
        this.selection.clueDir = this.dragDir;
        this.selection.clueNum = clueNum;
        this.commands = commands;
        setTimeout(function() {inputCallback.call(commands)}, this.HIGHLIGHT_DELAY);
        ccw.game.playSound("SWEEP");
      }
    }
  },

  isGridBlocked: function(row, col) {
    return this.isValidSquare(row, col) && this.grid[row][col] !== this.block;
  },

  isValidSquare: function(row, col) {
    return row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length;
  },

  mouseDown: function(x, y, commands) {
    if (commands) {
      commands.startGesture(x, y);
    }

    this.dragStart.row = this.resolveRow(y);
    this.dragStart.col = this.resolveCol(x);
    this.bDragged = false;
    
    return !this.isGridBlocked(this.dragStart.row, this.dragStart.col);
  },

  mouseDrag: function(x, y, commands) {
    var dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragged) {
      if (commands) {
        dragType = commands.checkDrag(x, y);

        switch(dragType) {
          case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
          case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
            commands.executeDrag(dragType);
          break;

          case ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT:
            this.bDragged = true;
            this.dragDir = this.DRAG_DIR.UP;
          break;

          case ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT:
            this.bDragged = true;
            this.dragDir = this.DRAG_DIR.DOWN;
          break;
        }
      }

      if (this.bDragged) {
        this.selectClue(commands);
      }
    }

    return true;
  },

  mouseUp: function(x, y, commands) {
    if (this.bDragged) {

    }

    this.bDragged = false;
    this.dragStart.row = -1;
    this.dragStart.col = -1;

    return true;
  },

  drawLetters: function(gfx) {
    var iRow = 0,
        iCol = 0,
        x = 0,
        y = 0;

    for (iRow=0; iRow<this.grid.length; ++iRow) {
      for (iCol=0; iCol<this.grid[0].length; ++iCol) {
        if (this.grid[iRow][iCol] === this.block ||
            this.grid[iRow][iCol] === '.') {
          continue;
        }
        else {
          x = this.getXCoordinateForCol(iCol);
          y = this.getYCoordinateForRow(iRow);

          ccw.game.sysFontLarge.draw(gfx, this.grid[iRow].charAt(iCol), x, y, joe.Resources.BitmapFont.ALIGN.CENTER, 0.5);

          // TODO: if displaying the solution, add highlights for correct and incorrect answers.
        }
      }
    }
  },

  draw: function(gfx) {
    var row = this.selection.startRow,
        col = this.selection.startCol,
        selectImage = null;

    if (this.gridImage) {

      gfx.drawImage(this.gridImage, this.left, this.top);
      gfx.drawImage(this.panelImage, this.panelLeft, this.panelTop);

      // Draw the letters in the grid.
      this.drawLetters(gfx);

      if (this.selection.clueDir !== this.DRAG_DIR.NONE) {
        selectImage = ccw.game.getImage("HIGHLIGHT_SQUARE");

        while (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length) {
          gfx.drawImage(selectImage, this.getGridLeft(col), this.getGridTop(row));

          col += 1;
          if (this.selection.clueDir === this.DRAG_DIR.UP) {
            row -= 1;
          }
          else {
            row += 1;
          }
        }
      }
    }
  },

  update: function(dt, gameTime) {

  },
});

ccw.PlayCommandsClass = new joe.ClassEx({
  SWIPE_THRESHOLD_SQ: 100 * 100,
  SWIPE_RIGHT_THRESH: Math.sqrt(Math.sqrt(3) * 0.5),
  SWIPE_DIAG_TARGET: Math.sqrt(2) * 0.5,
  SWIPE_DIAG_THRESH: 2 * Math.abs(Math.sqrt(3) * 0.5 - Math.sqrt(2) * 0.5),
  SWIPE_TYPE: {NONE: 0,
               RIGHT: 1,
               LEFT: 2,
               UP_RIGHT: 3,
               DOWN_RIGHT: 4},
},
{
  state: null,
  gesturePosStart: {id:-1, x:0, y:0},
  gesturePos: {id:-1, x:0, y:0},
  bDragging: false,
  bCanDrag: true,
  focusLayer: null,   // The layer currently receiving I/O events

  init: function(state) {
    this.state = state;
  },

  hideDialog: function() {
    this.state.dialogView.setWorldPos(-joe.Graphics.getWidth(), this.state.dialogView.getWorldRect().y);
  },

  showDialog: function(text) {
    this.state.dialogLayer.setText(text);
    this.state.dialogView.setWorldPos(Math.round(joe.Graphics.getWidth() * 0.5 - ccw.game.getImage("DIALOG_FRAME").width * 0.5), this.state.dialogView.getWorldRect().y);
  },

  checkSolution: function() {
   this.showDialog(ccw.STRINGS.DIALOG_CHECK_SOLUTION);
  },

  startNewPuzzle: function() {
   this.showDialog(ccw.STRINGS.DIALOG_NEW_PUZZLE);
  },

  buyHints: function() {
   this.showDialog(ccw.STRINGS.DIALOG_IAP_OFFLINE);
  },

  buySolutions: function() {
   this.showDialog(ccw.STRINGS.DIALOG_IAP_OFFLINE);
  },

  buyPuzzles: function() {
   this.showDialog(ccw.STRINGS.DIALOG_IAP_OFFLINE);
  },

  showHelp: function() {
    this.state.showHelp();
  },

  hideHelp: function() {
    this.state.hideHelp();
  },

  showInstructions: function() {
    this.state.hideHelp();
    this.state.showInstructions();
  },

  hideInstructions: function() {
    this.state.hideInstructions();
  },

  showInput: function() {
    this.state.refreshInputClueText();
    this.state.refreshInputAnswerText();
    this.state.showInput();
  },

  hideInput: function(newAnswer) {
    if (newAnswer) {
      this.state.updateSelectedAnswer(newAnswer);
    }

    this.state.hideInput();
  },

  slideLeft: function() {
    this.state.slideLayerLeft();
  },

  slideRight: function() {
    this.state.slideLayerRight();
  },

  isSliding: function() {
    return this.state.isSliding();
  },

  checkForSwipe: function(dx, dy, magnitude) {
    var swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    // Check for left or right drag.
    dirDot = dx / magnitude;

    if (dirDot > ccw.PlayCommandsClass.SWIPE_RIGHT_THRESH) {
      swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT;
    }
    else if (dirDot < -ccw.PlayCommandsClass.SWIPE_RIGHT_THRESH) {
      swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.LEFT;
    }
    else if (Math.abs(Math.abs(dirDot) - ccw.PlayCommandsClass.SWIPE_DIAG_TARGET) < ccw.PlayCommandsClass.SWIPE_DIAG_THRESH) {
      if (dx * dy < 0) {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.UP_RIGHT;
      }
      else {
        swipeType = ccw.PlayCommandsClass.SWIPE_TYPE.DOWN_RIGHT;
      }
    }

    return swipeType;
  },

  startGesture: function(x, y) {
    this.gesturePosStart.x = x;
    this.gesturePosStart.y = y;

    this.gesturePos.x = x;
    this.gesturePos.y = y;
  },

  mouseDown: function(x, y) {
    var focusView = joe.Scene.getFirstViewContainingPoint(x, y);
    this.focusLayer = focusView ? focusView.getLayer(0) : null;

    if (this.focusLayer) {
      // Check: is the user interacting with a GUI element in the play layer?
      this.bCanDrag = !this.focusLayer.mouseDown(x, y);

      if (this.bCanDrag) {
        this.startGesture(x, y);
      }
      
      this.bDragging = false;
    }
  },

  mouseDrag: function(x, y) {
    if (this.bCanDrag) {
      this.executeDrag(this.checkDrag(x, y));
    }
    else if (this.focusLayer) {
      this.focusLayer.mouseDrag(x, y);
    }
  },

  mouseUp: function(x, y) {
    if (!this.bCanDrag && this.focusLayer) {
      this.focusLayer.mouseUp(x, y);
    }

    this.focusLayer = null;
    this.bDragging = false;
    this.bCanDrag = true;
  },

  touchDown: function(id, x, y) {
    var focusView = joe.Scene.getFirstViewContainingPoint(x, y);
    this.focusLayer = focusView ? focusView.getLayer(0) : null;

    if (this.focusLayer && this.gesturePosStart.id < 0) {
      this.gesturePosStart.id = id;
      this.gesturePosStart.x = x;
      this.gesturePosStart.y = y;

      this.gesturePos.id = id;
      this.gesturePos.x = x;
      this.gesturePos.y = y;

      this.bCanDrag = !this.focusLayer.mouseDown(x, y);
    }
    else {
      this.focusLayer = null;
    }
  },

  touchMove: function(id, x, y) {
    if (this.bCanDrag && this.gesturePosStart.id >= 0 && id === this.gesturePosStart.id) {
      this.executeDrag(this.checkDrag(x, y));
    }
    else if (this.focusLayer) {
      this.focusLayer.mouseDrag(x, y);
    }
  },

  touchUp: function(id, x, y) {
    if (this.focusLayer && id === this.gesturePosStart.id) {
      this.gesturePosStart.id = -1;
      this.gesturePos.id = -1;

      this.focusLayer.mouseUp(x, y);

      this.bCanDrag = true;
      this.bDragging = false;
      this.focusLayer = null;
    }
  },

  executeDrag: function(dragType) {
    switch(dragType) {
      case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
        this.state.slideLayerRight();
      break;

      case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
        this.state.slideLayerLeft();
      break;

      default:
      break;
    }
  },

  checkDrag: function(x, y) {
    var dx = 0,
        dy = 0,
        dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragging) {
      this.gesturePos.x = x;
      this.gesturePos.y = y;

      dx = this.gesturePos.x - this.gesturePosStart.x;
      dy = this.gesturePos.y - this.gesturePosStart.y;

      if (dx * dx + dy * dy > ccw.PlayCommandsClass.SWIPE_THRESHOLD_SQ) {
        this.bDragging = true;

        dragType = this.checkForSwipe(dx, dy, Math.sqrt(dx * dx + dy * dy));
      }
    }

    return dragType;
  },
});

ccw.PlayLayerClass = new joe.ClassEx({
  PANES: {LEFT: 0,
          CENTER: 1,
          RIGHT: 2,
          LEFT_REPEAT: 3},

  FUDGE_HELP_Y: 2,
  FUDGE_LEFT_ARROWS_X: 1,
  FUDGE_RIGHT_ARROWS_X: 0,
  FUDGE_CENTER_ARROWS_Y: 6,
  FUDGE_HELP_Y_SIDE_PANELS: 3,
  FUDGE_BOTTOM_PANEL_Y: 3,

  VERTICAL_SPACING: 64,
  MAX_WIDTH: joe.Graphics.getWidth() * 0.9,
},
{
  requires: joe.Scene.LayerInterface,

  CLUE_HIGHLIGHT_ALPHA: 0.8,
  CLUE_HIGHLIGHT_COLOR: "#008080",
  CLUE_HIGHLIGHT_LINEWIDTH: 8,

  wordGrid: null,
  paneIndex: 0, // Corresponds to PANES.CENTER
  widgets: [],
  paneOffsetX: [],
  labels: [],
  newLabel: null,
  guiManager: null,
  curContext: "CENTER",
  selectedClueLabel: null,
  bDragged: false,

  updateSelectedAnswer: function(newAnswer) {
    if (this.wordGrid) {
      this.wordGrid.updateSelectedAnswer(newAnswer);
    }
  },

  getSelectedClueText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedClueText() : "";
  },

  getSelectedHintText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedHintText() : "";
  },

  getSelectedAnswerText: function() {
    return this.wordGrid ? this.wordGrid.getSelectedAnswerText() : "";
  },

  setGuiContext: function(whichContext) {
    joe.assert(this.guiManager && ccw.PlayLayerClass.PANES.hasOwnProperty(whichContext), joe.Strings.ASSERT_INVALID_ARGS);

    this.guiManager.setContext(this.widgets[ccw.PlayLayerClass.PANES[whichContext]]);
    this.curContext = whichContext;
  },

  unselectWordGrid: function() {
    if (this.wordGrid) {
      this.wordGrid.unselect();
    }

    this.unselectClueLabel();
  },

  unselectClueLabel: function() {
    this.selectedClueLabel = null;
  },

  mouseDown: function(x, y) {
    return this.guiManager.mouseDown(x, y);
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    return this.guiManager.mouseUp(x, y);
  },

  shiftGuiContextLeft: function() {
    this.unselectClueLabel();

    switch(this.curContext) {
      case "CENTER":
        this.setGuiContext("LEFT");
      break;

      case "LEFT":
        this.setGuiContext("RIGHT");
      break;

      case "RIGHT":
        this.setGuiContext("CENTER");
      break;

      case "LEFT_REPEAT":
        this.setGuiContext("RIGHT");
      break;
    }
  },

  shiftGuiContextRight: function() {
    this.unselectClueLabel();
    
    switch(this.curContext) {
      case "LEFT":
        this.setGuiContext("CENTER");
      break;

      case "CENTER":
        this.setGuiContext("RIGHT");
      break;

      case "RIGHT":
        this.setGuiContext("LEFT_REPEAT");
      break;

      case "LEFT_REPEAT":
        this.setGuiContext("CENTER");
      break;
    }
  },

  init: function(commandHandler) {
    this.addWidgets(commandHandler);
  },

  getPaneOffsetX: function(paneKey) {
    return this.paneOffsetX[ccw.PlayLayerClass.PANES[paneKey]];
  },

  drawClipped: function(gfx, srcRect, scale) {
    var i = 0,
        curWidgets = this.widgets[ccw.PlayLayerClass.PANES[this.curContext]],
        clueBounds = null,
        screenWidth = joe.Graphics.getWidth();

    joe.assert(gfx && srcRect, joe.Strings.ASSERT_INVALID_ARGS);

    joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR, gfx, srcRect.w, srcRect.h)

    gfx.save();

    scale = scale || 1;
    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    for (i=this.labels.length-1; i>=0; --i) {
      this.labels[i].draw(gfx, 0, 0);
    }

    this.guiManager.setViewOffset(srcRect.x, srcRect.y);
    this.guiManager.setClipRect(srcRect);
    this.guiManager.draw(gfx);

    // HACK: during sliding transitions, we force the guiManager
    // to draw all its elements, so that those that are "out of
    // context" draw as they move into the viewport's visible area.
    if (this.parent.isTransitioning()) {
      // Draw all gui elements.
      for (i=0; i<this.widgets.length; ++i) {
        if (this.widgets[i] !== curWidgets) {
          this.guiManager.setContext(this.widgets[i]);
          this.guiManager.draw(gfx);
        }
      }

      this.guiManager.setContext(curWidgets);
    }

    if (this.selectedClueLabel) {
      clueBounds = this.selectedClueLabel.AABBgetRectRef();
      if (joe.MathEx.clip(clueBounds, srcRect)) {
        gfx.globalAlpha = this.CLUE_HIGHLIGHT_ALPHA;
        gfx.strokeStyle = this.CLUE_HIGHLIGHT_COLOR;
        gfx.lineWidth = this.CLUE_HIGHLIGHT_LINEWIDTH;
        gfx.beginPath();
        gfx.rect(Math.floor(clueBounds.x + clueBounds.w * 0.5 - screenWidth * 0.5), clueBounds.y, screenWidth + 1, clueBounds.h);
        gfx.stroke();
        gfx.globalAlpha = 1;
      }
    }

    gfx.restore();
  },

  highlightClue: function(x, y, commands) {
    if (commands) {
      commands.startGesture(x, y);
    }

    if (this.wordGrid && this.guiManager) {
      this.selectedClueLabel = this.guiManager.getWidgetAt(x, y);
    }

    this.bDragged = false;

    return true;
  },

  clueListDrag: function(x, y, commands) {
    var dragType = ccw.PlayCommandsClass.SWIPE_TYPE.NONE;

    if (!this.bDragged) {
      if (commands) {
        dragType = commands.checkDrag(x, y);

        if (dragType !== ccw.PlayCommandsClass.SWIPE_TYPE.NONE) {
          this.unselectClueLabel();
        }

        switch(dragType) {
          case ccw.PlayCommandsClass.SWIPE_TYPE.LEFT:
          case ccw.PlayCommandsClass.SWIPE_TYPE.RIGHT:
            commands.executeDrag(dragType);
            this.bDragged = true;
          break;
        }
      }
    }

    return true;
  },

  selectClue: function(x, y, bUp, clueIndex, commandHandler) {
    var endClue = null;

    this.bDragged = false;

    if (!commandHandler.isSliding()) {
      this.bDragged = false;

      if (this.wordGrid && this.guiManager) {
        endClue = this.guiManager.getWidgetAt(x, y);

        if (endClue === this.selectedClueLabel) {
          if (!this.wordGrid.selectFromClueList(bUp, clueIndex, commandHandler)) {
            this.unselectClueLabel();
          }
        }
        else {
          this.unselectClueLabel();
        }
      }
    }
    else {
      this.unselectClueLabel();
    }

    return true;
  },

  addWidgets: function(commandHandler) {
    var midPane = joe.Graphics.getWidth() * 0.5,
        curY = 0,
        i = 0,
        x = 0,
        y = 0,
        gridImage = null,
        panelImage = null,
        topMargin = 0,
        highlightImage = null,
        panelOffsets = [],
        lastWidget = null,
        buttonImg = null,
        theWordGrid = null,
        self = this,
        downClueHandlers = [
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(0), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(1), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(2), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(3), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, false, ccw.StatePlayClass.DOWN_CLUES.charAt(4), commandHandler);}}
        ],
        upClueHandlers = [
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(0), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(1), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(2), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(3), commandHandler);}},
          {mouseDown: function(x, y) {return self.highlightClue(x, y, commandHandler);},
           mouseDrag: function(x, y) {return self.clueListDrag(x, y, commandHandler);},
           mouseUp: function(x, y) {return self.selectClue(x, y, true, ccw.StatePlayClass.UP_CLUES.charAt(4), commandHandler);}}
        ];

    this.guiManager = new joe.GuiClass();

    buttonImage = ccw.game.getImage("WORD_GRID");
    topMargin = (joe.Graphics.getWidth() - buttonImage.width) * 0.5;

    // Layout the layer: down clues, up clues, grid, down clues (repeat for wraparound).
    // LEFT PANE: -------------------------------------------------------------
    // "Down Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, downClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[0], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());

    // CENTER PANE: -----------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // The word grid.
    gridImage = ccw.game.getImage("WORD_GRID");
    panelImage = ccw.game.getImage("PANEL_CENTER");
    this.wordGrid = new ccw.WordGridClass(gridImage,
                                          midPane - gridImage.width * 0.5,
                                          topMargin,
                                          panelImage,
                                          midPane - panelImage.width * 0.5,
                                          topMargin * 2 + gridImage.height + ccw.PlayLayerClass.FUDGE_BOTTOM_PANEL_Y);
    this.labels.push(this.wordGrid);

    this.makeHelpButtons(midPane, topMargin, commandHandler);

    // Word grid capture box.
    x = Math.round(midPane - buttonImage.width * 0.5);
    y = topMargin;
    theWordGrid = this.wordGrid;
    lastWidget = this.guiManager.addWidget(new joe.GUI.CaptureBox(x,
                                                                  y,
                                                                  buttonImage.width,
                                                                  buttonImage.height,
                                                                  null,
                                                                  null,
                                                                  {
                                                                    mouseDown: function(x, y) {
                                                                      return theWordGrid.mouseDown(x, y, commandHandler);
                                                                    },
                                                                    mouseDrag: function(x, y) {
                                                                      return theWordGrid.mouseDrag(x, y, commandHandler);
                                                                    },
                                                                    mouseUp: function(x, y) {
                                                                      return theWordGrid.mouseUp(x, y, commandHandler);
                                                                    }
                                                                  },
                                                                  null));   
    this.widgets.push(this.guiManager.newContext());

    // RIGHT PANE: ------------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();

    // "Up Clues" label.
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.UP_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.UP_CLUES[i].clue, ccw.game.sysFont, midPane, curY, upClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_RIGHT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_RIGHT");

      gfx.drawImage(img, panelOffsets[1], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());

    // LEFT_REPEAT PANE: ------------------------------------------------------
    curY = 0;
    midPane += joe.Graphics.getWidth();
    this.paneOffsetX.push(midPane - joe.Graphics.getWidth() * 0.5);

    // "Down clue" label.
    lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUE_TITLE, ccw.game.sysFont, midPane, curY, null, 0.5, 0));
    curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;

    // The clues.
    for (i=0; i<ccw.STRINGS.DOWN_CLUES.length; ++i) {
      lastWidget = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DOWN_CLUES[i].clue, ccw.game.sysFont, midPane, curY, downClueHandlers[i], 0.5, 0, ccw.PlayLayerClass.MAX_WIDTH));
      curY += ccw.PlayLayerClass.VERTICAL_SPACING + lastWidget.AABBgetRef().height;
    }

    // Lower info panel.
    panelOffsets.push(midPane - ccw.game.getImage("PANEL_LEFT").width * 0.5)
    this.labels.push({draw: function(gfx) {
      var img = ccw.game.getImage("PANEL_LEFT");

      gfx.drawImage(img, panelOffsets[2], joe.Graphics.getHeight() - topMargin - img.height + ccw.PlayLayerClass.FUDGE_HELP_Y_SIDE_PANELS);
    }});

    this.makeHelpButtons(midPane, topMargin, commandHandler);
    this.widgets.push(this.guiManager.newContext());
  },

  makeHelpButtons: function(midPane, topMargin, commandHandler) {
    var buttonImage = null,
        x = 0,
        y = 0;

    // The help button.
    buttonImage = ccw.game.getImage("HIGHLIGHT_CIRCLE");
    x = Math.round(midPane - buttonImage.width * 0.5);
    y = Math.round(joe.Graphics.getHeight() - topMargin - buttonImage.height + ccw.PlayLayerClass.FUDGE_HELP_Y);
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseDown: function(x, y) {
                                                                        ccw.game.playSound("CLICK_HIGH");
                                                                        return true;
                                                                      },
                                                                      mouseUp: function(x, y) {
                                                                      commandHandler.showHelp();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
    // Left arrow.
    buttonImage = ccw.game.getImage("HIGHLIGHT_ARROW_LEFT");
    x = Math.round(midPane - joe.Graphics.getWidth() * 0.5 + topMargin - ccw.PlayLayerClass.FUDGE_LEFT_ARROWS_X);
    y +=  ccw.PlayLayerClass.FUDGE_CENTER_ARROWS_Y;
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseUp: function(x, y) {
                                                                      commandHandler.slideLeft();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
    // Right arrow.
    buttonImage = ccw.game.getImage("HIGHLIGHT_ARROW_RIGHT");
    x = Math.round(midPane + joe.Graphics.getWidth() * 0.5 - topMargin - buttonImage.width + ccw.PlayLayerClass.FUDGE_RIGHT_ARROWS_X);
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(x,
                                                                    y,
                                                                    buttonImage.width,
                                                                    buttonImage.height,
                                                                    buttonImage,
                                                                    {mouseUp: function(x, y) {
                                                                      commandHandler.slideRight();
                                                                      return true;
                                                                    }})); // TODO: <-- input callbacks here.
  }
});

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
    joe.Sound.loop(ccw.game.getSound("MUSIC"));
  },

  exit: function() {
    joe.Sound.stop(ccw.game.getSound("MUSIC"));
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

ccw.StatePlayClass = new joe.ClassEx({
  GAME_VIEW_WIDTH_FACTOR: 4, // Want 3 panes with wraparound, so we'll fake it with 4 panes.
  GAME_VIEW_HEIGHT_FACTOR: 1,
  SLIDE_TIME: 0.25,
  UP_CLUES: "45678",
  DOWN_CLUES: "12345",

  VIEW_ORDER: { GAME: 100,
                INPUT: 90,
                HELP: 80,
                INSTRUCTIONS: 70,
                DIALOG_BOX:50 },
},
{
  commands: null,
  gameView: null,
  playLayer: null,
  inputLayer: null,
  instructionsView: null,
  helpView: null,
  inputView: null,
  dialogView: null,
  dialogLayer: null,

  init: function(gridImage, panelImage) {
    var state = this,
        dialogFrame = null,
        dialogWorldRect = null;

    this.commands = new ccw.PlayCommandsClass(this);

    this.gameView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR,
                                       joe.Graphics.getHeight() * ccw.StatePlayClass.GAME_VIEW_HEIGHT_FACTOR);
    this.playLayer = new ccw.PlayLayerClass(this.commands);
    this.gameView.addLayer(this.playLayer);
    this.syncViewToPanel("CENTER");

    this.instructionsView = new joe.Scene.View(joe.Graphics.getWidth(),
                                               joe.Graphics.getHeight(),
                                               joe.Graphics.getWidth(),
                                               joe.Graphics.getHeight());
    this.instructionsView.addLayer(new ccw.InstructionsLayerClass(this.commands));
    this.instructionsView.setWorldPos(joe.Graphics.getWidth(), 0);

    this.helpView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight());
    this.helpView.addLayer(new ccw.HelpLayerClass(this.commands));
    this.helpView.setWorldPos(joe.Graphics.getWidth(), 0);

    this.inputView = new joe.Scene.View(joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight(),
                                       joe.Graphics.getWidth(),
                                       joe.Graphics.getHeight());
    this.inputLayer = this.inputView.addLayer(new ccw.InputLayerClass(this.commands));
    this.inputView.setWorldPos(-joe.Graphics.getWidth(), 0);

    dialogFrame = ccw.game.getImage("DIALOG_FRAME");
    joe.assert(dialogFrame, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);
    this.dialogView = new joe.Scene.View(joe.Graphics.getWidth(),
                                         dialogFrame.height,
                                         joe.Graphics.getWidth(),
                                         dialogFrame.height);
    this.dialogLayer = this.dialogView.addLayer(new ccw.DialogLayerClass(this.commands));
    this.dialogView.setWorldPos(-joe.Graphics.getWidth(), Math.round(joe.Graphics.getWidth() * 0.5 - dialogFrame.height * 0.5));
    dialogWorldRect = this.dialogView.getWorldRect();
    this.dialogLayer.setViewOffset(-dialogWorldRect.x, -dialogWorldRect.y);

    // Add views to the scene.    
    joe.Scene.addView(this.gameView, ccw.StatePlayClass.VIEW_ORDER.GAME);
    joe.Scene.addView(this.inputView, ccw.StatePlayClass.VIEW_ORDER.INPUT);
    joe.Scene.addView(this.helpView, ccw.StatePlayClass.VIEW_ORDER.HELP);
    joe.Scene.addView(this.instructionsView, ccw.StatePlayClass.VIEW_ORDER.INSTRUCTIONS);
    joe.Scene.addView(this.dialogView, ccw.StatePlayClass.VIEW_ORDER.DIALOG_BOX);
  },

  syncViewToPanel: function(whichPanel) {
    joe.assert(this.gameView && this.playLayer, joe.Strings.ASSERT_INVALID_ARGS);

    this.gameView.setSourcePos(this.playLayer.getPaneOffsetX(whichPanel), 0);
    this.playLayer.setGuiContext(whichPanel);
  },

  updateSelectedAnswer: function(newAnswer) {
    this.playLayer.updateSelectedAnswer(newAnswer);
  },

  refreshInputClueText: function() {
    this.inputLayer.setClueText(this.playLayer.getSelectedClueText(), this.playLayer.getSelectedHintText());
  },

  refreshInputAnswerText: function() {
    this.inputLayer.setAnswerText(this.playLayer.getSelectedAnswerText());
    this.inputLayer.advanceEditCursor();
  },

  showInput: function() {
    this.inputView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
    joe.KeyInput.addListener(this.inputLayer);
  },

  hideInput: function() {
    this.inputView.setWorldTransition(-joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
    this.playLayer.unselectWordGrid();
    joe.KeyInput.removeListener(this.inputLayer);
  },

  showInstructions: function() {
    this.instructionsView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  hideInstructions: function() {
    ccw.game.playSound("SLIDE");
    this.instructionsView.setWorldTransition(joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  showHelp: function() {
    ccw.game.playSound("SLIDE");
    this.helpView.setWorldTransition(0, 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  hideHelp: function() {
    ccw.game.playSound("SLIDE");
    this.helpView.setWorldTransition(joe.Graphics.getWidth(), 0, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  isSliding: function() {
    return this.gameView.isTransitioning();
  },

  slideLayerLeft: function() {
    var viewRect = null,
        newViewX = 0,
        newViewY = 0;

    joe.assert(this.gameView, ccw.STRINGS.ASSERT_INVALID_GAME_VIEW);

    ccw.game.playSound("SLIDE");

    viewRect = this.gameView.getSourceRect();
    newViewX = viewRect.x - joe.Graphics.getWidth();

    if (newViewX < 0) {
      // Wrap around.
      newViewX += joe.Graphics.getWidth() * ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR;

      // Snap to the wraparound frame.
      this.gameView.setSourcePos(newViewX, viewRect.y);
      this.playLayer.setGuiContext("LEFT_REPEAT");
      newViewX -= joe.Graphics.getWidth();
    }

    this.playLayer.shiftGuiContextLeft();

    this.gameView.setSourceTransition(newViewX, viewRect.y, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  slideLayerRight: function() {
    var viewRect = null,
        newViewX = 0,
        newViewY = 0;

    joe.assert(this.gameView, ccw.STRINGS.ASSERT_INVALID_GAME_VIEW);

    ccw.game.playSound("SLIDE");

    viewRect = this.gameView.getSourceRect();
    newViewX = viewRect.x + joe.Graphics.getWidth();

    if (newViewX > joe.Graphics.getWidth() * (ccw.StatePlayClass.GAME_VIEW_WIDTH_FACTOR - 1)) {
      // Wrap around.
      newViewX = 0;

      // Snap to the wraparound frame.
      this.gameView.setSourcePos(newViewX, viewRect.y);
      this.playLayer.setGuiContext("LEFT_REPEAT");
      newViewX += joe.Graphics.getWidth();
    }

    this.playLayer.shiftGuiContextRight();

    this.gameView.setSourceTransition(newViewX, viewRect.y, 0, 0, ccw.StatePlayClass.SLIDE_TIME);
  },

  enter: function() {
  },

  exit: function() {
  },

  draw: function(gfx) {
    joe.Graphics.clearToColor(ccw.STRINGS.GAME_BACK_COLOR);

    joe.Scene.draw(gfx);
  },

  update: function(dt, gameTime) {
  },
});

// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.HelpLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
  OFFSETS_Y: {topMargin: 145, spacing: 25},

  BUTTON_HIGHLIGHTS: [
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_SMALL"
  ],
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        curY = ccw.HelpLayerClass.OFFSETS_Y.topMargin,
        widgets = [];

    this.backImage = ccw.game.getImage("HELP");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;

    this.guiManager = new joe.GuiClass();

    for (i=0; i<ccw.HelpLayerClass.BUTTON_HIGHLIGHTS.length; ++i) {
      highlightImage = ccw.game.getImage(ccw.HelpLayerClass.BUTTON_HIGHLIGHTS[i]);

      widgets.push(this.guiManager.addWidget(new joe.GUI.HighlightBox(Math.round(xMid - highlightImage.width * 0.5),
                                             curY,
                                             highlightImage.width,
                                             highlightImage.height,
                                             highlightImage,
                                             null),
                                             true));
      curY += ccw.HelpLayerClass.OFFSETS_Y.spacing + highlightImage.height;
    }

    // HACK: Set the input callbacks manually. Setting them in the above
    // loop fails because the closure only retains the final value of 'i',
    // meaning all widgets execute the "hideHelp" function.

    widgets[0].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.showInstructions(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.showInstructions(); return true; }});
    widgets[1].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.checkSolution(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.checkSolution(); return true; }});
    widgets[2].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.startNewPuzzle(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.startNewPuzzle(); return true; }});
    widgets[3].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buyHints(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.buyHints(); return true; }});
    widgets[4].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buySolutions(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.buySolutions(); return true; }});
    widgets[5].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.buyPuzzles(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.buyPuzzles(); return true; }});
    widgets[6].widgetSetInputCallbacks({mouseUp: function(x, y) { commands.hideHelp(); return true; },
                                        mouseDown: function(x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchDown: function(id, x, y) {ccw.game.playSound("CLICK_HIGH"); return true; },
                                        touchUp: function(id, x, y) {commands.hideHelp(); return true; }});
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(this.backImage, 0, 0);

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    return this.guiManager.mouseDown(x, y);
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    if (!this.guiManager.mouseUp(x, y)) {
      this.commands.hideHelp();
    }

    return true;
  },

  touchDown: function(id, x, y) {
    return this.guiManager.touchDown(id, x, y);
  },

  touchMove: function(id, x, y) {
    return this.guiManager.touchMove(id, x, y);
  },

  touchUp: function(id, x, y) {
    return this.guiManager.touchUp(id, x, y);
  },
});
// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InputLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  WIDGET_OFFSETS_Y: [255, 527, 391],
  HINT_BUTTON_OFFSET_X: 651,
  KEY_CAPTURE_BOUNDS: {x:6, y:800, w:760, h:224},
  KEY_LAYOUT: {chars: [
                 "QWERTYUIOP",
                 "ASDFGHJKL1",
                 "2ZXCVBNM31"
               ],
               charList: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']},
  EXIT_HOLD_TIME: joe.Utility.isMobile() ? 0 : 0,

  backImage: null,
  commands: null,
  guiManager: null,
  widgets: null,
  clueLabel: null,
  answerLabel: null,
  hintLabel: null,
  keyBox: null,
  vkeyStart: null,
  vkeyPressTime: 0,
  curEditChar: 0,
  highlightImage: null,
  highlightPos: {x:0, y:0},
  gridPos: {row:0, col:0},
  coords: {x:0, y:0},
  clueText: null,
  hintText: null,
  nHints: 3,  // Normally, we would retrieve this from the server, as it is something you can buy.
  bHinted: false,

  init: function(commands) {
    var i = 0,
        highlightImage = null,
        xMid = joe.Graphics.getWidth() * 0.5,
        widgets = [],
        self = this,
        vkeyDownHandler = function(x, y) { self.onVKeyDown(self.resolveVKeyFromPoint(x, y)); return true; },
        vkeyUpHandler = function(x, y) { self.onVKeyUp(self.resolveVKeyFromPoint(x, y)); return true; };

    this.backImage = ccw.game.getImage("KEYBOARD");

    joe.assert(this.backImage, ccw.STRINGS.ASSERT_IMAGE_NOT_FOUND);

    this.commands = commands;

    this.guiManager = new joe.GuiClass();

    this.clueLabel = this.guiManager.addWidget(new joe.GUI.Label('Default Clue Text',
                                               ccw.game.sysFont,
                                               joe.Graphics.getWidth() * 0.5,
                                               this.WIDGET_OFFSETS_Y[0],
                                               null,
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));

    this.answerLabel = this.guiManager.addWidget(new joe.GUI.Label('_______',
                                                 ccw.game.sysFontLarge,
                                                 joe.Graphics.getWidth() * 0.5,
                                                 this.WIDGET_OFFSETS_Y[1],
                                                 null,
                                                 0.5,
                                                 0.5,
                                                 joe.Graphics.getWidth() * 0.9));

    this.hintLabel = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.HINT_LABEL_HINT,
                                               ccw.game.sysFont,
                                               this.HINT_BUTTON_OFFSET_X,
                                               this.WIDGET_OFFSETS_Y[2],
                                               {mouseDown: function(x, y) {return false;},
                                                mouseUp: function(x, y) {return false;}},
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));
    this.answerLabel.setCursor(-1, "^");

    highlightImage = ccw.game.getImage("HIGHLIGHT_MENU_SMALL");
    lastWidget = this.guiManager.addWidget(new joe.GUI.HighlightBox(Math.round(this.HINT_BUTTON_OFFSET_X - highlightImage.width * 0.5),
                                                                    Math.round(this.WIDGET_OFFSETS_Y[2] - highlightImage.height * 0.5),
                                                                    highlightImage.width,
                                                                    highlightImage.height,
                                                                    highlightImage,
                                                                    {
                                                                      mouseDown: function(x, y) {
                                                                       return true;
                                                                      },
                                                                      mouseUp: function(x, y) {
                                                                       return self.flipClueText(x, y);
                                                                      }
                                                                    }
                                                                    ), true);


    this.keyBox = this.guiManager.addWidget(new joe.GUI.CaptureBox(this.KEY_CAPTURE_BOUNDS.x,
                                                                   this.KEY_CAPTURE_BOUNDS.y,
                                                                   this.KEY_CAPTURE_BOUNDS.w,
                                                                   this.KEY_CAPTURE_BOUNDS.h,
                                                                   null,
                                                                   null,
                                                                   {
                                                                     mouseDown: function(x, y) {
                                                                       return vkeyDownHandler(x, y);
                                                                     },
                                                                     mouseUp: function(x, y) {
                                                                       return vkeyUpHandler(x, y);
                                                                     }
                                                                   },
                                                                   null));   
  },

  buildHintText: function() {
    var dynamicHint = null;

    if (this.nHints > 0 || this.bHinted) {
      if (!this.bHinted) {
        this.nHints -= 1;
        this.bHinted = true;
      }

      dynamicHint = ccw.STRINGS.HINT_PREAMBLE + this.hintText;
      if (this.nHints > 1) {
        dynamicHint +=  ccw.STRINGS.HINT_MIDAMBLE + this.nHints + ccw.STRINGS.HINT_POSTAMBLE_PLURAL;
      }
      else if (this.nHints === 0) {
        dynamicHint +=  ccw.STRINGS.HINT_POSTAMBLE_ZERO;
      }
      else {
        dynamicHint +=  ccw.STRINGS.HINT_MIDAMBLE + this.nHints + ccw.STRINGS.HINT_POSTAMBLE_SINGULAR;
      }
    }
    else  {
      dynamicHint = ccw.STRINGS.NO_MORE_HINTS;
    }

    return dynamicHint;
  },

  flipClueText: function(x, y) {
    ccw.game.playSound("CLICK_HIGH");

    if (this.hintLabel.getText() === ccw.STRINGS.HINT_LABEL_HINT) {
      // Flip from hint to clue.
      this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_CLUE);
      this.clueLabel.setText(this.buildHintText());
    }
    else {
      // Flip from clue to hint.
      this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_HINT);
      this.clueLabel.setText(this.clueText);
    }

    return true;
  },

  updateAnswerAndClose: function() {
    this.commands.hideInput(this.answerLabel.getText());
  },

  getCharFromKeyCode: function(key) {
    var charOut = null;

    switch (key) {
      case joe.KeyInput.KEYS.ENTER:
        charOut = '1';
      break;

      case joe.KeyInput.KEYS.ESC:
        charOut = '2';
      break;

      case joe.KeyInput.KEYS.BACKSPACE:
        charOut = '3';
      break;

      default:
        if (key >= joe.KeyInput.KEYS.A && key <= joe.KeyInput.KEYS.Z) {
          charOut = this.KEY_LAYOUT.charList[key - joe.KeyInput.KEYS.A];
        }
      break;
    }

    return charOut;
  },

  keyPress: function(key) {
    var charOut = this.getCharFromKeyCode(key);

    if (charOut) {
      this.onVKeyDown(charOut);
    }
  },

  keyRelease: function(key) {
    charOut = this.getCharFromKeyCode(key);

    if (charOut) {
      this.vkeyPressTime = 0; // Don't require a delay for the 'ESC' key.
      this.onVKeyUp(charOut);
    }
  },

  exit: function() {
    // Close the view without updating the answer.
    this.commands.hideInput(null);
  },

  getCellForKey: function(char) {
    var iRow = 0,
        iCol = 0;

    this.gridPos.row = -1;
    this.gridPos.col = -1;

    for (iRow=0; iRow<this.KEY_LAYOUT.chars.length; ++iRow) {
      for (iCol=0; iCol<this.KEY_LAYOUT.chars[iRow].length; ++iCol) {
        if (this.KEY_LAYOUT.chars[iRow].charAt(iCol) === char) {
          this.gridPos.row = iRow;
          this.gridPos.col = iCol;
          iRow = this.KEY_LAYOUT.chars.length;
          break;
        }
      }
    }

    return this.gridPos;
  },

  getTopLeftForKey: function(char) {
    var gridPos = this.getCellForKey(char),
        bounds = this.keyBox.AABBgetRef();

    this.coords.x = 0;
    this.coords.y = 0;

    if (gridPos.row >= 0 && gridPos.col >= 0) {
      this.coords.x = Math.round(gridPos.col * bounds.width / this.KEY_LAYOUT.chars[0].length) + this.KEY_CAPTURE_BOUNDS.x;
      this.coords.y = Math.round(gridPos.row * bounds.height / this.KEY_LAYOUT.chars.length) + this.KEY_CAPTURE_BOUNDS.y;
    }

    return this.coords;
  },

  resolveVKeyFromPoint: function(x, y) {
    var localX = x - this.KEY_CAPTURE_BOUNDS.x,
        localY = y - this.KEY_CAPTURE_BOUNDS.y,
        row = 0,
        col = 0,
        bounds = this.keyBox.AABBgetRef(),
        key = "";

    row = Math.floor(localY / bounds.height * this.KEY_LAYOUT.chars.length);
    col = Math.floor(localX / bounds.width * this.KEY_LAYOUT.chars[0].length);

    if (row >= 0 && row < this.KEY_LAYOUT.chars.length &&
        col >= 0 && col < this.KEY_LAYOUT.chars[0].length) {
      key = this.KEY_LAYOUT.chars[row].charAt(col);
    }

    return key;
  },

  addLetter: function(letter) {
    var editText = this.answerLabel.getText(),
        foreString = editText.slice(0, this.curEditChar),
        aftString = editText.slice(this.curEditChar + 1);

    if (this.curEditChar < editText.length) {
      this.answerLabel.setText(foreString + letter + aftString);
      this.curEditChar = Math.min(this.curEditChar + 1, editText.length);
      this.answerLabel.setCursor(this.curEditChar);
    }
  },

  removeLetter: function() {
    var editText = this.answerLabel.getText(),
        foreString = null,
        aftString = null;

    this.curEditChar = this.curEditChar - 1;

    if (this.curEditChar >= 0) {
      foreString = editText.slice(0, this.curEditChar);
      aftString = editText.slice(this.curEditChar + 1);
      this.answerLabel.setText(foreString + "_" + aftString);
    }
    else if (this.curEditChar < 0) {
      // Consume characters from the front.
      this.answerLabel.setText(editText.slice(1) + "_");
      this.curEditChar = 0;
    }
    else {
      this.curEditChar = 0;
    }

    this.answerLabel.setCursor(this.curEditChar);
  },

  onVKeyDown: function(char) {
    var highlightPos = null;

    this.vkeyStart = char;
    this.vkeyPressTime = Date.now();

    this.highlightImage = null;
    this.highlightPos.x = 0;
    this.highlightPos.y = 0;

    ccw.game.playSound("CLICK_LOW");

    if (this.vkeyStart) {
      switch(this.vkeyStart) {
        case "1":
          // 'Done' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_LARGE");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        case "2":
          // 'Exit' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        case "3":
          // 'Del' key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;

        default:
          // A normal letter key.
          this.highlightImage = ccw.game.getImage("HIGHLIGHT_KEY_SMALL");
          highlightPos = this.getTopLeftForKey(this.vkeyStart);
        break;
      }

      if (highlightPos) {
        this.highlightPos.x = highlightPos.x;
        this.highlightPos.y = highlightPos.y;
      }
    }
  },

  onVKeyUp: function(char) {
    var vkeyEnd = char,
        newAnswer = null;

    this.highlightImage = null;

    if (this.vkeyStart === vkeyEnd) {
      switch(vkeyEnd) {
        case "1":
          // 'Done' key.
          this.updateAnswerAndClose();
        break;

        case "2":
          // 'Exit' key.
          if (Date.now() - this.vkeyPressTime > this.EXIT_HOLD_TIME) {
            this.exit();
          }
        break;

        case "3":
          // 'Del' key.
          this.removeLetter();
        break;

        default:
          // A normal letter key.
          this.addLetter(vkeyEnd);
        break;
      }
    }
  },

  setClueText: function(clueText, hintText) {
    this.clueText = clueText;
    this.hintText = hintText;
    this.bHinted = false;

    if (this.clueLabel) {
      this.clueLabel.setText(clueText);
    }

    if (this.hintLabel) {
      this.hintLabel.setText(ccw.STRINGS.HINT_LABEL_HINT);
    }
  },

  setAnswerText: function(text) {
    if (this.answerLabel) {
      this.answerLabel.setText(text);
      this.curEditChar = 0;
      this.answerLabel.setCursor(this.curEditChar);
    }
  },

  advanceEditCursor: function() {
    var answerText = this.answerLabel.getText(),
        i = 0;

    for (i=0; i<answerText.length; ++i) {
      this.curEditChar = i;

      if (answerText.charAt(i) === "_") {
        break;
      }
    }
    
    // Advance past end if all letters are filled out.
    if (this.curEditChar === answerText.length - 1 && answerText.charAt(answerText.length - 1) !== "_") {
      this.curEditChar = answerText.length;
    }

    this.answerLabel.setCursor(this.curEditChar);
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(this.backImage, 0, 0);

    if (this.highlightImage) {
      gfx.drawImage(this.highlightImage, this.highlightPos.x, this.highlightPos.y);
    }

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    this.guiManager.mouseDown(x, y);

    return true;
  },

  mouseDrag: function(x, y) {
    return this.guiManager.mouseDrag(x, y);
  },

  mouseUp: function(x, y) {
    joe.assert(this.commands, joe.Strings.ASSERT_INVALID_ARGS);

    this.guiManager.mouseUp(x, y);

    return true;
  },

  touchDown: function(id, x, y) {
    return this.guiManager.touchDown(id, x, y);
  },

  touchMove: function(id, x, y) {
    return this.guiManager.touchMove(id, x, y);
  },

  touchUp: function(id, x, y) {
    return this.guiManager.touchUp(id, x, y);
  },
});
// Layer that manages dialog box messages.
// Originally created off screen and moved
// in and out as needed.

ccw.DialogLayerClass = new joe.ClassEx({
	// Class Definition ///////////////////////////////////////////////////////	
  OFFSETS_Y: {topMargin: 145, spacing: 25},

  BUTTON_HIGHLIGHTS: [
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_LARGE",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_MEDIUM",
    "HIGHLIGHT_MENU_SMALL"
  ],
},
{
	// Instance Definition ////////////////////////////////////////////////////	
  requires: joe.Scene.LayerInterface,

  BUTTON_POS_X: 274,
  BUTTON_POS_Y: 361,

  backImage: null,
  commands: null,
  guiManager: null,
  messageLabel: null,

  init: function(commands) {
    var highlightImage = null,
        self = this;

    this.commands = commands;
    this.guiManager = new joe.GuiClass();

    this.messageLabel = this.guiManager.addWidget(new joe.GUI.Label(ccw.STRINGS.DEFAULT_MESSAGE,
                                               ccw.game.sysFont,
                                               Math.round(joe.Graphics.getWidth() * 0.5),
                                               Math.round(this.BUTTON_POS_Y * 0.5),
                                               {mouseDown: function(x, y) {return false;},
                                                mouseDrag: function(x, y) {return false;},
                                                mouseUp: function(x, y) {return false;}},
                                               0.5,
                                               0.5,
                                               joe.Graphics.getWidth() * 0.9));

    highlightImage = ccw.game.getImage("HIGHLIGHT_MENU_SMALL");
    this.guiManager.addWidget(new joe.GUI.HighlightBox(this.BUTTON_POS_X,
                                                       this.BUTTON_POS_Y,
                                                       highlightImage.width,
                                                       highlightImage.height,
                                                       highlightImage,
                                                       {
                                                          mouseDown: function(x, y) {
                                                            return true;
                                                          },
                                                          mouseDrag: function(x, y) {
                                                            return true;
                                                          },
                                                          mouseUp: function(x, y) {
                                                            return self.close();
                                                          }
                                                        }
                                                      ), true);    
  },

  setViewOffset: function(x, y) {
    if (this.guiManager) {
      this.guiManager.setViewOffset(x, y);
    }
  },

  setText: function(newText) {
    if (this.messageLabel) {
      this.messageLabel.setText(newText);
    }
  },

  close: function() {
    if (this.commands) {
      ccw.game.playSound("CLICK_HIGH");
      this.commands.hideDialog();
    }
  },

  drawClipped: function(gfx, clipRect, scale) {
    gfx.save();

    if (Math.abs(1 - scale) > joe.MathEx.EPSILON) {
      gfx.scale(scale, scale);
    }

    gfx.clearRect(0, 0, joe.Graphics.getWidth(), joe.Graphics.getHeight());
    gfx.drawImage(ccw.game.getImage("DIALOG_FRAME"), 0, 0);

    this.guiManager.setClipRect(clipRect);
    this.guiManager.draw(gfx);

    gfx.restore();
  },

  mouseDown: function(x, y) {
    this.guiManager.mouseDown(x, y);
    return true;
  },

  mouseDrag: function(x, y) {
    return true;
  },

  mouseUp: function(x, y) {
    this.guiManager.mouseUp(x, y);
    return true;
  },

  touchDown: function(id, x, y) {
    this.guiManager.touchDown(id, x, y);
    return true;
  },

  touchMove: function(id, x, y) {
    return true;
  },

  touchUp: function(id, x, y) {
    this.guiManager.touchUp(id, x, y);
    return true;
  },
});
// Layer that displays game instructions.
// Originally created off screen and moved
// in and out as needed.

ccw.InstructionsLayerClass = new joe.ClassEx({
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
    ccw.game.playSound("SLIDE");
    return true;
  },

  touchUp: function(id, x, y) {
    return this.mouseUp(x, y);
  }
});
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
           HIGHLIGHT_MENU_SMALL: 12,
           KEYBOARD: 13,
           HIGHLIGHT_KEY_LARGE: 14,
           HIGHLIGHT_KEY_SMALL: 15,
           DIALOG_FRAME: 16,
          },

  SOUNDS: {CLICK_LOW: 0,
           MUSIC: 1,
           CLICK_HIGH: 2,
           SLIDE: 3,
           SWEEP: 4,
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
  sounds: [],
  nResLoaded: 0,

  getImage: function(whichImage) {
    var index = ccw.GameClass.IMAGES[whichImage];

    return index >= 0 && index < this.images.length ? this.images[index] : null;
  },

  getSound: function(whichSound) {
    var index = ccw.GameClass.SOUNDS[whichSound];

    return index >= 0 && index < this.sounds.length ? this.sounds[index] : null;
  },

  playSound: function(whichSound) {
    var sound = this.getSound(whichSound);

    if (sound) {
      joe.Sound.play(sound, 1);
    }
  },

  init: function() {
    // TODO: consolidate into sprite sheets to reduce download overhead on server.
    
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

    this.images.push(joe.Resources.loader.loadImage("img/keyboard.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_keyLarge.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/highlight_keySmall.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.images.push(joe.Resources.loader.loadImage("img/dialog_frame.png",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this));

    this.sounds.push(joe.Resources.loader.loadSound("audio/click_low.mp3",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this,
                                                    1,
                                                    0.1));

    this.sounds.push(joe.Resources.loader.loadSound("audio/music.mp3",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this,
                                                    1,
                                                    0.1));

    this.sounds.push(joe.Resources.loader.loadSound("audio/click_high.mp3",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this,
                                                    1,
                                                    0.1));

    this.sounds.push(joe.Resources.loader.loadSound("audio/slide.mp3",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this,
                                                    1,
                                                    0.1));

    this.sounds.push(joe.Resources.loader.loadSound("audio/chirp.mp3",
                                                    ccw.onResourceLoaded,
                                                    ccw.onResourceLoadFailed,
                                                    this,
                                                    1,
                                                    0.1));

    joe.MouseInput.addListener(this);
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
  this.nResLoaded += 1;

  if (joe.Resources.loadComplete()) {
    joe.assert(joe.Resources.loadSuccessful(), ccw.STRINGS.ASSERT_RESOURCE_LOAD_FAILED);

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
