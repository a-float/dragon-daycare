export const playDashSound = (isLowPitch: boolean) => {
  const audio = new Audio("sounds/ball-tap.wav");
  audio.preservesPitch = isLowPitch;
  audio.volume = Math.random() / 2 + 0.25;
  audio.playbackRate = 0.75;
  audio.play();
};

export const playStickyMoveSound = (isLowPitch: boolean) => {
    const audio = new Audio("sounds/small-hit.wav");
    audio.preservesPitch = false;
    audio.volume = Math.random() / 2 + 0.25;
    audio.playbackRate = 0.3;
    audio.volume = 0.1
    audio.play();
  };
  