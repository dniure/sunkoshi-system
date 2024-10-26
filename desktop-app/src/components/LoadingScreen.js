import React, { useEffect, useState } from 'react';
import '../css/loadingScreen.scss'; // Link to the styles

const NUM_BARS = 5; // Number of loading bars
const ANIMATION_DURATION = 1.2; // Duration of the animation

function LoadingScreen() {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Start the animation after the component mounts
    setStartAnimation(true);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-bars">
        {Array.from({ length: NUM_BARS }).map((_, index) => (
          <div
            key={index}
            className={`loading-bar ${startAnimation ? 'animate' : ''}`}
            style={{ animationDelay: `${index * (ANIMATION_DURATION / NUM_BARS)}s` }} // Stagger the animation
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingScreen;
