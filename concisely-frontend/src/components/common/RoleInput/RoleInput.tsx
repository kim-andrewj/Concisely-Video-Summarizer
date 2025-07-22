// components/main_page/RoleInput/RoleInput.tsx
'use client';
import { useState } from 'react';
import styles from './RoleInput.module.css';

interface RoleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleInput({ value, onChange }: RoleInputProps) {
  return (
    <div className={styles.wrapper}>
    <label className={styles.labelRow}>
      <span className={styles.label}>Your Role (for context-specific summarization)</span>
      <span className={styles.tooltipWrapper}>
        <span className={styles.tooltipIcon}>ⓘ</span>
        <span className={styles.tooltipBox}>
          This is an optional field to tailor your submitted video to a perspective pertaining to your role. For example, 
          type "HR Manager" for a business meeting to receive specialized action items for an HR Manager.
        </span>
      </span>
    </label>

    <input
      type="text"
      placeholder="Role"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.input}
    />
  </div>

  );
}