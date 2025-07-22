// components/Header.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/">
          <Image
            src="/assets/logo.png"
            alt="Concisely Logo"
            width={40}
            height={40}
            className={styles.logo}
          />
        </Link>
      </div>
      <div className={styles.right}>
        <nav className={styles.nav}>
          <Link href="#">Resources</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Link</Link>
        </nav>
        <div className={styles.actions}>
          <button className={styles.signIn}>Sign in</button>
          <button className={styles.register}>Register</button>
        </div>
      </div>
    </header>
  );
}