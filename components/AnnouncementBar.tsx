import styles from './AnnouncementBar.module.css';

export function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <span>3000 TL ve üzeri alışverişlerinizde kargo ücretsiz!</span>
    </div>
  );
}
