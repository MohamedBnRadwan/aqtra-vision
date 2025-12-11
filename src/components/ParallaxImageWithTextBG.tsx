import React, { useEffect, useRef } from 'react';
import './ParallaxImageWithTextBG.css';

interface ParallaxImageWithTextBGProps {
    imageSrc: string;
    text: string;
    speed?: number;
}

const ParallaxImageWithTextBG: React.FC<ParallaxImageWithTextBGProps> = ({
    imageSrc,
    text,
    speed = 0.5,
}) => {
    const parallaxRef = useRef<HTMLDivElement>(null);
    // const textRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (parallaxRef.current && textRef.current) {
    //             const scrolled = window.pageYOffset;
    //             const rect = parallaxRef.current.getBoundingClientRect();
    //             const elementTop = rect.top + scrolled;
    //             const offset = (scrolled - elementTop) * speed;

    //             parallaxRef.current.style.backgroundPositionY = `${offset}px`;
    //             textRef.current.style.transform = `translateY(${offset * 0.3}px)`;
    //         }
    //     };

    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, [speed]);

      useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollY = window.scrollY;

      parallaxRef.current.style.backgroundPosition =
        scrollY !== 0
          ? `calc(50% + ${scrollY}px) calc(50% + ${scrollY}px)`
          : "";
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    return (
        <div
            ref={parallaxRef}
            className="parallax-txt-container"
            style={{
                backgroundImage: `url(${imageSrc})`,
            }}
        >
            <span className="parallax-txt-text">
                {text}
            </span>
        </div>
    );
};

export default ParallaxImageWithTextBG;