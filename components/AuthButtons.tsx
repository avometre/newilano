'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { UserIcon } from './icons';
import styles from './AuthButtons.module.css';

export function AuthButtons() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [session?.user]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menuOpen]);

  if (status === 'loading') {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const guestView = (
    <>
      <div className={styles.authLinks}>
        <Link href="/giris" className={styles.login}>
          Giriş Yap
        </Link>
        <Link href="/kayit" className={styles.register}>
          Kaydol
        </Link>
      </div>
      <button
        type="button"
        className={styles.mobileTrigger}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <UserIcon width={18} height={18} />
      </button>
      {menuOpen ? (
        <div className={styles.mobileMenu}>
          <Link href="/giris" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Giriş Yap
          </Link>
          <Link href="/kayit" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Kaydol
          </Link>
        </div>
      ) : null}
    </>
  );

  if (!session?.user) {
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        {guestView}
      </div>
    );
  }

  const firstName = session.user.name?.split(' ')[0] ?? 'Kullanıcı';

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.loggedIn}>
        <span className={styles.greeting}>Merhaba, {firstName}</span>
        <button type="button" className={styles.logout} onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
        </button>
      </div>
      <button
        type="button"
        className={styles.mobileTrigger}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <UserIcon width={18} height={18} />
      </button>
      {menuOpen ? (
        <div className={styles.mobileMenu}>
          <span className={styles.mobileGreeting}>{firstName}</span>
          <button type="button" className={styles.mobileLink} onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
