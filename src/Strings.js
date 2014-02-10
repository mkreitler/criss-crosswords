// String tables
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


