/** Player attack parameters */
export const PLAYER_ATTACKS = {
  combo: {
    reach: 80,
    baseDamage: 10,
    damagePerStep: 5,
    forwardMomentum: 2.5,
    recovery: 200,
  },
  uppercut: {
    reach: 60,
    baseDamage: 20,
    launchVelocity: -9.0,
    recovery: 300,
  },
  dive: {
    reach: 70,
    baseDamage: 25,
    downVelocity: 13.0,
    forwardVelocity: 5.0,
  },
  wave: {
    speed: 14.0,
    damage: 20,
    cooldown: 350,
  },
} as const;

/** Player movement parameters */
export const PLAYER_MOVEMENT = {
  runSpeed: 7.5,
  airSpeed: 5.5,
  jumpVelocity: -11.0,
  doubleJumpVelocity: -10.0,
  dashSpeed: 16.0,
  dashDuration: 300,
  maxJumps: 2,
  doubleTapWindow: 300,
  motionBufferTimeout: 500,
  comboWindow: 800,
  coyoteTime: 100,
  jumpBufferTime: 80,
} as const;

/** Player defense parameters */
export const PLAYER_DEFENSE = {
  blockDamageReduction: 0.2,
  blockPushback: 2.0,
  hurtKnockbackX: 4.0,
  hurtKnockbackY: -4.0,
  hurtStunDuration: 300,
  invulnerabilityDuration: 1000,
  fallDamage: 25,
} as const;

/** Combo / Style system */
export const COMBO_CONFIG = {
  timeout: 5000,
  multiplierPerHit: 0.1,
  thresholds: [
    { count: 3, style: 'B' },
    { count: 5, style: 'A' },
    { count: 8, style: 'S' },
    { count: 12, style: 'SSS' },
  ] as const,
  defaultStyle: 'C',
} as const;

/** Score rewards */
export const SCORE_CONFIG = {
  enemyKill: 100,
  waveKill: 150,
  parryBonus: 50,
  bossKill: 5000,
  spMilestoneInterval: 500,
  deathSP: 5,
} as const;

/** Projectile parameters */
export const PROJECTILE_CONFIG = {
  enemyBulletSpeed: 9.0,
  lifetime: 2000,
} as const;
