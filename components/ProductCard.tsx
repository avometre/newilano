import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import type { Product } from '@/lib/data';

export function ProductCard({ product }: { product: Product }) {
  const isDataImage = product.image.startsWith('data:image/');
  return (
    <Link href={`/vitrin/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 90vw, 220px"
          className={styles.image}
          unoptimized={isDataImage}
        />
      </div>
      <div className={styles.info}>
        <span className={styles.brand}>{product.brand}</span>
        <h3>{product.name}</h3>
        <div className={styles.bottomRow}>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.cta}>
            İncele
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
