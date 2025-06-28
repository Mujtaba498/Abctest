'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  imageUrl?: string;
  priority?: boolean;
}

export function ImagePreloader({ imageUrl, priority = true }: ImagePreloaderProps) {
  useEffect(() => {
    if (!imageUrl || !priority) return;

    // Create a link element to preload the image
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.fetchPriority = 'high';
    
    // Add to head
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [imageUrl, priority]);

  return null; // This component doesn't render anything
} 