'use client'
import styles from './UploadBox.module.css';
import { UploadIcon } from '@radix-ui/react-icons';

interface UploadBoxProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function UploadBox({value, onChange}: UploadBoxProps) {

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }

    onChange(file); // still inform parent component

    // Upload to backend
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("http://localhost:8000/upload-video/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      // const videoUrl = data.videoUrl;
      console.log("videoUrl from backend:", data.videoUrl);
      localStorage.setItem("videoUrl", data.videoUrl);
      console.log("videoUrl saved to localStorage:", localStorage.getItem("videoUrl"));

      

    } catch (err) {
      console.error("Failed to upload video:", err);
      alert("Video upload failed.");
    }
  };



  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.label}>Upload Video Here</span>
        <span className={styles.tooltipIcon}>ⓘ</span>
      </div>
      <label htmlFor="video-upload" className={styles.uploadBox}>
        <UploadIcon className={styles.icon} />
        <p className={styles.formatText}>Supported formats: .mov, .mp4, .mkv</p>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>

      {value && (
        <p className={styles.fileName}>
          Selected: <strong>{value.name}</strong>
        </p>
      )}
    </div>
  );
}