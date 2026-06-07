extends Node

const LEVEL_SCENE := preload("res://scenes/levels/Level01.tscn")

func _ready() -> void:
	_ensure_input_map()
	_load_level()

func _load_level() -> void:
	for child in get_children():
		child.queue_free()
	add_child(LEVEL_SCENE.instantiate())

func _ensure_input_map() -> void:
	_add_key_action("move_left", KEY_A)
	_add_key_action("move_right", KEY_D)
	_add_key_action("move_up", KEY_W)
	_add_key_action("move_down", KEY_S)
	_add_key_action("jump", KEY_SPACE)
	_add_key_action("attack", KEY_J)
	_add_key_action("defend", KEY_K)
	_add_key_action("wave", KEY_L)
	_add_key_action("dash", KEY_SHIFT)
	_add_key_action("pause", KEY_ESCAPE)

func _add_key_action(action_name: StringName, keycode: Key) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var event := InputEventKey.new()
	event.physical_keycode = keycode
	if not InputMap.action_has_event(action_name, event):
		InputMap.action_add_event(action_name, event)
