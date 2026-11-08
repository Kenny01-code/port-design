import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const FRAME_COUNT = 120;
const frames = Array.from({ length: FRAME_COUNT }, (_, index) =>
  `${import.meta.env.BASE_URL}frames/frame-${String(index).padStart(3, '0')}.webp`,
);
const lime = [178, 245, 144] as const;
let activeLenis: Lenis | null = null;

const projects = [
  { title: 'Neon Bloom', category: 'Branding', year: '2025', word: 'NEON', frame: 4, color: 'radial-gradient(circle at 30% 25%,#ff7ab8,#6b1fa8 60%,#120022)' },
  { title: 'Solar Form', category: '3D Product', year: '2025', word: 'SOLAR', frame: 30, color: 'radial-gradient(circle at 70% 30%,#ffe14d,#e8590c 60%,#2a0a00)' },
  { title: 'Tidal', category: 'Motion', year: '2024', word: 'TIDAL', frame: 58, color: 'radial-gradient(circle at 40% 30%,#7fe3d4,#0b5d6b 60%,#001a1f)' },
  { title: 'Halo', category: 'Web Experience', year: '2024', word: 'HALO', frame: 78, color: 'radial-gradient(circle at 60% 25%,#c6b5ff,#3b2db0 60%,#07031f)' },
  { title: 'Verde', category: 'Packaging', year: '2023', word: 'VERDE', frame: 96, color: 'radial-gradient(circle at 30% 30%,#b2f590,#1d7a2a 60%,#031a06)' },
  { title: 'Mono', category: 'Editorial', year: '2022', word: 'MONO', frame: 116, color: 'radial-gradient(circle at 50% 25%,#fff,#888 55%,#111)' },
];

const services = [
  { title: '3D Design', description: 'Sculpted objects, characters and worlds rendered with studio lighting.', visual: 'v1', color: '#fff' },
  { title: 'Motion', description: 'Scroll films and product reveals that hold attention.', visual: 'v2', color: 'var(--lime)' },
  { title: 'Web Experience', description: 'Interactive sites with real depth, built to win awards.', visual: 'v3', color: '#111', light: true },
  { title: 'Brand Systems', description: 'Type, color and motion rules that scale everywhere.', visual: 'v4', color: '#ffb4d2' },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function drawFrame(canvas: HTMLCanvasElement | null, image?: HTMLImageElement) {
  const context = canvas?.getContext('2d');
  if (!canvas || !context || !image?.complete || !image.naturalWidth) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function usePageMotion(
  loaded: boolean,
  images: React.MutableRefObject<(HTMLImageElement | undefined)[]>,
  canvas: React.RefObject<HTMLCanvasElement | null>,
  cursor: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!loaded) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reducedMotion
      ? null
      : new Lenis({
          duration: 1.15,
          smoothWheel: true,
          syncTouch: false,
          anchors: true,
        });
    activeLenis = lenis;
    const hero = document.querySelector<HTMLElement>('#hero');
    const subject = document.querySelector<HTMLElement>('#subj');
    const work = document.querySelector<HTMLElement>('#work');
    const track = document.querySelector<HTMLElement>('#trk');
    const title = document.querySelector<HTMLElement>('#big');
    const progress = document.querySelector<HTMLElement>('#bp');
    const curtain = document.querySelector<HTMLElement>('#cv');
    const servicesSection = document.querySelector<HTMLElement>('#svc');
    const marqueeOne = document.querySelector<HTMLElement>('#r1');
    const marqueeTwo = document.querySelector<HTMLElement>('#r2');
    const logo = document.querySelector<HTMLElement>('#wm');
    const orbs = [...document.querySelectorAll<HTMLElement>('.orb')];
    const serviceWords = [...document.querySelectorAll<HTMLElement>('.w2')];
    const serviceCards = [...document.querySelectorAll<HTMLElement>('.sc')];
    const projectCards = [...document.querySelectorAll<HTMLElement>('.card')];
    const cursorTargets = [...document.querySelectorAll<HTMLElement>('[data-v],.card')];
    const magneticTargets = [...document.querySelectorAll<HTMLElement>('[data-mag]')];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentFrame = -1;
    let animationFrame = 0;
    let scheduledUpdate = 0;

    const renderScrollEffects = () => {
      scheduledUpdate = 0;
      const viewportHeight = window.innerHeight;
      const pageScroll = window.scrollY;
      const sectionProgress = (element: HTMLElement | null) => {
        if (!element) return 0;
        const bounds = element.getBoundingClientRect();
        return clamp(-bounds.top / Math.max(1, bounds.height - viewportHeight));
      };

      const heroProgress = sectionProgress(hero);
      const heroFade = clamp((heroProgress - 0.55) / 0.3);
      const heroGray = clamp((heroProgress - 0.85) / 0.15);
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      orbs.forEach((orb) => {
        const depth = Number(orb.dataset.d);
        orb.style.transform = reducedMotion ? 'none' : `translate3d(${-currentX * depth * 1.4}px,${-currentY * depth * 1.4 - heroProgress * depth * 8}px,0)`;
        orb.style.opacity = reducedMotion ? '1' : String(1 - heroFade);
      });

      if (subject) {
        subject.style.transform = reducedMotion
          ? 'translateX(-50%)'
          : `translateX(-50%) perspective(900px) rotateY(${currentX * 14}deg) rotateX(${-currentY * 6}deg) scale(${1 + 0.22 * heroProgress})`;
        subject.style.filter = reducedMotion ? 'none' : `grayscale(${heroGray})`;
      }

      const frameIndex = reducedMotion ? 0 : Math.round(clamp(heroProgress / 0.8) * (FRAME_COUNT - 1));
      if (frameIndex !== currentFrame) {
        drawFrame(canvas.current, images.current[frameIndex]);
        currentFrame = frameIndex;
      }

      const firstLine = document.querySelector<HTMLElement>('#l1');
      const secondLine = document.querySelector<HTMLElement>('#l2');
      if (firstLine) firstLine.style.transform = reducedMotion ? 'none' : `translateX(${-heroProgress * 14}vw)`;
      if (secondLine) secondLine.style.transform = reducedMotion ? 'none' : `translateX(${heroProgress * 14}vw)`;
      if (curtain) {
        curtain.style.clipPath = reducedMotion ? 'inset(55% 0 0 76%)' : `inset(${55 * (1 - heroFade)}% 0 0 ${76 * (1 - heroFade)}%)`;
        curtain.style.background = reducedMotion ? 'var(--lime)' : `rgb(${lime.map((channel) => Math.round(channel * (1 - heroGray))).join(',')})`;
      }

      const workProgress = sectionProgress(work);
      if (track) {
        const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.05);
        track.style.transform = reducedMotion ? 'none' : `translate3d(${-workProgress * horizontalDistance}px,0,0)`;
      }
      if (title) title.style.setProperty('--f', `${clamp(workProgress * 3) * 100}%`);
      if (progress) progress.style.width = `${workProgress * 100}%`;

      if (servicesSection) {
        const bounds = servicesSection.getBoundingClientRect();
        servicesSection.style.setProperty('--r', reducedMotion ? '160%' : `${clamp(((viewportHeight - bounds.top) / viewportHeight) * 1.2) * 160}%`);
        const revealProgress = clamp((viewportHeight * 0.85 - bounds.top) / (viewportHeight * 0.5));
        serviceWords.forEach((word, index) => {
          word.style.opacity = reducedMotion ? '1' : String(0.15 + 0.85 * clamp(revealProgress * serviceWords.length - index));
        });
      }
      serviceCards.forEach((card, index) => {
        const next = serviceCards[index + 1];
        if (!next) return;
        const distance = clamp(1 - (next.getBoundingClientRect().top - viewportHeight * 0.12) / (viewportHeight * 0.6));
        card.style.transform = reducedMotion ? 'none' : `scale(${1 - 0.08 * distance})`;
        card.style.filter = reducedMotion ? 'none' : `brightness(${1 - 0.35 * distance})`;
      });

      const marqueeOffset = viewportHeight - (document.querySelector('#mw')?.getBoundingClientRect().top ?? viewportHeight);
      if (marqueeOne) marqueeOne.style.transform = reducedMotion ? 'none' : `translate3d(${-marqueeOffset * 0.4}px,0,0)`;
      if (marqueeTwo) marqueeTwo.style.transform = reducedMotion ? 'none' : `translate3d(${-900 + marqueeOffset * 0.4}px,0,0)`;
      projectCards.forEach((card) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--px', reducedMotion ? '0px' : `${(bounds.left + bounds.width / 2 - window.innerWidth / 2) * -0.07}px`);
      });

      if (cursor.current && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const offset = cursor.current.classList.contains('v') ? 42 : 6;
        cursor.current.style.transform = `translate3d(${mouseX - offset}px,${mouseY - offset}px,0)`;
      }

      const pageHeight = document.documentElement.scrollHeight - viewportHeight;
      document.querySelector<HTMLElement>('#pg')?.style.setProperty(
        'transform',
        `scaleX(${pageScroll / Math.max(1, pageHeight)})`,
      );
      if (logo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        [...logo.children].forEach((letter) => {
          const bounds = letter.getBoundingClientRect();
          const distance = Math.hypot(mouseX - (bounds.left + bounds.width / 2), mouseY - (bounds.top + bounds.height / 2));
          const influence = clamp(1 - distance / 400);
          (letter as HTMLElement).style.transform = `translateY(${-influence * 3}vw)`;
          (letter as HTMLElement).style.fontWeight = String(300 + influence * 600);
        });
      }
      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        scheduleUpdate();
      }
    };

    const scheduleUpdate = () => {
      if (!scheduledUpdate) scheduledUpdate = requestAnimationFrame(renderScrollEffects);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
      scheduleUpdate();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        return;
      }
      scheduleUpdate();
      if (lenis) animationFrame = requestAnimationFrame(animateLenis);
    };
    const animateLenis = (time: number) => {
      if (document.hidden || !lenis) return;
      lenis.raf(time);
      animationFrame = requestAnimationFrame(animateLenis);
    };
    const updateCard = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const card = event.currentTarget as HTMLElement;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--rx', `${(x - 0.5) * 16}deg`);
      card.style.setProperty('--ry', `${(0.5 - y) * 16}deg`);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    };
    const resetCard = (event: PointerEvent) => {
      const card = event.currentTarget as HTMLElement;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };
    const showCursor = () => cursor.current?.classList.add('v');
    const hideCursor = () => cursor.current?.classList.remove('v');
    const moveMagnet = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const element = event.currentTarget as HTMLElement;
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      element.style.transform = `translate3d(${x * 0.18}px,${y * 0.18}px,0)`;
    };
    const resetMagnet = (event: PointerEvent) => {
      (event.currentTarget as HTMLElement).style.transform = '';
    };
    const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')];
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const value = Number(element.dataset.count);
        if (reducedMotion) {
          element.textContent = `${value}+`;
          countObserver.unobserve(element);
          return;
        }
        const start = performance.now();
        const animateCount = (now: number) => {
          const progress = clamp((now - start) / 1500);
          element.textContent = `${Math.round(value * (1 - (1 - progress) ** 3))}+`;
          if (progress < 1) requestAnimationFrame(animateCount);
        };
        requestAnimationFrame(animateCount);
        countObserver.unobserve(element);
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => countObserver.observe(counter));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.pc, .stm').forEach((element) => revealObserver.observe(element));
    if (!reducedMotion) {
      projectCards.forEach((card) => {
        card.addEventListener('pointermove', updateCard);
        card.addEventListener('pointerleave', resetCard);
      });
    }
    cursorTargets.forEach((target) => {
      target.addEventListener('pointerenter', showCursor);
      target.addEventListener('pointerleave', hideCursor);
    });
    if (!reducedMotion) {
      magneticTargets.forEach((target) => {
        target.addEventListener('pointermove', moveMagnet);
        target.addEventListener('pointerleave', resetMagnet);
      });
    }
    lenis?.on('scroll', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    scheduleUpdate();
    if (lenis) animationFrame = requestAnimationFrame(animateLenis);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(scheduledUpdate);
      countObserver.disconnect();
      revealObserver.disconnect();
      if (!reducedMotion) {
        projectCards.forEach((card) => {
          card.removeEventListener('pointermove', updateCard);
          card.removeEventListener('pointerleave', resetCard);
        });
      }
      cursorTargets.forEach((target) => {
        target.removeEventListener('pointerenter', showCursor);
        target.removeEventListener('pointerleave', hideCursor);
      });
      if (!reducedMotion) {
        magneticTargets.forEach((target) => {
          target.removeEventListener('pointermove', moveMagnet);
          target.removeEventListener('pointerleave', resetMagnet);
        });
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      lenis?.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [loaded, images, canvas, cursor]);
}

function ServiceVisual({ type }: { type: string }) {
  const count = type === 'v1' ? 3 : type === 'v2' ? 5 : type === 'v4' ? 9 : 1;
  return <div className={`vis ${type}`} aria-hidden="true">{Array.from({ length: count }, (_, index) => <i key={index} />)}</div>;
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadErrors, setLoadErrors] = useState(0);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const images = useRef<(HTMLImageElement | undefined)[]>([]);
  const heroCanvas = useRef<HTMLCanvasElement>(null);
  const showcaseCanvas = useRef<HTMLCanvasElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let completed = 0;
    let failures = 0;
    const loadedImages: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    images.current = loadedImages;
    frames.forEach((source, index) => {
      const image = new Image();
      image.onload = () => {
        loadedImages[index] = image;
        completed += 1;
        setLoadProgress(Math.round((completed / FRAME_COUNT) * 100));
        if (completed === FRAME_COUNT) {
          setLoadErrors(failures);
          setLoaded(true);
          document.body.classList.add('go');
        }
      };
      image.onerror = () => {
        failures += 1;
        completed += 1;
        setLoadProgress(Math.round((completed / FRAME_COUNT) * 100));
        if (completed === FRAME_COUNT) {
          setLoadErrors(failures);
          setLoaded(true);
          document.body.classList.add('go');
        }
      };
      image.src = source;
    });
    return () => {
      document.body.classList.remove('go');
      loadedImages.forEach((image) => {
        if (image) {
          image.onload = null;
          image.onerror = null;
        }
      });
    };
  }, []);

  usePageMotion(loaded, images, heroCanvas, cursor);

  useEffect(() => {
    if (!showcaseOpen) return;
    const modal = document.querySelector<HTMLElement>('#md');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    activeLenis?.stop();
    const frame = showcaseCanvas.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let direction = 1;
    let lastDraw = 0;
    let animationFrame = 0;
    const drawShowcase = (time: number) => {
      if (time - lastDraw > 41) {
        lastDraw = time;
        index += direction;
        if (index >= FRAME_COUNT - 1) {
          index = FRAME_COUNT - 1;
          direction = -1;
        } else if (index <= 0) {
          index = 0;
          direction = 1;
        }
        drawFrame(frame, images.current[index]);
      }
      animationFrame = requestAnimationFrame(drawShowcase);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowcaseOpen(false);
      if (event.key === 'Tab' && modal) {
        event.preventDefault();
        closeButton.current?.focus();
      }
    };
    closeButton.current?.focus();
    if (reducedMotion) drawFrame(frame, images.current[0]);
    else animationFrame = requestAnimationFrame(drawShowcase);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      activeLenis?.start();
      returnFocus.current?.focus();
    };
  }, [showcaseOpen]);

  useEffect(() => {
    if (loaded) drawFrame(heroCanvas.current, images.current[0]);
  }, [loaded]);

  const openShowcase = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    returnFocus.current = event.currentTarget;
    setShowcaseOpen(true);
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="cursor" id="cur" ref={cursor} aria-hidden="true">View</div>
      <div id="pg" aria-hidden="true" />
      <div className={`loader${loaded ? ' done' : ''}`} role="status" aria-live="polite">
        <span>RenderVision / {loaded && loadErrors ? 'Some visuals unavailable' : 'Loading'}</span>
        <b>{loadProgress}</b>
        <i style={{ width: `${loadProgress}%` }} />
      </div>

      <main>
        <section id="hero">
          <div className="stick">
            <nav aria-label="Main navigation">
              <a className="logo sf" href="#hero" onClick={closeMenu}>RenderVision</a>
              <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-links" onClick={() => setMenuOpen((open) => !open)}>
                {menuOpen ? 'Close' : 'Menu'}
              </button>
              <ul id="primary-links" className={menuOpen ? 'open' : ''}>
                <li><a href="#svc" onClick={closeMenu}>Services</a></li>
                <li><a href="#work" onClick={closeMenu}>Portfolio</a></li>
                <li><a href="#mw" onClick={closeMenu}>About</a></li>
                <li><a href="#cta" onClick={closeMenu}>Plan</a></li>
              </ul>
              <a className="pill" href="#cta" data-mag>Get in touch</a>
            </nav>
            <div className="mint" />
            <div className="lime">
              <div><b className="sf" data-count="200">0+</b><span>Projects Delivered</span></div>
              <div><b className="sf" data-count="5">0+</b><span>Years of 3D Design Experience</span></div>
              <div><b className="sf" data-count="40">0+</b><span>Industries Served</span></div>
            </div>
            <h1 className="hd">
              <div id="l1"><span className="w">Transform</span> <em className="px">Ideas</em> <span className="w">Into</span></div>
              <div id="l2"><span className="w">Visual</span> <em className="px">Masterpieces</em></div>
            </h1>
            <div className="left">
              <b>Explore Our Portfolio</b>
              <p>Cutting-edge 3D designs that elevate your projects with precision, creativity, and immersive detail.</p>
              <a href="#work" data-v>Explore Our Portfolio ↗</a>
              <div className="th" aria-hidden="true">
                {[8, 55, 100].map((frame) => <i key={frame}><img src={frames[frame]} alt="" /></i>)}
              </div>
            </div>
            <div className="curtain" id="cv" />
            <div className="orb" data-d="10" style={{ '--s': '50vh', '--l': 'calc(50% - 25vh)', '--t': '25vh' } as React.CSSProperties}>
              <svg viewBox="0 0 200 200" fill="none" stroke="#111" aria-hidden="true">
                <circle className="rt" style={{ animationDuration: '90s' }} cx="100" cy="100" r="99" strokeWidth=".6" strokeDasharray="1 4.2" />
                <circle cx="100" cy="100" r="92" strokeWidth=".4" />
                <circle className="rt" style={{ animationDuration: '36s', animationDirection: 'reverse' }} cx="100" cy="100" r="84" strokeWidth="1" strokeDasharray="46 14 6 14" />
                <path d="M100 -4v14M100 190v14M-4 100h14M190 100h14" strokeWidth=".8" />
              </svg>
            </div>
            <div className="orb rg" data-d="6" style={{ '--s': '80vh', '--l': 'calc(50% - 40vh)', '--t': '32vh' } as React.CSSProperties}>
              <div className="tilt"><svg viewBox="0 0 200 200" fill="none" stroke="#111" aria-hidden="true"><g className="rt" style={{ animationDuration: '24s' }}><circle cx="100" cy="100" r="98" strokeWidth=".8" /><circle cx="100" cy="100" r="98" strokeWidth="3.2" stroke="#2B2BFF" strokeDasharray="46 600" strokeLinecap="round" /><circle cx="100" cy="100" r="91" strokeWidth=".5" strokeDasharray="1 3.4" /><circle cx="100" cy="2" r="3.4" fill="#B2F590" strokeWidth="1" /><circle cx="198" cy="100" r="1.8" fill="#111" stroke="none" /><circle cx="2" cy="100" r="1.8" fill="#111" stroke="none" /></g></svg></div>
            </div>
            <div className="orb rg fr" data-d="6" style={{ '--s': '80vh', '--l': 'calc(50% - 40vh)', '--t': '32vh' } as React.CSSProperties}>
              <div className="tilt"><svg viewBox="0 0 200 200" fill="none" stroke="#111" aria-hidden="true"><g className="rt" style={{ animationDuration: '24s' }}><circle cx="100" cy="100" r="98" strokeWidth=".8" /><circle cx="100" cy="100" r="98" strokeWidth="3.2" stroke="#2B2BFF" strokeDasharray="46 600" strokeLinecap="round" /><circle cx="100" cy="100" r="91" strokeWidth=".5" strokeDasharray="1 3.4" /><circle cx="100" cy="2" r="3.4" fill="#B2F590" strokeWidth="1" /><circle cx="198" cy="100" r="1.8" fill="#111" stroke="none" /><circle cx="2" cy="100" r="1.8" fill="#111" stroke="none" /></g></svg></div>
            </div>
            <div className="orb co" data-d="14" style={{ '--s': 'auto', '--l': '14vw', '--t': '46vh' } as React.CSSProperties}><span><b className="sf">01</b> Depth</span><i /><s /></div>
            <div className="orb co r" data-d="18" style={{ '--s': 'auto', '--l': '63.5vw', '--t': '43vh' } as React.CSSProperties}><span><b className="sf">02</b> Motion</span><i /><s /></div>
            <div className="subj" id="subj"><canvas ref={heroCanvas} width="560" height="522" aria-label="Animated 3D design showcase" /></div>
            <a className="badge" href="#work" onClick={openShowcase} aria-label="Open animated showcase">
              <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="circle-text" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" /></defs><text><textPath href="#circle-text">WATCH OUR SHOWCASE * WATCH OUR SHOWCASE * </textPath></text></svg>
              <div className="blob">↗</div>
            </a>
          </div>
        </section>

        <section id="work">
          <div className="stick">
            <h2 className="big" id="big">SELECTED WORK</h2>
            <p className="sub">Six projects, one obsession with depth, motion and detail. Keep scrolling.</p>
            <div className="track" id="trk">
              {projects.map((project, index) => (
                <article className="card" data-v key={project.title} style={{ background: project.color }} aria-label={`${project.title}, ${project.category}, ${project.year}`}>
                  <u aria-hidden="true">{project.word}</u><b aria-hidden="true">{String(index + 1).padStart(2, '0')}</b>
                  <div className="pic"><img src={frames[project.frame]} alt={`${project.title} 3D artwork`} loading="lazy" /></div>
                  <span><strong>{project.title}</strong><br /><small>{project.category} / {project.year}</small></span>
                </article>
              ))}
            </div>
            <div className="bar" aria-hidden="true"><i id="bp" /></div>
          </div>
        </section>

        <section id="mw" aria-label="Our approach">
          <div className="mrow" id="r1">DEPTH * MOTION * SCROLL * DETAIL * DEPTH * MOTION * SCROLL * DETAIL * DEPTH * MOTION * SCROLL * DETAIL *</div>
          <div className="mrow o" id="r2">Visual masterpieces * built to be felt * Visual masterpieces * built to be felt * Visual masterpieces * built to be felt *</div>
        </section>

        <section id="svc">
          <h2 className="sf">{'Four crafts, one obsession with detail, depth and motion.'.split(' ').map((word, index) => <span className="w2" key={`${word}-${index}`}>{word} </span>)}</h2>
          {services.map((service, index) => (
            <article className="sc" style={{ background: service.color, color: service.light ? '#fff' : undefined }} key={service.title}>
              <ServiceVisual type={service.visual} />
              <div><h3>{service.title}</h3><p>{service.description}</p></div>
              <div className="n sf">{String(index + 1).padStart(2, '0')}</div>
            </article>
          ))}
        </section>

        <section id="cta">
          <div className="mq" aria-hidden="true"><div className="sf">RenderVision * Visual Masterpieces * RenderVision * Visual Masterpieces * RenderVision * Visual Masterpieces * RenderVision * Visual Masterpieces *</div></div>
          <div className="pr">
            <article className="pc"><span>Starter</span><b className="sf">$1.5k</b><ul><li>One hero scene</li><li>Landing page</li></ul></article>
            <article className="pc"><span>Studio</span><b className="sf">$6k</b><ul><li>Full 3D site</li><li>Scroll motion</li><li>Brand kit</li></ul></article>
            <article className="pc"><span>Flagship</span><b className="sf">$15k</b><ul><li>Custom 3D world</li><li>Launch film</li></ul></article>
          </div>
          <p className="stm">Let’s build something <em className="sf">unforgettable</em></p>
          <a className="mag" href="#" data-mag>Get in touch</a>
        </section>

        <footer>
          <div className="wm" id="wm" aria-label="RenderVision">{[...'RenderVision'].map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}</div>
          <div className="fl"><span>© RenderVision</span><span>Instagram / Behance / LinkedIn</span><a href="#hero">Back to top ↑</a></div>
        </footer>
      </main>

      <div className={`showcase${showcaseOpen ? ' on' : ''}`} id="md" role="dialog" aria-modal="true" aria-label="Animated showcase" aria-hidden={!showcaseOpen} onClick={(event) => {
        if (event.target === event.currentTarget) setShowcaseOpen(false);
      }}>
        <h2>Showcase</h2>
        <canvas id="mc" ref={showcaseCanvas} width="560" height="522" aria-label="Looping showcase animation" />
        <button id="mx" ref={closeButton} type="button" tabIndex={showcaseOpen ? 0 : -1} onClick={() => setShowcaseOpen(false)}>Close</button>
      </div>
      {!loaded && <span className="sr-only" aria-live="polite">Loading design assets: {loadProgress}%</span>}
    </>
  );
}

export default App;
