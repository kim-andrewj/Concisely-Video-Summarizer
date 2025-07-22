'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/common/Header/Header';
import HeroSection from '@/components/main_page/HeroSection/HeroSection';
import UploadBox from '@/components/common/UploadBox/UploadBox';
import RoleInput from '@/components/common/RoleInput/RoleInput';
import FeatureSection from '@/components/common/FeatureSection/FeatureSection';
import AnalyzeButton from '@/components/common/AnalyzeButton/AnalyzeButton';

export default function UploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [role, setRole] = useState('');
  const [longForm, setLongForm] = useState(true);
  const [topicHighlights, setTopicHighlights] = useState(true);
  const [actionItems, setActionItems] = useState(true);

  const features = [
    {
      id: 'longform',
      label: 'Long-Form Summarize',
      description: 'Transcribe and convert audio from the uploaded video into a succinct, thoughtfully packed summary with attention to context and objectives.',
      longForm,
      setLongForm
    },
    {
      id: 'highlights',
      label: 'Topic Highlights',
      description: 'Mark significant sections of the video to showcase changes in subject and important details within each subject, all supported by timestamp references.',
      topicHighlights,
      setTopicHighlights
    },
    {
      id: 'actions',
      label: 'Action Items',
      description: 'Generate an AI-powered list of to-do items based off of prompting cues, with an emphasis on empowering user activity.',
      actionItems,
      setActionItems
    },
  ];

  return (
    <>
      <Header /> 
      <div className={styles.pageWrapper}>
        <div className={styles.leftColumn}>
          <HeroSection />
        </div>

        <div className={styles.rightColumn}>
          <UploadBox value={videoFile} onChange={setVideoFile}/>
          <RoleInput value={role} onChange={setRole} />

          <FeatureSection features={features} />

          <AnalyzeButton
            videoFile={videoFile}
            role={role}
            longForm={longForm}
            topicHighlights={topicHighlights}
            actionItems={actionItems}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>
      </div>
    </>
  );
}

