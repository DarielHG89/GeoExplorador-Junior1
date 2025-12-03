const sounds = {
  // A crisp click sound for selection
  countryClick: new Audio('https://actions.google.com/sounds/v1/ui/camera_shutter.ogg'),
  // A smooth whoosh for the panel appearing
  panelOpen: new Audio('https://actions.google.com/sounds/v1/ui/slide_in.ogg'),
  // A corresponding whoosh for the panel disappearing
  panelClose: new Audio('https://actions.google.com/sounds/v1/ui/slide_out.ogg'),
  // Sound for correct answer
  correctAnswer: new Audio('https://actions.google.com/sounds/v1/human_voices/human_male_positive_gesture_1.ogg'),
  // Sound for incorrect answer
  incorrectAnswer: new Audio('https://actions.google.com/sounds/v1/human_voices/human_female_negative_gesture_1.ogg'),
};

// Adjust volumes to be pleasant and not overpowering
sounds.countryClick.volume = 0.4;
sounds.panelOpen.volume = 0.5;
sounds.panelClose.volume = 0.5;
sounds.correctAnswer.volume = 0.6;
sounds.incorrectAnswer.volume = 0.6;


// Function to play a sound, resetting its time to allow for rapid replays
const playSound = (sound: HTMLAudioElement) => {
  // User interaction (like a click) is required for play() to work in modern browsers.
  // We reset the time to allow the sound to be played again before it has finished.
  sound.currentTime = 0;
  sound.play().catch(error => {
    console.warn("Sound playback was prevented by the browser:", error);
  });
};

export const playCountryClickSound = () => {
  playSound(sounds.countryClick);
};

export const playPanelOpenSound = () => {
  playSound(sounds.panelOpen);
};

export const playPanelCloseSound = () => {
  playSound(sounds.panelClose);
};

export const playCorrectSound = () => {
  playSound(sounds.correctAnswer);
};

export const playIncorrectSound = () => {
  playSound(sounds.incorrectAnswer);
};
