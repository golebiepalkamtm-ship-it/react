import React, { useEffect, useRef } from 'react';

const RCE = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Load RCE in iframe
    if (iframeRef.current) {
      iframeRef.current.src = '/rce/index.html';
    }
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="RCE"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default RCE;
