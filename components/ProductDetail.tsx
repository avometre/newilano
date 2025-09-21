'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './ProductDetail.module.css';
import type { ProductDetail } from '@/lib/data';
import { EyeIcon } from './icons';
import { FavoriteButton } from './FavoriteButton';
import { ShareButtons } from './ShareButtons';

type Props = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: Props) {
  const galleryImages = useMemo(() => {
    const unique = [product.image, ...product.gallery];
    return unique.filter((image, index, arr) => arr.indexOf(image) === index);
  }, [product]);

  const [activeImage, setActiveImage] = useState(() => galleryImages[0] ?? product.image);

  useEffect(() => {
    setActiveImage(galleryImages[0] ?? product.image);
  }, [galleryImages, product.image]);

  const isDataImage = (src: string) => src.startsWith('data:image/');
  const shareUrl = `https://newilano.com/vitrin/${product.slug}`;
  const detailHref = product.productUrl?.trim() ? product.productUrl.trim() : `/vitrin/${product.slug}`;
  const isExternalLink = /^https?:\/\//i.test(detailHref);

  return (
    <section className={styles.section}>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            unoptimized={isDataImage(activeImage)}
          />
        </div>
        <div className={styles.thumbnailRow}>
          {galleryImages.map((image, index) => {
            const isActive = image === activeImage;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                className={isActive ? `${styles.thumbnail} ${styles.thumbnailActive}` : styles.thumbnail}
                onClick={() => setActiveImage(image)}
                aria-label={`${product.name} görsel ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="120px"
                  unoptimized={isDataImage(image)}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.brand}>{product.brand}</span>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>{product.price}</p>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.ctaGroup}>
          <Link
            href={detailHref}
            className={styles.primaryButton}
            prefetch={false}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
          >
            <EyeIcon width={18} height={18} aria-hidden="true" />
            Ürünü İncele
          </Link>
          <FavoriteButton
            productSlug={product.slug}
            className={styles.secondaryButton}
            activeClassName={styles.secondaryButtonActive}
          />
        </div>

        <div className={styles.share}>
          <span>Paylaş</span>
          <ShareButtons productUrl={shareUrl} />
        </div>

        <div className={styles.metaList}>
          <div>
            <span>Marka</span>
            <strong>{product.brand}</strong>
          </div>
          <div>
            <span>Kategori</span>
            <strong>{product.category}</strong>
          </div>
          <div>
            <span>Renk</span>
            <strong>{product.colors.join(', ')}</strong>
          </div>
          <div>
            <span>Materyal</span>
            <strong>-</strong>
          </div>
        </div>

        <div className={styles.features}>
          <h2>Öne Çıkan Özellikler</h2>
          <ul>
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
