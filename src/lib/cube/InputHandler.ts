import type { InputConfig, RollDirection } from './types.js';

export class InputHandler {
  private config: InputConfig;
  private onMoveCallback: ((direction: RollDirection) => void) | null = null;
  private onResetCallback: (() => void) | null = null;
  private isEnabled = true;

  constructor(config?: Partial<InputConfig>) {
    this.config = {
      keyMap: {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ...config?.keyMap
      }
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const direction = this.config.keyMap[event.key];
    if (direction && this.onMoveCallback) {
      event.preventDefault();
      this.onMoveCallback(direction);
    }

    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      if (this.onResetCallback) {
        this.onResetCallback();
      }
    }
  }

  onMove(callback: (direction: RollDirection) => void): void {
    this.onMoveCallback = callback;
  }

  onReset(callback: () => void): void {
    this.onResetCallback = callback;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  updateKeyMap(newKeyMap: Record<string, RollDirection>): void {
    this.config.keyMap = { ...this.config.keyMap, ...newKeyMap };
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.onMoveCallback = null;
    this.onResetCallback = null;
  }
}