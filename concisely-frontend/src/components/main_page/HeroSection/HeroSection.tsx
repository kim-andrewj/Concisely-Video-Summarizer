'use client';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        Welcome to <img src="/assets/concisely.png" alt="Concisely" className={styles.logo} />
      </h1>
      <h2 className={styles.subtitle}>Online Summarizer Tool</h2>
      <p className={styles.description}>
        Instantly summarize any long form video with our AI-powered text summarizer.
        Transform long content into concise summaries with just one click while preserving key information and main ideas.
      </p>
    </section>
  );
}