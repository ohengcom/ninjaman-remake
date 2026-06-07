extends Node

signal score_changed(score: int)
signal level_changed(level_index: int)

var current_level := 1
var score := 0
var last_clear_score := 0

func start_new_run() -> void:
	current_level = 1
	score = 0
	last_clear_score = 0
	score_changed.emit(score)
	level_changed.emit(current_level)

func add_score(points: int) -> int:
	score += points
	score_changed.emit(score)
	return score

func complete_level() -> void:
	last_clear_score = score
	current_level += 1
	level_changed.emit(current_level)

func restart_current_level() -> void:
	score = last_clear_score
	score_changed.emit(score)
