'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './FilterBar.module.css';
import type { Product } from '@/lib/data';

export type Filter = {
  category?: string;
  tag?: Product['tag'];
  brand?: string;
  search?: string;
};

type Props = {
  products: Product[];
  onFilterChange: (filter: Filter) => void;
  initialFilter?: Filter;
};

export function FilterBar({ products, onFilterChange, initialFilter }: Props) {
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products]
  );
  const [filter, setFilter] = useState<Filter>(initialFilter ?? {});

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    } else {
      setFilter({});
    }
  }, [initialFilter]);

  const updateFilter = (next: Partial<Filter>) => {
    const merged = { ...filter, ...next };
    setFilter(merged);
    onFilterChange(merged);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="search-input">
          Arama
        </label>
        <input
          id="search-input"
          type="search"
          value={filter.search ?? ''}
          onChange={(event) => updateFilter({ search: event.target.value })}
          placeholder="Ürün veya marka ara"
        />
      </div>
      <div className={styles.groupInline}>
        <fieldset className={styles.fieldset}>
          <legend>Kategori</legend>
          <button
            type="button"
            className={!filter.category ? styles.chipActive : styles.chip}
            onClick={() => updateFilter({ category: undefined })}
          >
            Hepsi
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={filter.category === category ? styles.chipActive : styles.chip}
              onClick={() => updateFilter({ category })}
            >
              {category}
            </button>
          ))}
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend>Marka</legend>
          <button
            type="button"
            className={!filter.brand ? styles.chipActive : styles.chip}
            onClick={() => updateFilter({ brand: undefined })}
          >
            Hepsi
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              className={filter.brand === brand ? styles.chipActive : styles.chip}
              onClick={() => updateFilter({ brand })}
            >
              {brand}
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
