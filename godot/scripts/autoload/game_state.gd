extends Node

signal score_changed(score: int)
signal coins_changed(coins: int)

var current_level := 1
var score := 0
var coins := 0
var last_clear_score := 0
var last_clear_coins := 0
var checkpoint_position := Vector2.ZERO
var checkpoint_health := -1

func start_new_run() -> void:
	current_level = 1
	score = 0
	coins = 0
	last_clear_score = 0
	last_clear_coins = 0
	checkpoint_position = Vector2.ZERO
	checkpoint_health = -1
	score_changed.emit(score)
	coins_changed.emit(coins)

func add_score(points: int) -> int:
	score += points
	score_changed.emit(score)
	return score

func add_coin(value := 1) -> int:
	coins += value
	add_score(50 * value)
	coins_changed.emit(coins)
	return coins

func complete_level() -> void:
	last_clear_score = score
	last_clear_coins = coins
	current_level += 1
	checkpoint_position = Vector2.ZERO
	checkpoint_health = -1

func restart_current_level() -> void:
	score = last_clear_score
	coins = last_clear_coins
	score_changed.emit(score)
	coins_changed.emit(coins)

func set_checkpoint(position: Vector2, health := -1) -> void:
	checkpoint_position = position
	checkpoint_health = health

func get_spawn(default_position: Vector2) -> Vector2:
	return checkpoint_position if checkpoint_position != Vector2.ZERO else default_position
