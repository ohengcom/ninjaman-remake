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

  setState(name: string): void {
    if (this.currentState?.name === name) {
      return;
    }
    
    if (this.currentState?.onExit) {
      this.currentState.onExit(this.context);
    }
    
    this.clearTimers();

    const nextState = this.states.get(name);
    if (!nextState) {
      console.warn(`State '${name}' not found.`);
      return;
    }

    this.currentState = nextState;

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
}