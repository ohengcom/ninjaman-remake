/** Player attack parameters */
export const PLAYER_ATTACKS = {
  combo: {
    reach: 80,
    baseDamage: 10,
    damagePerStep: 5,
    forwardMomentum: 50,
    recovery: 200,
  },
  uppercut: {
    reach: 60,
    baseDamage: 20,
    launchVelocity: -500,
    recovery: 300,
  },
  dive: {
    reach: 70,
    baseDamage: 25,
    downVelocity: 800,
    forwardVelocity: 300,
  },
  wave: {
    speed: 800,
    damage: 20,
    cooldown: 1000,
  },
} as const;

/** Player movement parameters */
export const PLAYER_MOVEMENT = {
  runSpeed: 400,
  airSpeed: 300,
  jumpVelocity: -600,
  doubleJumpVelocity: -550,
  dashSpeed: 800,
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
  blockPushback: 100,
  hurtKnockbackX: 250,
  hurtKnockbackY: -200,
  hurtStunDuration: 300,
  invulnerabilityDuration: 1000,
  fallDamage: 25,
} as const;

/** Combo / Style system */
export const COMBO_CONFIG = {
  timeout: 3000,
  multiplierPerHit: 0.1,
  thresholds: [
    { count: 4, style: 'B' },
    { count: 7, style: 'A' },
    { count: 10, style: 'S' },
    { count: 15, style: 'SSS' },
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
  enemyBulletSpeed: 600,
  lifetime: 2000,
} as const;
