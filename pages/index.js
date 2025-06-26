import { useState, useEffect } from 'react';
import { getGitHubIssues, getRandomIssue } from '../lib/github';
import config from '../config/app.config';

export default function Home({ initialIssue }) {
  const [currentIssue, setCurrentIssue] = useState(initialIssue);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (currentIssue && currentIssue.bodyText) {
      navigator.clipboard.writeText(currentIssue.bodyText)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // 2秒后重置复制状态
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const refreshIssue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/refresh-issue");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newIssue = await response.json();
      setCurrentIssue(newIssue);
    } catch (error) {
      console.error("Failed to fetch new issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentIssue) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>加载中或没有可用的 Issue...</h1>
        <p>请检查您的 GitHub Token、仓库名和标签是否正确，或者该标签下没有 Issue。</p>
        <button onClick={refreshIssue} disabled={isLoading}>
          {isLoading ? '刷新中...' : '尝试刷新'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '15px', color: '#333' }}>{currentIssue.title}</h1>
      <div 
        style={{ lineHeight: '1.6', color: '#555', borderTop: '1px solid #eee', paddingTop: '20px', whiteSpace: 'pre-wrap' }}
      >
        {currentIssue.bodyText}
      </div>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#777' }}>
        <a href={currentIssue.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
          查看原始 Issue #{currentIssue.number}
        </a>
      </p>
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={refreshIssue} 
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '1em', 
            cursor: 'pointer', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            transition: 'background-color 0.3s ease',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? '加载中...' : '换一条'}
        </button>
        <button 
          onClick={copyToClipboard}
          style={{ 
            padding: '10px 20px', 
            fontSize: '1em', 
            cursor: 'pointer', 
            backgroundColor: isCopied ? '#28a745' : '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            transition: 'background-color 0.3s ease'
          }}
        >
          {isCopied ? '已复制!' : '复制文案'}
        </button>
        <button 
          onClick={() => location.reload()}
          style={{ 
            padding: '10px 20px', 
            fontSize: '1em', 
            cursor: 'pointer', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            transition: 'background-color 0.3s ease'
          }}
        >
          整页刷新
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const issues = await getGitHubIssues(config.issues.defaultLabels);
  // console.log("Issues fetched in getServerSideProps:", issues); // 移除此行
  const initialIssue = getRandomIssue(issues);

  return {
    props: {
      initialIssue,
    },
  };
}