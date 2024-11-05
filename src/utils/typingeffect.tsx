import React, { useEffect, useState } from "react";

interface TypewriterProps {
  text: React.ReactNode; // Keep as React.ReactNode
  speed?: number; // Base speed for typing
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState<React.ReactNode>(null); // Change to React.ReactNode

  useEffect(() => {
    const textArray = React.Children.toArray(text);
    let i = 0;

    const typeNextCharacter = () => {
      if (i < textArray.length) {
        setDisplayedText((prev) => (
          <>
            {prev}
            {textArray[i]}
          </>
        ));
        i++;
        // Adjust speed based on character type
        const nextSpeed = typeof textArray[i] === 'string' && textArray[i].trim() === '' ? speed * 2 : speed; // Slow down for spaces
        setTimeout(typeNextCharacter, nextSpeed);
      }
    };

    // Start typing
    typeNextCharacter();

    return () => {
      setDisplayedText(null); // Reset on unmount
    };
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
};

export default Typewriter;