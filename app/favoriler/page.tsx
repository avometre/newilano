import { redirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductCard } from '@/components/ProductCard';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { getProductsBySlugs } from '@/lib/data';
import { User } from '@/models/User';
import styles from './page.module.css';

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/giris?callbackUrl=${encodeURIComponent('/favoriler')}`);
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).lean();

  const favoriteProducts = await getProductsBySlugs(user?.favorites ?? []);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Favoriler' }]} />
          <div className={styles.heroContent}>
            <h1>Favoriler</h1>
            <p>Beğendiğin Newilano ürünlerini burada bir arada bul. Favoriye aldığın ürünler stokta oldukça seni bekler.</p>
          </div>
        </div>
      </section>

      <div className="container">
        {favoriteProducts.length === 0 ? (
          <div className={styles.emptyState}>Favorilerine eklenmiş bir ürünün yok. Vitrin sayfasından keşfetmeye başla.</div>
        ) : (
          <div className={styles.grid}>
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
