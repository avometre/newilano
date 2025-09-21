'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrandSummary } from '@/lib/data';
import styles from './page.module.css';

type Props = {
  brands: BrandSummary[];
  product?: {
    id: string;
    name: string;
    brandId: string;
    category: string;
    priceValue: number;
    currency: string;
    image: string;
    description: string;
    gallery: string[];
    sizes: string[];
    colors: string[];
    features: string[];
    productUrl?: string;
  };
};

function parseList(input: FormDataEntryValue | null | string) {
  if (!input) return [] as string[];
  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function AdminProductForm({ brands, product }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(product?.image ?? null);
  const [imageName, setImageName] = useState<string | null>(product ? 'Mevcut görsel' : null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [galleryData, setGalleryData] = useState<string[]>(product?.gallery ?? []);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const sortedBrands = useMemo(() => brands.slice().sort((a, b) => a.name.localeCompare(b.name)), [brands]);

  const [name, setName] = useState(product?.name ?? '');
  const [brandId, setBrandId] = useState(product?.brandId ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.priceValue?.toString() ?? '');
  const [currency, setCurrency] = useState(product?.currency ?? 'TRY');
  const [description, setDescription] = useState(product?.description ?? '');
  const [sizes, setSizes] = useState(product?.sizes.join(', ') ?? '');
  const [colors, setColors] = useState(product?.colors.join(', ') ?? '');
  const [features, setFeatures] = useState(product?.features.join(', ') ?? '');
  const [productUrl, setProductUrl] = useState(product?.productUrl ?? '');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrandId(product.brandId);
      setCategory(product.category);
      setPrice(product.priceValue.toString());
      setCurrency(product.currency);
      setDescription(product.description);
      setSizes(product.sizes.join(', '));
      setColors(product.colors.join(', '));
      setFeatures(product.features.join(', '));
      setImageData(product.image);
      setImageName('Mevcut görsel');
      setGalleryData(product.gallery ?? []);
      setProductUrl(product.productUrl ?? '');
    }
  }, [product]);

  useEffect(() => {
    if (!product && !brandId && sortedBrands.length > 0) {
      setBrandId(sortedBrands[0].id);
    }
  }, [product, brandId, sortedBrands]);

  const isEditMode = Boolean(product);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageData(null);
      setImageName(null);
      setImageError(null);
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setImageError('Ürün görseli 4MB sınırını aşmamalı.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImageData(result);
        setImageName(file.name);
        setImageError(null);
      }
    };
    reader.onerror = () => {
      setImageError('Görsel okunamadı.');
      setImageData(null);
      setImageName(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGallerySelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setGalleryData([]);
      setGalleryError(null);
      return;
    }

    const maxFiles = 6;
    if (files.length > maxFiles) {
      setGalleryError(`En fazla ${maxFiles} galeri görseli yükleyebilirsiniz.`);
      event.target.value = '';
      return;
    }

    const readers: Promise<string>[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 4 * 1024 * 1024) {
        readers.length = 0;
        setGalleryError('Her galeri görseli 4MB sınırını aşmamalı.');
        event.target.value = '';
        return;
      }

      readers.push(
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Geçersiz sonuç'));
          };
          reader.onerror = () => reject(reader.error ?? new Error('Görsel okunamadı.'));
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers)
      .then((images) => {
        setGalleryData(images);
        setGalleryError(null);
      })
      .catch(() => {
        setGalleryError('Galeri görselleri yüklenemedi.');
        setGalleryData([]);
        if (galleryInputRef.current) {
          galleryInputRef.current.value = '';
        }
      });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const priceValue = Number(price.replace(',', '.'));
    const image = imageData;
    const nameValue = name.trim();
    const categoryValue = category.trim();
    const descriptionValue = description.trim();
    const brandValue = brandId;
    const normalizedProductUrlValue = normalizeProductUrl(productUrl);

    if (normalizedProductUrlValue !== productUrl) {
      setProductUrl(normalizedProductUrlValue);
    }

    if (!nameValue || !brandValue || !categoryValue || !image || !descriptionValue) {
      setMessage('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setMessage('Geçerli bir fiyat girin.');
      return;
    }

    if (galleryError) {
      setMessage(galleryError);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const endpoint = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameValue,
          brandId: brandValue,
          category: categoryValue,
          price: priceValue,
          currency,
          imageData: image,
          description: descriptionValue,
          galleryData,
          sizes: parseList(sizes),
          colors: parseList(colors),
          features: parseList(features),
          productUrl: normalizedProductUrlValue
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.message ?? 'Ürün oluşturulamadı.');
        return;
      }

      if (product) {
        setMessage('Ürün güncellendi.');
        router.refresh();
        router.push('/admin');
      } else {
        event.currentTarget.reset();
        setName('');
        setBrandId(sortedBrands[0]?.id ?? '');
        setCategory('');
        setPrice('');
        setCurrency('TRY');
        setDescription('');
        setSizes('');
        setColors('');
        setFeatures('');
        setProductUrl('');
        setImageData(null);
        setImageName(null);
        setImageError(null);
        setGalleryData([]);
        setGalleryError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (galleryInputRef.current) {
          galleryInputRef.current.value = '';
        }
        setMessage('Ürün başarıyla eklendi.');
        router.refresh();
      }
    } catch (error) {
      console.error('Product create error', error);
      setMessage('Ürün oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <label>
        Ürün Adı
        <input
          name="name"
          type="text"
          placeholder="Ürün adı"
          required
          disabled={submitting}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Marka
        <select
          name="brandId"
          required
          disabled={submitting || sortedBrands.length === 0}
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
        >
          <option value="" disabled>
            Marka seçin
          </option>
          {sortedBrands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Kategori
        <input
          name="category"
          type="text"
          placeholder="Sneaker"
          required
        disabled={submitting}
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
    </label>
      <label className={styles.adminFormInline}>
        <span>
          Fiyat
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="5499"
            required
            disabled={submitting}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </span>
        <span>
          Para Birimi
          <input
            name="currency"
            type="text"
            disabled={submitting}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          />
        </span>
      </label>
      <label>
        Ürün Linki
        <input
          name="productUrl"
          type="url"
          placeholder="https://marka.com/urun"
          disabled={submitting}
          value={productUrl}
          onChange={(event) => setProductUrl(event.target.value)}
        />
      </label>
      <label>
        Ürün Görseli
        <div className={styles.uploadField}>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            Görsel Seç
          </button>
          <span className={styles.uploadText}>
            {imageName ? imageName : 'Önerilen boyut: 1200x1200, şeffaf PNG/SVG, max 4MB.'}
          </span>
          <input
            ref={fileInputRef}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={submitting}
          />
        </div>
      </label>
      {imageError ? <p className={styles.adminFormMessage}>{imageError}</p> : null}
      {imageData ? (
        <div className={styles.previewBox}>
          <img src={imageData} alt="Ürün önizleme" />
        </div>
      ) : null}
      <label>
        Galeri Görselleri
        <div className={styles.uploadField}>
          <button
            type="button"
            className={styles.uploadButtonSecondary}
            onClick={() => galleryInputRef.current?.click()}
            disabled={submitting}
          >
            Galeri Görseli Ekle
          </button>
          <span className={styles.uploadText}>
            {galleryData.length > 0
              ? `${galleryData.length} görsel seçildi`
              : 'Opsiyonel. En fazla 6 görsel, maksimum 4MB.'}
          </span>
          <input
            ref={galleryInputRef}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGallerySelect}
            disabled={submitting}
          />
        </div>
      </label>
      {galleryError ? <p className={styles.adminFormMessage}>{galleryError}</p> : null}
      {galleryData.length > 0 ? (
        <div className={styles.previewGrid}>
          {galleryData.map((image, index) => (
            <div key={index} className={styles.previewThumb}>
              <img src={image} alt={`Galeri görseli ${index + 1}`} />
            </div>
          ))}
        </div>
      ) : null}
      <label>
        Açıklama
        <textarea
          name="description"
          rows={4}
          placeholder="Ürün açıklaması"
          required
          disabled={submitting}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label>
        Bedenler (virgülle ayır)
        <input
          name="sizes"
          type="text"
          placeholder="40, 41, 42"
          disabled={submitting}
          value={sizes}
          onChange={(event) => setSizes(event.target.value)}
        />
      </label>
      <label>
        Renkler (virgülle ayır)
        <input
          name="colors"
          type="text"
          placeholder="Beyaz, Siyah"
          disabled={submitting}
          value={colors}
          onChange={(event) => setColors(event.target.value)}
        />
      </label>
      <label>
        Öne çıkan özellikler (virgülle ayır)
        <input
          name="features"
          type="text"
          placeholder="Air-Sole, Premium deri"
          disabled={submitting}
          value={features}
          onChange={(event) => setFeatures(event.target.value)}
        />
      </label>
      <button type="submit" disabled={submitting || sortedBrands.length === 0}>
        {submitting ? 'Kaydediliyor…' : 'Ürünü Kaydet'}
      </button>
      {sortedBrands.length === 0 ? <p className={styles.adminFormMessage}>Önce bir marka ekleyin.</p> : null}
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
