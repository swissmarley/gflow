import { useEffect, useState, type RefObject } from "react";

export function useChapterSequence(
  sectionRef: RefObject<HTMLElement>,
  count: number
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let visible = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(window.innerHeight, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const next = Math.min(count - 1, Math.floor(progress * count));
      setActiveIndex((current) => (current === next ? current : next));
      if (visible) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(update);
    });

    observer.observe(section);
    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [count, sectionRef]);

  return activeIndex;
}
