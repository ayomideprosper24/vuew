export interface QueuedAction {
  id: string;
  type: 'PROGRESS_UPDATE' | 'ADD_COMMENT' | 'STATUS_CHANGE';
  payload: Record<string, unknown>;
  userId: string;
  createdAt: string;
  retries: number;
}

const OFFLINE_QUEUE_KEY = 'vuew_offline_actions_queue_v1';

class OfflineQueueService {
  private queue: QueuedAction[] = [];
  private isProcessing = false;
  private listeners: ((queue: QueuedAction[]) => void)[] = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse offline actions queue:', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline actions queue:', e);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getPendingActions(): QueuedAction[] {
    return [...this.queue];
  }

  public enqueueAction(
    type: QueuedAction['type'],
    payload: Record<string, unknown>,
    userId: string
  ): QueuedAction {
    const action: QueuedAction = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      userId,
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    // Deduplication check: if identical payload & type already pending within last 3 seconds
    const isDuplicate = this.queue.some(
      (item) =>
        item.type === type &&
        item.userId === userId &&
        JSON.stringify(item.payload) === JSON.stringify(payload)
    );

    if (!isDuplicate) {
      this.queue.push(action);
      this.saveQueue();
    }

    return action;
  }

  public async processQueue(onActionProcessed?: (action: QueuedAction) => void): Promise<number> {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return 0;
    }

    this.isProcessing = true;
    let processedCount = 0;
    const remaining: QueuedAction[] = [];

    for (const item of this.queue) {
      try {
        if (onActionProcessed) {
          onActionProcessed(item);
        }
        processedCount++;
      } catch (err) {
        console.error('Failed to sync offline item:', item, err);
        item.retries += 1;
        if (item.retries < 3) {
          remaining.push(item);
        }
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.isProcessing = false;
    return processedCount;
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  public subscribe(listener: (queue: QueuedAction[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.queue);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.queue);
    }
  }
}

export const offlineQueue = new OfflineQueueService();
