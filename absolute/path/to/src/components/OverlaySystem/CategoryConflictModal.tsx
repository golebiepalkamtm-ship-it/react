export const CategoryConflictModal = ({ conflicts }: {
  conflicts: string[];
}) => {
  const [selected, setSelected] = useState<string>('');

  return (
    <Modal>
      <Modal.Header title="Rozwiąż konflikt kategorii" />
      <Modal.Content>
        <div className="grid grid-cols-2 gap-4">
          {conflicts.map(category => (
            <button
              key={category}
              className={`p-4 border-2 ${selected === category ? 
                'border-auction-gold' : 'border-gray-200'}`}
              onClick={() => setSelected(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="gold">Potwierdź wybór</Button>
      </Modal.Footer>
    </Modal>
  );
};