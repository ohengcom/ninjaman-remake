import type { Player } from './entities/Player.js';
import type { Enemy } from './entities/Enemy.js';
import type { Boss } from './entities/Boss.js';

export const GAME_EVENTS = {
    UPDATE_HEALTH: 'update_health',
    UPDATE_SCORE: 'update_score',
    UPDATE_LEVEL: 'update_level',
    UPDATE_STYLE: 'update_style',
    UPDATE_BOSS_HEALTH: 'update_boss_health',
    PLAYER_ATTACK: 'player_attack',
    PLAYER_PARRY: 'player_parry',
    ENEMY_ATTACK: 'enemy_attack',
    BOSS_ATTACK: 'boss_attack',
    PLAYER_DEAD: 'player_dead',
    ENEMY_SHOOT: 'enemy_shoot',
    PLAYER_CAST_WAVE: 'player_cast_wave',
} as const;

/** 事件参数类型映射，用于类型安全的 emit/on */
export type GameEventMap = {
    [GAME_EVENTS.UPDATE_HEALTH]: [health: number, maxHealth: number];
    [GAME_EVENTS.UPDATE_SCORE]: [score: number];
    [GAME_EVENTS.UPDATE_LEVEL]: [level: number];
    [GAME_EVENTS.UPDATE_STYLE]: [style: string];
    [GAME_EVENTS.UPDATE_BOSS_HEALTH]: [health: number, maxHealth: number];
    [GAME_EVENTS.PLAYER_ATTACK]: [attacker: Player, type: string];
    [GAME_EVENTS.PLAYER_PARRY]: [defender: Player];
    [GAME_EVENTS.ENEMY_ATTACK]: [attacker: Enemy, damage: number, reach: number];
    [GAME_EVENTS.BOSS_ATTACK]: [attacker: Boss];
    [GAME_EVENTS.PLAYER_DEAD]: [];
    [GAME_EVENTS.ENEMY_SHOOT]: [attacker: Enemy, damage: number];
    [GAME_EVENTS.PLAYER_CAST_WAVE]: [player: Player];
};

