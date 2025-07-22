'use client';
import styles from './SummarySection.module.css';

interface SummaryPageProps {
  value: string;
}

export default function SummarySection({value}: SummaryPageProps) {
  return (
    <>
      <div className={styles.heading}>Long Form Summary</div>
      <section className={styles.section}>
        <p className={styles.paragraph}>
            {value}
        </p>
      </section>
    </>
  );
}