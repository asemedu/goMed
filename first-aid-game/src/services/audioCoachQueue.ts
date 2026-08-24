export class AudioCoachQueue {
  private queue: string[] = [];
  private isSpeaking = false;
  private lastMessageTime: Record<string, number> = {};
  
  /**
   * Speak a message to the user.
   * @param message The text to speak
   * @param priority If true, interrupts current speech immediately
   * @param throttleMs Minimum time (ms) before repeating this specific message
   */
  speak(message: string, priority: boolean = false, throttleMs: number = 4000) {
    if (!('speechSynthesis' in window)) return;
    
    const now = Date.now();
    const lastSpoken = this.lastMessageTime[message] || 0;

    // Throttle exact duplicate messages to avoid spamming the user
    if (!priority && now - lastSpoken < throttleMs) {
      return;
    }

    if (priority) {
      window.speechSynthesis.cancel(); // Interrupt current
      this.queue = []; // Clear queue
    } else if (this.queue.includes(message)) {
      // Don't queue duplicates if already in queue
      return;
    }
    
    this.queue.push(message);
    this.processQueue();
  }

  private processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;
    
    this.isSpeaking = true;
    const message = this.queue.shift()!;
    this.lastMessageTime[message] = Date.now();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.1; // Slightly faster for coaching
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.processQueue();
    };
    
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processQueue();
    };
    
    window.speechSynthesis.speak(utterance);
  }

  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.isSpeaking = false;
  }
}

export const audioCoach = new AudioCoachQueue();
