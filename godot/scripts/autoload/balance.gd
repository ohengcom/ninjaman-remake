extends Node
## Centralized balance config (Autoload singleton "Balance").
##
## Mirrors the role of phaser/src/config/combat.ts + enemies.ts.
## Values here are the canonical Godot tuning. See docs/GAME_DESIGN.md for the
## cross-engine spec and known divergences from the Phaser track.

const GRAVITY := 1800.0

const PLAYER := {
	"max_health": 100,
	"run_speed": 390.0,
	"air_speed": 330.0,
	"jump_velocity": -660.0,
	"double_jump_velocity": -610.0,
	"max_jumps": 2,
	"dash_speed": 900.0,
	"dash_time": 0.14,
	"dash_cooldown": 0.45,
	"attack_time": 0.28,
	"attack_active_start": 0.10,
	"attack_active_end": 0.20,
	"attack_damage": 18,
	"wave_cooldown": 0.42,
	"coyote_time": 0.10,
	"jump_buffer_time": 0.11,
	"hurt_invulnerable_time": 0.82,
	"hurt_lock_time": 0.24,
}

## Per-type enemy stats. Keys match enemy_guard.gd configure() type names.
const ENEMIES := {
	"guard": {
		"max_health": 45,
		"walk_speed": 90.0,
		"chase_speed": 138.0,
		"attack_range": 74.0,
		"attack_damage": 12,
		"score_value": 150,
		"windup_time": 0.22,
		"attack_cooldown": 0.9,
		"tint": Color(0.9, 1.0, 0.82),
		"scale": Vector2(3.0, 3.0),
		"character_key": "goblin_",
	},
	"axe": {
		"max_health": 70,
		"walk_speed": 64.0,
		"chase_speed": 98.0,
		"attack_range": 88.0,
		"attack_damage": 18,
		"score_value": 220,
		"windup_time": 0.34,
		"attack_cooldown": 0.9,
		"tint": Color(1.0, 0.88, 0.74),
		"scale": Vector2(3.35, 3.35),
		"character_key": "orc_",
	},
	"ninja": {
		"max_health": 34,
		"walk_speed": 145.0,
		"chase_speed": 230.0,
		"attack_range": 132.0,
		"attack_damage": 10,
		"score_value": 260,
		"windup_time": 0.22,
		"attack_cooldown": 0.55,
		"tint": Color(0.72, 0.92, 1.0),
		"scale": Vector2(3.0, 3.0),
		"character_key": "skeleton_",
	},
	"sniper": {
		"max_health": 30,
		"walk_speed": 0.0,
		"chase_speed": 0.0,
		"attack_range": 600.0,
		"attack_damage": 15,
		"score_value": 240,
		"windup_time": 0.5,
		"attack_cooldown": 1.6,
		"tint": Color(1.0, 0.82, 0.7),
		"scale": Vector2(3.0, 3.0),
		"character_key": "skeleton_",
	},
}

const ENEMY_COMMON := {
	"detect_range": 360.0,
	"patrol_radius": 260.0,
	"hurt_time": 0.2,
}

const BOSS := {
	"max_health": 260,
	"walk_speed": 72.0,
	"rush_speed": 280.0,
	"jump_slam_velocity": -560.0,
	"swipe_damage": 18,
	"rush_damage": 24,
	"slam_damage": 28,
	"engage_distance": 800.0,
	"melee_distance": 112.0,
	"score_value": 2500,
	"phase2_threshold": 0.65,
	"phase3_threshold": 0.32,
	"tint": Color(1.0, 0.56, 0.44),
	"scale": Vector2(4.6, 4.6),
	"character_key": "dragon_",
}

const SCORE := {
	"coin": 50,
	"enemy_kill_default": 150,
}

## Returns enemy stat dictionary for a type, falling back to guard.
func enemy_stats(type_name: String) -> Dictionary:
	return ENEMIES.get(type_name, ENEMIES["guard"])
