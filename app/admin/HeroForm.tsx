'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function AdminHeroForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageData(null);
      setImageName(null);
      setImageError(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Hero görseli 5MB sınırını aşmamalı.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageData(reader.result);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = (formData.get('title') as string)?.trim();
    const subtitle = (formData.get('subtitle') as string)?.trim();
    const ctaLabel = (formData.get('ctaLabel') as string)?.trim();
    const ctaHref = (formData.get('ctaHref') as string)?.trim();
    const order = Number((formData.get('order') as string) ?? 0);

    if (!title || !subtitle || !ctaLabel || !ctaHref) {
      setMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!imageData) {
      setMessage('Lütfen bir görsel yükleyin.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, ctaLabel, ctaHref, imageData, order })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.message ?? 'Hero görseli oluşturulamadı.');
        return;
      }

      event.currentTarget.reset();
      setImageData(null);
      setImageName(null);
      setImageError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setMessage('Hero görseli eklendi.');
      router.refresh();
    } catch (error) {
      console.error('Hero create error', error);
      setMessage('Hero görseli oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <label>
        Başlık
        <input name="title" type="text" placeholder="Hero başlığı" required disabled={submitting} />
      </label>
      <label>
        Alt Başlık
        <textarea name="subtitle" rows={3} placeholder="Kısa açıklama" required disabled={submitting} />
      </label>
      <label className={styles.adminFormInline}>
        <span>
          CTA Metni
          <input name="ctaLabel" type="text" placeholder="Koleksiyonu Keşfet" required disabled={submitting} />
        </span>
        <span>
          CTA Linki
          <input name="ctaHref" type="url" placeholder="/vitrin" defaultValue="/vitrin" required disabled={submitting} />
        </span>
      </label>
      <label>
        Sıra (küçük sayı en önde)
        <input name="order" type="number" min="0" defaultValue="0" disabled={submitting} />
      </label>
      <label>
        Hero Görseli
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
            {imageName ? imageName : 'Önerilen: 1920x1080 JPG/PNG, maksimum 5MB.'}
          </span>
          <input
            ref={fileInputRef}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={submitting}
          />
        </div>
      </label>
      {imageError ? <p className={styles.adminFormMessage}>{imageError}</p> : null}
      {imageData ? (
        <div className={styles.previewBox}>
          <img src={imageData} alt="Hero görseli" />
        </div>
      ) : null}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Hero Görselini Kaydet'}
      </button>
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
