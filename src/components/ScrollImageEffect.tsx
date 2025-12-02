import React, { useRef, useEffect, useState } from 'react';
import './ScrollImageEffect.css';

interface ScrollImageEffectProps {
  imageUrl: string;
}

const ScrollImageEffect: React.FC<ScrollImageEffectProps> = ({ imageUrl }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const offset = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
        setScrollPosition(offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-image-container" ref={imageRef}>
      <div
        className="scroll-image"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: `translateX(${scrollPosition * -1000}px)`
        }}
      ></div>
    </div>
  );
};

export default ScrollImageEffect;