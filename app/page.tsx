import { CampaignSection } from '@/components/CampaignSection';
import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { ProductGridSection } from '@/components/ProductGridSection';
import styles from './page.module.css';
import { getCampaigns, getHeroSlides, getMostFavoritedProducts, getNewProducts, getTrendingProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [hype, featured, newest, campaignData, heroSlides] = await Promise.all([
    getMostFavoritedProducts(8),
    getTrendingProducts(8),
    getNewProducts(8),
    getCampaigns(3),
    getHeroSlides()
  ]);

  return (
    <main className={styles.main}>
      <HeroSection slides={heroSlides} />
      <ProductGridSection title="En Hype Ürünler" products={hype} viewAllHref="/vitrin?hype=true" />
      <ProductCarousel title="Öne Çıkan Ürünler" products={featured} viewAllHref="/vitrin?filter=featured" />
      <ProductCarousel title="En Yeni Ürünler" products={newest} viewAllHref="/vitrin?filter=new" />
      {campaignData.length > 0 ? <CampaignSection campaigns={campaignData} /> : null}
    </main>
  );
}
