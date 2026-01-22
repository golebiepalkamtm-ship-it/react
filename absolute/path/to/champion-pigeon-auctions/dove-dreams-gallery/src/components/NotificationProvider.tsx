interface NotificationState {
  queue: Array<{
    id: string;
    type: 'success' | 'error' | 'warning';
    content: ReactNode;
    priority: number;
  }>;
  current: string | null;
}

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
}>(/* ... */);

function notificationReducer(state: NotificationState, action: NotificationAction) {
  // ... existing code ...
  case 'ENQUEUE': {
    const sortedQueue = [...state.queue, action.payload]
      .sort((a, b) => b.priority - a.priority);
    return {
      ...state,
      queue: sortedQueue,
      current: state.current || sortedQueue[0]?.id
    };
  }
  // ... existing code ...
}