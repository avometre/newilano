'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FilterBar, type Filter } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import styles from './page.module.css';
import type { ProductDetail } from '@/lib/data';

function parseFilter(searchParams: URLSearchParams): Filter {
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  return {
    search: search?.trim() || undefined,
    category: category || undefined,
    brand: brand || undefined
  };
}

function setUrl(filter: Filter) {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.category) params.set('category', filter.category);
  if (filter.brand) params.set('brand', filter.brand);
  const query = params.toString();
  const nextUrl = query ? `/vitrin?${query}` : '/vitrin';
  window.history.replaceState(null, '', nextUrl);
}

function applyFilter(products: ProductDetail[], filter: Filter) {
  return products.filter((product) => {
    if (filter.category && product.category !== filter.category) {
      return false;
    }

    if (filter.brand && product.brand !== filter.brand) {
      return false;
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      const searchable = `${product.brand} ${product.name}`.toLowerCase();
      if (!searchable.includes(term)) {
        return false;
      }
    }

    return true;
  });
}

export function VitrinClient({ products }: { products: ProductDetail[] }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() => parseFilter(searchParams));

  useEffect(() => {
    setFilter(parseFilter(searchParams));
  }, [searchParams]);

  const filteredProducts = useMemo(() => applyFilter(products, filter), [products, filter]);

  const handleFilterChange = (next: Filter) => {
    setFilter(next);
    setUrl(next);
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Vitrin' }]} />
          <div className={styles.heroContent}>
            <h1>Vitrin</h1>
            <p>
              Newilano vitrini ile sezonun favori sneaker, giyim ve aksesuar ürünlerini keşfedin. Filtreleri
              kullanarak aradığınız stile hızla ulaşın.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          <FilterBar products={products} onFilterChange={handleFilterChange} initialFilter={filter} />
          <section>
            <div className={styles.resultsHeader}>
              <h2 className="section-title">{filteredProducts.length} Ürün</h2>
              <span>Filtreleri kullanarak aramanızı daraltın.</span>
            </div>
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
