'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';
import type { HeroSlide } from '@/lib/data';

type Props = {
  slides: HeroSlide[];
};

export function HeroSection({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slides[activeIndex % slides.length] : null;

  useEffect(() => {
    if (!hasSlides) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [hasSlides, slides.length]);

  if (!activeSlide) {
    return null;
  }

  return (
    <section className={styles.hero}>
      <div className={styles.media}>
        <Image
          src={activeSlide.image}
          alt={activeSlide.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
          unoptimized={activeSlide.image.startsWith('data:image/')}
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className="container">
          <div className={styles.textBox}>
            <h1>{activeSlide.title}</h1>
            <p>{activeSlide.subtitle}</p>
            <Link href={activeSlide.ctaHref} className={styles.cta}>
              {activeSlide.ctaLabel}
            </Link>
          </div>
          <div className={styles.dots}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={index === activeIndex ? styles.dotActive : styles.dot}
                aria-label={`${slide.title} görseline geç`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
