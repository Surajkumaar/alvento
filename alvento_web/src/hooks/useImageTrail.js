import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

// Helper functions from original script
const lerp = (a, b, n) => (1 - n) * a + n * b;
const getMouseDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

const useImageTrail = (imageUrls, containerRef) => {
  const imageItemsRef = useRef([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cacheMousePos = useRef({ x: 0, y: 0 });
  const imgPosition = useRef(0);
  const zIndexVal = useRef(1);
  const animationFrameId = useRef(null);
  const lastShowTime = useRef(0);

  // Memoize the showNextImage function to prevent unnecessary re-renders
  const showNextImage = useCallback(() => {
    const images = imageItemsRef.current;
    if (images.length === 0) return;

    const now = performance.now();
    // Throttle image creation to avoid performance issues
    if (now - lastShowTime.current < 50) return; // Max 20 images per second
    lastShowTime.current = now;

    imgPosition.current = imgPosition.current < images.length - 1 ? imgPosition.current + 1 : 0;
    const img = images[imgPosition.current];
    zIndexVal.current++;

    gsap.killTweensOf(img.el);
    
    // Optimized GSAP timeline with better performance
    gsap.timeline()
      .set(img.el, {
        opacity: 1,
        scale: 1,
        zIndex: zIndexVal.current,
        x: cacheMousePos.current.x - img.rect.width / 2,
        y: cacheMousePos.current.y - img.rect.height / 2,
        willChange: 'transform, opacity',
        force3D: true, // Force hardware acceleration
      }, 0)
      .to(img.el, {
        duration: 0.9,
        ease: 'expo.out',
        x: mousePos.current.x - img.rect.width / 2,
        y: mousePos.current.y - img.rect.height / 2,
        force3D: true,
      }, 0)
      .to(img.el, {
        duration: 1,
        ease: 'power1.out',
        opacity: 0,
        force3D: true,
      }, 0.4)
      .to(img.el, {
        duration: 1,
        ease: 'quint.out',
        scale: 0.2,
        force3D: true,
        onComplete: () => {
          // Reset will-change to auto when animation completes
          gsap.set(img.el, { willChange: 'auto' });
        }
      }, 0.4);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageUrls || imageUrls.length === 0) return;

    // Create image elements dynamically with better performance hints
    imageUrls.forEach(url => {
      const imgEl = document.createElement('div');
      imgEl.className = 'content__img';
      imgEl.style.willChange = 'transform, opacity';
      imgEl.style.backfaceVisibility = 'hidden';
      imgEl.style.transformStyle = 'preserve-3d';
      
      const innerEl = document.createElement('div');
      innerEl.className = 'content__img-inner';
      innerEl.style.backgroundImage = `url(${url})`;
      innerEl.style.willChange = 'transform';
      innerEl.style.backfaceVisibility = 'hidden';
      
      imgEl.appendChild(innerEl);
      container.appendChild(imgEl);
      
      imageItemsRef.current.push({
        el: imgEl,
        rect: imgEl.getBoundingClientRect()
      });
    });

    const handleMouseMove = (ev) => {
      const rect = container.getBoundingClientRect();
      mousePos.current = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      };
    };

    const render = () => {
      const distance = getMouseDistance(mousePos.current, lastMousePos.current);
      
      // Use smoother lerp values for better performance
      cacheMousePos.current.x = lerp(cacheMousePos.current.x, mousePos.current.x, 0.08);
      cacheMousePos.current.y = lerp(cacheMousePos.current.y, mousePos.current.y, 0.08);

      if (distance > 80) { // Slightly reduced threshold for more responsive feel
        showNextImage();
        lastMousePos.current = { ...mousePos.current };
      }
      
      animationFrameId.current = requestAnimationFrame(render);
    };

    // Use passive event listeners for better scroll performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId.current = requestAnimationFrame(render);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Clean up GSAP animations
      imageItemsRef.current.forEach(item => {
        gsap.killTweensOf(item.el);
      });
      // Clear dynamically created elements
      if(container) {
        container.innerHTML = '';
      }
      imageItemsRef.current = [];
    };
  }, [imageUrls, containerRef, showNextImage]);
};

export default useImageTrail;
