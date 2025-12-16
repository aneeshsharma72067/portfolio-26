import { useEffect, useState } from 'react';
import Logo from '@/assets/image/logo.png';

export default function RevealEffect() {
  const [showCover, setShowCover] = useState(true);
  const [animateLogo, setAnimateLogo] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateLogo(true), 300); // logo animation starts
    setTimeout(() => setShowCover(false), 1200); // cover fades out
  }, []);

  return (
    <div
      className={`w-screen h-screen flex items-center justify-center
        bg-[#011c21]/90 backdrop-blur-lg fixed top-0 left-0
        transition-opacity duration-1000 z-[100]
        ${showCover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <img
        src={Logo}
        alt='Logo'
        className={`
          w-44 h-auto rounded-full
          transition-all duration-700 ease-out
          ${
            animateLogo
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-[-10deg]'
          }
        `}
      />
    </div>
  );
}
