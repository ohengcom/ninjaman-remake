import Phaser from 'phaser';

export interface StateConfig<T> {
  name: string;
  onEnter?: (context: T) => void;
  onUpdate?: (context: T, dt: number) => void;
  onExit?: (context: T) => void;
}

export class StateMachine<T> {
  private states = new Map<string, StateConfig<T>>();
  private currentState?: StateConfig<T>;
  private context: T;
  private stateTimers: Phaser.Time.TimerEvent[] = [];
  private transitionCallbacks: Array<(from: string, to: string) => void> = [];
  private allowedTransitions: Map<string, Set<string>> | null = null;

  constructor(context: T) {
    this.context = context;
  }

  addState(state: StateConfig<T>): this {
    this.states.set(state.name, state);
    return this;
  }

  addTimer(timer: Phaser.Time.TimerEvent): void {
      this.stateTimers.push(timer);
  }

  clearTimers(): void {
      for (const t of this.stateTimers) {
          t.remove();
      }
      this.stateTimers = [];
  }

  /** Register state transition callback (for logs or debugging) */
  onTransition(callback: (from: string, to: string) => void): this {
    this.transitionCallbacks.push(callback);
    return this;
  }

  /** Define allowed state transition pathways */
  addTransition(from: string, to: string): this {
    if (!this.allowedTransitions) this.allowedTransitions = new Map();
    if (!this.allowedTransitions.has(from)) this.allowedTransitions.set(from, new Set());
    this.allowedTransitions.get(from)!.add(to);
    return this;
  }

  setState(name: string): void {
    if (this.currentState?.name === name) {
      return;
    }

    const nextState = this.states.get(name);
    if (!nextState) {
      console.warn(`State '${name}' not found.`);
      return;
    }
    
    // Check if transition is allowed
    if (this.allowedTransitions && this.currentState) {
      const allowed = this.allowedTransitions.get(this.currentState.name);
      if (allowed && !allowed.has(name)) {
        console.warn(`Blocked transition: ${this.currentState.name} -> ${name}`);
        return;
      }
    }

    const fromName = this.currentState?.name || '';
    
    if (this.currentState?.onExit) {
      this.currentState.onExit(this.context);
    }
    
    this.clearTimers();

    this.currentState = nextState;

    // Trigger transition callbacks
    for (const cb of this.transitionCallbacks) {
      cb(fromName, name);
    }

    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.context);
    }
  }

  update(dt: number): void {
    if (this.currentState?.onUpdate) {
      this.currentState.onUpdate(this.context, dt);
    }
  }

  getCurrentStateName(): string {
    return this.currentState?.name || '';
  }

  destroy(): void {
    this.clearTimers();
    this.transitionCallbacks = [];
    this.currentState = undefined;
  }
}
