import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CardTitle } from '@/components/ui/card';
import { BicepsFlexed } from 'lucide-react';

interface CollisionTitleProps {
  username: string;
}

const CollisionTitle: React.FC<CollisionTitleProps> = ({ username }) => {
  const leftDumbbellRef = useRef<HTMLSpanElement>(null);
  const rightDumbbellRef = useRef<HTMLSpanElement>(null);
  const helloTextRef = useRef<HTMLSpanElement>(null);
  const usernameTextRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial positions
    gsap.set(leftDumbbellRef.current, { x: -100, opacity: 0, rotate: -45 });
    gsap.set(helloTextRef.current, { x: -50, opacity: 0 });
    gsap.set(usernameTextRef.current, { x: 50, opacity: 0 });
    gsap.set(rightDumbbellRef.current, { x: 100, opacity: 0, rotate: 45 });
    
    // Create animation timeline
    const tl = gsap.timeline({ delay: 0.3 });
    
    // Animate the text and dumbbells
    tl.to([helloTextRef.current, usernameTextRef.current], {
      duration: 0.8,
      x: 0,
      opacity: 1,
      ease: "power2.out",
    }, 0)
    .to([leftDumbbellRef.current, rightDumbbellRef.current], {
      duration: 1,
      x: 0,
      opacity: 1,
      rotate: 0,
      ease: "back.out(1.7)",
    }, 0)
    // Add slight bounce effect
    .to([helloTextRef.current, usernameTextRef.current, leftDumbbellRef.current, rightDumbbellRef.current], {
      duration: 0.2,
      scale: 1.1,
      ease: "power1.out",
    }, 0.8)
    .to([helloTextRef.current, usernameTextRef.current, leftDumbbellRef.current, rightDumbbellRef.current], {
      duration: 0.3,
      scale: 1,
      ease: "elastic.out(1, 0.3)",
    }, 1);
    
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <CardTitle className="flex justify-center items-center py-4">
      <div ref={containerRef} className="flex items-center">
        <span 
          ref={leftDumbbellRef} 
          className="text-xl inline-block mr-1"
          aria-hidden="true"
        >
          <BicepsFlexed/>
        </span>
        <span 
          ref={helloTextRef} 
          className="text-xl font-bold inline-block"
        >
          Hello
        </span>
        <span className="mx-1"></span>
        <span 
          ref={usernameTextRef} 
          className="text-xl font-bold inline-block"
        >
        {username}
        </span>
        <span 
          ref={rightDumbbellRef} 
          className="text-xl inline-block ml-1"
          aria-hidden="true"
        >
          <BicepsFlexed className='scale-y-negative'/>
        </span>
      </div>
    </CardTitle>
  );
};

export default CollisionTitle;