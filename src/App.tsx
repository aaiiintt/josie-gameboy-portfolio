import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReceiptHeader } from './sections/ReceiptHeader';


import { HorizontalScrollSection } from './components/HorizontalScrollSection';
import { PortfolioCard } from './components/PortfolioCard';

import aboutData from './content/about.json';
import videosData from './content/videos.json';
import artData from './content/art.json';
import experimentsData from './content/experiments.json';
import ideasData from './content/ideas.json';

import './App.css';

gsap.registerPlugin(ScrollTrigger);


// Grid Background
function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 149, 109, 0.2) 2px, transparent 2px),
          linear-gradient(90deg, rgba(139, 149, 109, 0.2) 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
  );
}

// Loading Screen
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (loadingRef.current) {
            gsap.to(loadingRef.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => onComplete()
            });
          }
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      ref={loadingRef}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center"
      style={{ background: '#c4cfa1' }}
    >
      <div className="pixel-box">
        <div className="pixel-box-inner p-8 text-center">
          <p className="font-display text-xl mb-6" style={{ color: '#4d5338' }}>
            JOSIE // TAIT
          </p>
          <div className="w-56 h-6 border-4 border-[#4d5338] p-1 mb-4">
            <div
              className="h-full bg-[#6b8c42] transition-all duration-100"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="font-mono-receipt text-sm" style={{ color: '#6b6b6b' }}>
            LOADING... {Math.min(Math.floor(progress), 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for CMS admin route to bypass SPA fallback
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      window.location.href = '/admin/index.html';
      return;
    }

    if (!isLoading && mainRef.current) {
      ScrollTrigger.refresh();
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}


      <GridBackground />

      <main
        ref={mainRef}
        className={`relative min-h-screen transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        style={{ background: '#c4cfa1' }}
      >
        <div className="relative z-10">
          <ReceiptHeader />


          <HorizontalScrollSection title="ABOUT">
            <PortfolioCard id="ABT" title={aboutData.title}>
              <div className="whitespace-pre-wrap">{aboutData.content}</div>
            </PortfolioCard>
          </HorizontalScrollSection>

          <HorizontalScrollSection title="VIDEOS" description="Selected video work and showreels.">
            {videosData.items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                id={`V${(i + 1).toString().padStart(2, '0')}`}
                title={item.title}
                mediaPath={item.mediaPath}
                mediaType={item.mediaType as 'video' | 'image'}
              >
                {item.description}
              </PortfolioCard>
            ))}
          </HorizontalScrollSection>

          <HorizontalScrollSection title="ART" description="Digital, generative, and physical art explorations.">
            {artData.items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                id={`A${(i + 1).toString().padStart(2, '0')}`}
                title={item.title}
                mediaPath={item.mediaPath}
                mediaType={item.mediaType as 'video' | 'image'}
              >
                {item.description}
              </PortfolioCard>
            ))}
          </HorizontalScrollSection>

          <HorizontalScrollSection title="EXPERIMENTS" description="Code, shaders, and prototypes.">
            {experimentsData.items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                id={`E${(i + 1).toString().padStart(2, '0')}`}
                title={item.title}
                mediaPath={item.mediaPath}
                mediaType={item.mediaType as 'video' | 'image'}
              >
                {item.description}
              </PortfolioCard>
            ))}
          </HorizontalScrollSection>

          <HorizontalScrollSection title="IDEAS" description="Thoughts, notes, and works in progress.">
            {ideasData.items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                id={`I${(i + 1).toString().padStart(2, '0')}`}
                title={item.title}
                mediaPath={item.mediaPath}
                mediaType={item.mediaType as 'video' | 'image'}
              >
                {item.description}
              </PortfolioCard>
            ))}
          </HorizontalScrollSection>

        </div>
      </main>
    </>
  );
}

export default App;
