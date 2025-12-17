export type KeySequence = string[];

export interface KeySequenceListenerOptions {
  /**
   * The sequence of keys to listen for (e.g., ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'])
   */
  sequence: KeySequence;
  
  /**
   * Callback function to execute when the sequence is matched
   */
  onMatch: () => void;
  
  /**
   * Callback function to execute on each successful key press in the sequence
   * @param currentIndex - Current position in the sequence (1-based)
   * @param totalLength - Total length of the sequence
   */
  onProgress?: (currentIndex: number, totalLength: number) => void;
  
  /**
   * Callback function to execute when a wrong key is pressed
   */
  onMismatch?: () => void;
  
  /**
   * Callback function to execute when the sequence times out
   */
  onTimeout?: () => void;
  
  /**
   * Time window in milliseconds for the sequence to be completed (default: 5000ms)
   */
  timeout?: number;
  
  /**
   * Whether to reset the sequence on any non-matching key (default: true)
   */
  resetOnMismatch?: boolean;
  
  /**
   * If true, automatically stop listening after the first successful match (default: false)
   */
  once?: boolean;
}

export class KeySequenceListener {
  private sequence: KeySequence;
  private onMatch: () => void;
  private onProgress?: (currentIndex: number, totalLength: number) => void;
  private onMismatch?: () => void;
  private onTimeout?: () => void;
  private timeout: number;
  private resetOnMismatch: boolean;
  private once: boolean;
  private currentIndex: number = 0;
  private timeoutId: number | null = null;
  private isListening: boolean = false;
  private boundHandler: (event: KeyboardEvent) => void;

  constructor(options: KeySequenceListenerOptions) {
    this.sequence = options.sequence;
    this.onMatch = options.onMatch;
    this.onProgress = options.onProgress;
    this.onMismatch = options.onMismatch;
    this.onTimeout = options.onTimeout;
    this.timeout = options.timeout ?? 5000;
    this.resetOnMismatch = options.resetOnMismatch ?? true;
    this.once = options.once ?? false;
    this.boundHandler = this.handleKeyPress.bind(this);
  }

  /**
   * Start listening for the keyboard sequence
   */
  start(): void {
    if (this.isListening) {
      return;
    }
    
    this.isListening = true;
    this.currentIndex = 0;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundHandler);
    }
  }

  /**
   * Stop listening for the keyboard sequence
   */
  stop(): void {
    if (!this.isListening) {
      return;
    }
    
    this.isListening = false;
    this.currentIndex = 0;
    this.clearTimeout();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundHandler);
    }
  }

  /**
   * Reset the current sequence progress
   */
  reset(): void {
    this.currentIndex = 0;
    this.clearTimeout();
  }

  /**
   * Get the current progress of the sequence (0 to sequence.length)
   */
  getProgress(): number {
    return this.currentIndex;
  }

  /**
   * Update the sequence to listen for
   */
  updateSequence(sequence: KeySequence): void {
    this.sequence = sequence;
    this.reset();
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const expectedKey = this.sequence[this.currentIndex];
    
    // Check if the pressed key matches the expected key in the sequence
    if (event.key === expectedKey || event.code === expectedKey) {
      this.currentIndex++;
      
      // Reset timeout on each correct key press
      this.clearTimeout();
      this.startTimeout();
      
      // Trigger progress callback
      if (this.onProgress) {
        this.onProgress(this.currentIndex, this.sequence.length);
      }
      
      // Check if sequence is complete
      if (this.currentIndex === this.sequence.length) {
        this.onMatch();
        this.reset();
        
        // If once mode is enabled, stop listening after first match
        if (this.once) {
          this.stop();
        }
      }
    } else {
      // Key doesn't match
      // Only process mismatch if we've already started the sequence (currentIndex > 0)
      if (this.currentIndex > 0 && this.resetOnMismatch) {
        // Trigger mismatch callback
        if (this.onMismatch) {
          this.onMismatch();
        }
        
        this.reset();
        
        // Check if the current key could be the start of the sequence
        if (event.key === this.sequence[0] || event.code === this.sequence[0]) {
          this.currentIndex = 1;
          this.startTimeout();
          
          // Trigger progress for the first key
          if (this.onProgress) {
            this.onProgress(1, this.sequence.length);
          }
        }
      }
      // If currentIndex is 0 and key doesn't match first key, do nothing (ignore the key)
    }
  }

  private startTimeout(): void {
    if (this.timeout > 0) {
      this.timeoutId = window.setTimeout(() => {
        // Trigger timeout callback before reset
        if (this.onTimeout && this.currentIndex > 0) {
          this.onTimeout();
        }
        this.reset();
      }, this.timeout);
    }
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Destroy the listener and clean up
   */
  destroy(): void {
    this.stop();
  }
}

/**
 * Utility function to create and start a keyboard sequence listener
 */
export function createKeySequenceListener(
  options: KeySequenceListenerOptions
): KeySequenceListener {
  const listener = new KeySequenceListener(options);
  listener.start();
  return listener;
}

// Export common key sequences
export const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export const KONAMI_CODE_WITH_ENTER = [...KONAMI_CODE, 'Enter'];
