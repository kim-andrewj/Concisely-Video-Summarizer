'use client';
import styles from './FeatureSection.module.css';

interface Feature {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

interface FeatureSectionProps {
  features: Feature[];
}


export default function FeatureSection({ features }: { features: { id: string; label: string; description: string }[] }) {
  return (
    <div className={styles.featureSection}>
      <h3 className={styles.title}>Features Provided:</h3>
      <ul className={styles.featureList}>
        {features.map((feature) => (
          <li key={feature.id} className={styles.featureItem}>
            <strong>{feature.label}</strong>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}