/**
 * Service to manage the Screen Wake Lock API.
 * Keeps the device screen awake during hands-free CPR practice.
 */
class WakeLockManager {
  private wakeLock: any = null; // any to avoid strict TS DOM issues on older TS versions, WakeLockSentinel typically
  private isSupported: boolean = false;
  private visibilityListenerAdded: boolean = false;

  constructor() {
    this.isSupported = 'wakeLock' in navigator;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * Request a screen wake lock.
   */
  async requestWakeLock() {
    if (!this.isSupported) {
      console.warn('Wake Lock API not supported in this browser.');
      return;
    }

    try {
      // @ts-ignore - navigator.wakeLock might not be in the default TS DOM lib depending on version
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock acquired.');

      this.wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released.');
      });

      // Automatically re-acquire if visibility changes (e.g., app backgrounded then foregrounded)
      if (!this.visibilityListenerAdded) {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.visibilityListenerAdded = true;
      }
    } catch (err: any) {
      console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
    }
  }

  /**
   * Release the wake lock manually when the session ends.
   */
  async releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    }

    if (this.visibilityListenerAdded) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.visibilityListenerAdded = false;
    }
  }

  private handleVisibilityChange() {
    if (this.wakeLock !== null && document.visibilityState === 'visible') {
      console.log('App returned to foreground, re-acquiring wake lock...');
      this.requestWakeLock();
    }
  }
}

export const wakeLockManager = new WakeLockManager();
