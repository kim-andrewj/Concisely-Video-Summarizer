'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/common/Header/Header';
import highlightStyles from '@/components/summary_page/HighlightList/HighlightList.module.css';
import ViewTabs from '@/components/summary_page/ViewTabs/ViewTabs';
import SummarySection from '@/components/summary_page/SummarySection/SummarySection';

export default function SummaryPage() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'highlights' | 'actions'>('summary');

  const [summary, setSummary] = useState<null | {
    executiveSummary: string;
    actionItems: string[];
    transcript: string[];
    highlights: { timestamp: string; title: string; description: string }[];
  }>(null);

  const tabOptions = [
    { id: 'summary', label: 'Long-Form Summary' },
    { id: 'highlights', label: 'Topic Highlights' },
    { id: 'actions', label: 'Action Items' },
  ] as const;

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('summaryData');
      const videoPath = localStorage.getItem('videoUrl');

      if (videoPath) setVideoUrl(videoPath);

      if (stored) {
        const parsed = JSON.parse(stored);
        setSummary({
          executiveSummary: parsed.executiveSummary || '',
          actionItems: parsed.actionItems || [],
          transcript: parsed.transcript || [],
          highlights: parsed.highlights || []
        });
        localStorage.removeItem('summaryData');
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleTimestampClick = (timestamp: string) => {
    const video = document.getElementById('submitted-video') as HTMLVideoElement;
    if (!video) return;

    const parts = timestamp.split(':').map(Number);
    let seconds = 0;

    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }

    video.currentTime = seconds;
    video.play();
  };

  if (isLoading || !summary) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Loading summary...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.pageWrapper}>
        <div className={styles.leftColumn}>
          {videoUrl && (
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                padding: "1rem",
                marginBottom: "1.5rem",
                width: "100%",
                color: "#000000"
              }}
            >
              <video
                id="submitted-video"
                controls
                src={`http://localhost:8000${videoUrl}`} // full path
                style={{ width: '100%', borderRadius: '8px' }}
              />

            </div>
          )}

          <div style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "1.5rem",
            width: "100%",
            color: "#000000"
          }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ margin: 0 }}>Transcript Preview</h5>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowTranscript((prev) => !prev)}
              >
                {showTranscript ? "Hide" : "Show"}
              </button>
            </div>

            {showTranscript && (
              <div>
                <div className={highlightStyles.paragraph}>
                  {(summary.transcript || []).slice(0, 5).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                {(summary.transcript || []).length > 5 && (
                  <button
                    className={highlightStyles.toggleButton}
                    onClick={() => setShowFullTranscript(true)}
                  >
                    View Full Transcript
                  </button>
                )}
              </div>
            )}
          </div>

          {showFullTranscript && (
            <div
              className={highlightStyles.modalOverlay}
              onClick={() => setShowFullTranscript(false)}
            >
              <div
                className={highlightStyles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={highlightStyles.closeButton}
                  onClick={() => setShowFullTranscript(false)}
                >
                  &times;
                </button>
                <div className={highlightStyles.modalParagraph}>
                  {(summary.transcript || []).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.tabWrapper}>
            {tabOptions.map((tab) => (
              <ViewTabs
                key={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {activeTab === 'summary' && (
            <SummarySection value={summary.executiveSummary} />
          )}

          {activeTab === 'highlights' && (
            <div>
              {Array.isArray(summary.highlights) && summary.highlights.length > 0 ? (
                summary.highlights.map((highlight, idx) => (
                <div key={idx} style={{ marginBottom: "1.5rem" }}>
                  <h5>
                    <strong>“{highlight.title}”</strong> —{" "}
                    <em
                      style={{ color: "#2563eb", cursor: "pointer" }}
                      onClick={() => handleTimestampClick(highlight.timestamp)}
                    >
                      {highlight.timestamp}
                    </em>
                  </h5>
                  <p>{highlight.description}</p>
                </div>
              ))
              ) : (
                <p>No highlights detected.</p>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              {Array.isArray(summary.actionItems) && summary.actionItems.length > 0 ? (
                summary.actionItems.map((item, idx) => (
                  <p key={idx}>• {item}</p>
                ))
              ) : (
                <p>No action items detected.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}





/*
'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/common/Header/Header';
import UploadBox from '@/components/common/UploadBox/UploadBox';
import RoleInput from '@/components/common/RoleInput/RoleInput';
import FeatureSection from '@/components/common/FeatureSection/FeatureSection';
import AnalyzeButton from '@/components/common/AnalyzeButton/AnalyzeButton';
import SummarySection from '@/components/summary_page/SummarySection/SummarySection';
import HighlightList from '@/components/summary_page/HighlightList/HighlightList';
import ViewTabs from '@/components/summary_page/ViewTabs/ViewTabs';
import highlightStyles from '@/components/summary_page/HighlightList/HighlightList.module.css';

export default function SummaryPage() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [summary, setSummary] = useState<null | {
    executiveSummary: string;
    actionItems: string[];
    transcript: string[];
    highlights: { timestamp: string; title: string; description: string; }[];
  }>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'highlights' | 'actions'>('summary');

  const tabOptions = [
    { id: 'summary', label: 'Long-Form Summary' },
    { id: 'highlights', label: 'Topic Highlights' },
    { id: 'actions', label: 'Action Items' },
  ] as const;

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('summaryData');
      console.log("Summary data:", stored); // <-- LOG GOES HERE
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Parsed summary data:", parsed); // <-- LOG GOES HERE
        setSummary({
          executiveSummary: parsed.executiveSummary || '',
          actionItems: parsed.actionItems || [],
          transcript: parsed.transcript || [],
          highlights: parsed.highlights || []
        });
        localStorage.removeItem('summaryData');
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !summary) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Loading summary...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.pageWrapper}>
        <div className={styles.leftColumn}>
          <div style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "1.5rem",
            width: "100%",
            color: "#000000"
          }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ margin: 0 }}>Transcript Preview</h5>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowTranscript((prev) => !prev)}
              >
                {showTranscript ? "Hide" : "Show"}
              </button>
            </div>

            {showTranscript && (
              <div>
                <div className={highlightStyles.paragraph}>
                  {(summary.transcript || []).slice(0, 5).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                {(summary.transcript || []).length > 5 && (
                  <button
                    className={highlightStyles.toggleButton}
                    onClick={() => setShowFullTranscript(true)}
                  >
                    View Full Transcript
                  </button>
                )}
              </div>
            )}
          </div>

          {showFullTranscript && (
            <div
              className={highlightStyles.modalOverlay}
              onClick={() => setShowFullTranscript(false)}
            >
              <div
                className={highlightStyles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={highlightStyles.closeButton}
                  onClick={() => setShowFullTranscript(false)}
                >
                  &times;
                </button>
                <div className={highlightStyles.modalParagraph}>
                  {(summary.transcript || []).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.tabWrapper}>
            {tabOptions.map((tab) => (
              <ViewTabs
                key={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {activeTab === 'summary' && (
            <SummarySection value={summary.executiveSummary} />
          )}

          {activeTab === 'highlights' && (
            <div>
              {Array.isArray(summary.highlights) && summary.highlights.length > 0 ? (
                summary.highlights.map((highlight, idx) => (
                  <div key={idx}>
                    <h5>"{highlight.title}" — <em>{highlight.timestamp}</em></h5>
                    <p>{highlight.description}</p>
                  </div>
                ))
              ) : (
                <p>No highlights detected.</p>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              {Array.isArray(summary.actionItems) && summary.actionItems.length > 0 ? (
                summary.actionItems.map((item, idx) => (
                  <p key={idx}>• {item}</p>
                ))
              ) : (
                <p>No action items detected.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
*/

