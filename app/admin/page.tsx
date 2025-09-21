import { redirect } from 'next/navigation';
import styles from './page.module.css';
import { auth } from '@/lib/auth';
import {
  getAllProducts,
  getBrands,
  getCampaigns,
  getHeroSlides,
  getMostFavoritedProducts,
  getNewProducts,
  getTrendingProducts
} from '@/lib/data';
import { AdminBrandForm } from './BrandForm';
import { AdminProductForm } from './ProductForm';
import { AdminBrandList } from './BrandList';
import { AdminCampaignForm } from './CampaignForm';
import { AdminCampaignList } from './CampaignList';
import { AdminHeroForm } from './HeroForm';
import { AdminHeroList } from './HeroList';
import { AdminProductList } from './ProductList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Paneli | Newilano'
};

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect(`/giris?callbackUrl=${encodeURIComponent('/admin')}`);
  }

  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  const [allProducts, hypeProducts, trendingProducts, newestProducts, brands, campaignData, heroSlides] = await Promise.all([
    getAllProducts(),
    getMostFavoritedProducts(6),
    getTrendingProducts(6),
    getNewProducts(6),
    getBrands(),
    getCampaigns(),
    getHeroSlides({ includeDefaults: false })
  ]);

  const totalProducts = allProducts.length;
  const hypeCount = hypeProducts.length;
  const newCollectionCount = newestProducts.length;
  const uniqueBrands = new Set(allProducts.map((product) => product.brandId || product.brand)).size;
  const uniqueCategories = new Set(allProducts.map((product) => product.category)).size;

  const highlightedCampaigns = campaignData.slice(0, 3);
  const brandStats = brands.map((brand) => ({
    ...brand,
    productCount: allProducts.filter((product) => product.brandId === brand.id).length
  }));

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' });
  const campaignsWithMeta = campaignData.map((campaign) => ({
    ...campaign,
    createdLabel: campaign.createdAt ? dateFormatter.format(new Date(campaign.createdAt)) : 'Tarih yok'
  }));

  const productList = allProducts.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    image: product.image,
    slug: product.slug
  }));

  const heroList = heroSlides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref
  }));

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div>
              <span className={styles.heroEyebrow}>Hoş geldin, {session.user?.name?.split(' ')[0] ?? 'Admin'}</span>
              <h1>Newilano Yönetim Paneli</h1>
              <p>
                Stok trendlerini, kampanya performansını ve vitrin hareketlerini tek ekrandan takip edin. Bu panel
                yalnızca yönetici hesapları tarafından görüntülenebilir.
              </p>
            </div>
            <div className={styles.heroStats}>
              <div>
                <span>Aktif Ürün</span>
                <strong>{totalProducts}</strong>
              </div>
              <div>
                <span>Marka</span>
                <strong>{uniqueBrands}</strong>
              </div>
              <div>
                <span>Kategori</span>
                <strong>{uniqueCategories}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className={styles.metricSection}>
          <div className={styles.metricCard}>
            <div>
              <h2>Hype Koleksiyonu</h2>
              <p>Premium talep gören ürünleriniz. Stok planlarını haftalık olarak gözden geçirin.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{hypeCount}</span>
              <small>ürün</small>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div>
              <h2>Yeni Sezon</h2>
              <p>Son eklenen ürünler. Vitrindeki yenilikleri öne çıkarmayı unutmayın.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{newCollectionCount}</span>
              <small>ürün</small>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div>
              <h2>Kampanyalar</h2>
              <p>Takipte olan kampanya sayısı. Performans notlarını güncel tutun.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{highlightedCampaigns.length}</span>
              <small>aktif</small>
            </div>
          </div>
        </section>

        <section className={styles.formGrid}>
          <div className={styles.panelTall}>
            <h3>Marka Ekle</h3>
            <AdminBrandForm />
          </div>
          <div className={styles.panelTall}>
            <h3>Ürün Ekle</h3>
            <AdminProductForm brands={brands} />
          </div>
          <div className={styles.panelTall}>
            <h3>Kampanya Ekle</h3>
            <AdminCampaignForm />
          </div>
          <div className={styles.panelTall}>
            <h3>Hero Görseli Ekle</h3>
            <AdminHeroForm />
          </div>
        </section>

        <div className={styles.managementStack}>
          <section className={styles.panelWide}>
            <h3>Markaları Yönet</h3>
            <AdminBrandList brands={brandStats} />
          </section>
          <section className={styles.panelWide}>
            <h3>Ürünleri Yönet</h3>
            <AdminProductList products={productList} />
          </section>
          <section className={styles.panelWide}>
            <h3>Hero Görselleri</h3>
            <AdminHeroList slides={heroList} />
          </section>
          <section className={styles.panelWide}>
            <h3>Kampanyaları Yönet</h3>
            <AdminCampaignList campaigns={campaignsWithMeta} />
          </section>
        </div>
      </div>
    </main>
  );
}
