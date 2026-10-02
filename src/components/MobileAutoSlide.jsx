import { useState, useEffect, useRef } from 'react';

/**
 * On mobile (<=800px), auto-cycles through product images when the card
 * is visible in the viewport. On desktop, renders nothing (hover zones handle it).
 */
export default function MobileAutoSlide({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 800);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Observe visibility
  useEffect(() => {
    if (!isMobile || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { root: null, threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Auto-cycle when visible on mobile
  useEffect(() => {
    if (!isMobile || !isVisible || !images || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isMobile, isVisible, images]);

  // Reset index when product changes
  useEffect(() => {
    setActiveIndex(0);
  }, [name]);

  if (!isMobile || !images || images.length <= 1) return null;

  return (
    <div ref={ref} className="mobile-auto-slide">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={name}
          className={`mobile-slide-img ${i === activeIndex ? 'active' : ''}`}
        />
      ))}
      <div className="mobile-slide-dots">
        {images.map((_, i) => (
          <span key={i} className={`mobile-slide-dot ${i === activeIndex ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
