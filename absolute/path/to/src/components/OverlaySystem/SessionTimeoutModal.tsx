export const SessionTimeoutModal = ({ secondsLeft }: {
  secondsLeft: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(secondsLeft);

  useInterval(() => {
    setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
  }, 1000);

  return (
    <Modal>
      <Modal.Header title="Sesja wygaśnie za" />
      <Modal.Content>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-mono">{timeLeft}</span>
          <span>sekund</span>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="gold" onClick={extendSession}>
          Kontynuuj pracę
        </Button>
      </Modal.Footer>
    </Modal>
  );
};