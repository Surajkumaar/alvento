import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imageUrls || imageUrls.length === 0) return;

    // Create image elements dynamically
    imageUrls.forEach(url => {
      const imgEl = document.createElement('div');
      imgEl.className = 'content__img';
      const innerEl = document.createElement('div');
      innerEl.className = 'content__img-inner';
      innerEl.style.backgroundImage = `url(${url})`;
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

    const showNextImage = () => {
      const images = imageItemsRef.current;
      if (images.length === 0) return;

      imgPosition.current = imgPosition.current < images.length - 1 ? imgPosition.current + 1 : 0;
      const img = images[imgPosition.current];
      zIndexVal.current++;

      gsap.killTweensOf(img.el);
      gsap.timeline()
        .set(img.el, {
          opacity: 1,
          scale: 1,
          zIndex: zIndexVal.current,
          x: cacheMousePos.current.x - img.rect.width / 2,
          y: cacheMousePos.current.y - img.rect.height / 2,
        }, 0)
        .to(img.el, {
          duration: 0.9,
          ease: 'expo.out',
          x: mousePos.current.x - img.rect.width / 2,
          y: mousePos.current.y - img.rect.height / 2,
        }, 0)
        .to(img.el, {
          duration: 1,
          ease: 'power1.out',
          opacity: 0,
        }, 0.4)
        .to(img.el, {
          duration: 1,
          ease: 'quint.out',
          scale: 0.2,
        }, 0.4);
    };

    const render = () => {
      const distance = getMouseDistance(mousePos.current, lastMousePos.current);
      cacheMousePos.current.x = lerp(cacheMousePos.current.x, mousePos.current.x, 0.1);
      cacheMousePos.current.y = lerp(cacheMousePos.current.y, mousePos.current.y, 0.1);

      if (distance > 100) { // Threshold from original script
        showNextImage();
        lastMousePos.current = { ...mousePos.current };
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(render);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Clear dynamically created elements
      if(container) {
        container.innerHTML = '';
      }
      imageItemsRef.current = [];
    };
  }, [imageUrls, containerRef]);
};

export default useImageTrail;
