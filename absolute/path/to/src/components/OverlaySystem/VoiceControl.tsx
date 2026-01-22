const VoiceCommandHandler = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'pl-PL';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    if (transcript.includes('zamknij wszystkie modale')) {
      closeAllModals();
    }
  };

  return (
    <button 
      className="voice-control-btn"
      onClick={() => recognition.start()}
    >
      🎤 Tryb głosowy
    </button>
  );
};