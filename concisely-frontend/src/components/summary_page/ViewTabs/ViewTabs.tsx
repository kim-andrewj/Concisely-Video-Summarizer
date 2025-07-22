'use client';
import styles from './ViewTabs.module.css';

interface ViewTabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ViewTabButton({ label, isActive, onClick }: ViewTabButtonProps) {
  return (
    <button
      className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}