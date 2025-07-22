'use client';
import { useState } from 'react';
import styles from './HighlightList.module.css';

interface HighLightListProps {
  value: string[];
}

export default function HighlightList({ value }: HighLightListProps) {
  const [showModal, setShowModal] = useState(false);

  const previewLimit = 15;
  const displayedLines = value.slice(0, previewLimit);

  return (
    <>
      <div className={styles.heading}>Transcript</div>
      <section className={styles.section}>
        <div className={styles.paragraph}>
          {displayedLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {value.length > previewLimit && (
          <button className={styles.toggleButton} onClick={() => setShowModal(true)}>
            View Full Transcript
          </button>
        )}
      </section>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowModal(false)}>
              &times;
            </button>
            <div className={styles.modalParagraph}>
              {value.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}