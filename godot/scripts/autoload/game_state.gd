extends Node

signal score_changed(score: int)
signal level_changed(level_index: int)
signal checkpoint_changed(position: Vector2)

var current_level := 1
var score := 0
var last_clear_score := 0
var checkpoint_position := Vector2.ZERO

func start_new_run() -> void:
	current_level = 1
	score = 0
	last_clear_score = 0
	checkpoint_position = Vector2.ZERO
	score_changed.emit(score)
	level_changed.emit(current_level)

func add_score(points: int) -> int:
	score += points
	score_changed.emit(score)
	return score

func complete_level() -> void:
	last_clear_score = score
	current_level += 1
	checkpoint_position = Vector2.ZERO
	level_changed.emit(current_level)

func restart_current_level() -> void:
	score = last_clear_score
	score_changed.emit(score)

func set_checkpoint(position: Vector2) -> void:
	checkpoint_position = position
	checkpoint_changed.emit(position)

func get_spawn(default_position: Vector2) -> Vector2:
	return checkpoint_position if checkpoint_position != Vector2.ZERO else default_position
