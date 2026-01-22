export const useModalAnalytics = (modalId: string) => {
  useEffect(() => {
    const eventHandler = (event: CustomEvent) => {
      sendAnalyticsEvent({
        type: 'modal_interaction',
        modalId,
        action: event.detail.type,
        timestamp: Date.now()
      });
    };

    window.addEventListener('modal_interaction', eventHandler);
    return () => window.removeEventListener('modal_interaction', eventHandler);
  }, [modalId]);
};