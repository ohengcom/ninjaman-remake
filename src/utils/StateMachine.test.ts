import { StateMachine } from './StateMachine.js';

describe('StateMachine', () => {
  it('enters the initial state and updates it', () => {
    const context = { count: 0 };
    const machine = new StateMachine(context);

    machine.addState({
      name: 'idle',
      onEnter: (ctx) => {
        ctx.count += 1;
      },
      onUpdate: (ctx, dt) => {
        ctx.count += dt;
      },
    });

    machine.setState('idle');
    machine.update(4);

    expect(machine.getCurrentStateName()).toBe('idle');
    expect(context.count).toBe(5);
  });

  it('runs exit before entering the next state', () => {
    const calls: string[] = [];
    const machine = new StateMachine({});

    machine
      .addState({
        name: 'first',
        onEnter: () => calls.push('enter:first'),
        onExit: () => calls.push('exit:first'),
      })
      .addState({
        name: 'second',
        onEnter: () => calls.push('enter:second'),
      });

    machine.setState('first');
    machine.setState('second');

    expect(calls).toEqual(['enter:first', 'exit:first', 'enter:second']);
  });

  it('does not exit the current state when target state is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const calls: string[] = [];
    const machine = new StateMachine({});

    machine.addState({
      name: 'idle',
      onEnter: () => calls.push('enter:idle'),
      onExit: () => calls.push('exit:idle'),
    });

    machine.setState('idle');
    machine.setState('missing');

    expect(machine.getCurrentStateName()).toBe('idle');
    expect(calls).toEqual(['enter:idle']);
    warn.mockRestore();
  });
});
