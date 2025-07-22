'use client';
import styles from './AnalyzeButton.module.css';

interface AnalyzeButtonProps {
  videoFile: File | null;
  role: string;
  longForm: boolean;
  topicHighlights: boolean;
  actionItems: boolean;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

export default function AnalyzeButton({
  videoFile,
  role,
  longForm,
  topicHighlights,
  actionItems,
  isUploading,
  setIsUploading,
}: AnalyzeButtonProps) {
  const handleUpload = async () => {
    if (!videoFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('role', role);
    formData.append('longForm', String(longForm));
    formData.append('topicHighlights', String(topicHighlights));
    formData.append('actionItems', String(actionItems));

    try {
      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      localStorage.setItem('summaryData', JSON.stringify(data));
      window.location.href = '/summary';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <button
      onClick={handleUpload}
      disabled={!videoFile || isUploading}
      className={styles.analyzeButton}
    >
      {isUploading ? 'Uploading...' : 'Analyze Video'}
    </button>
  );
}




/*

'use client';
import styles from './AnalyzeButton.module.css';

interface AnalyzeButtonProps {
  videoFile: File | null;
  role: string;
  longForm: boolean;
  topicHighlights: boolean;
  actionItems: boolean;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

export default function AnalyzeButton({
  videoFile,
  role,
  longForm,
  topicHighlights,
  actionItems,
  isUploading,
  setIsUploading,
}: AnalyzeButtonProps) {
  const handleUpload = async () => {
    if (!videoFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('role', role);
    formData.append('features', JSON.stringify({ longForm, topicHighlights, actionItems }));

    try {
      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      localStorage.setItem('summaryData', JSON.stringify(data));
      window.location.href = '/summary';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <button
      onClick={handleUpload}
      disabled={!videoFile || isUploading}
      className={styles.analyzeButton}
    >
      {isUploading ? 'Uploading...' : 'Analyze Video'}
    </button>
  );
}


*/