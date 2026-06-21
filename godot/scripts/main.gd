extends Node

const LEVEL_SCENE := preload("res://scenes/levels/Level01.tscn")
const MENU_SCENE := preload("res://scenes/ui/MainMenu.tscn")

var current_scene: Node

func _ready() -> void:
	_ensure_input_map()
	_show_menu()

func _show_menu() -> void:
	_clear_current_scene()
	var menu := MENU_SCENE.instantiate()
	menu.start_requested.connect(_start_game)
	current_scene = menu
	add_child(menu)

func _start_game() -> void:
	GameState.start_new_run()
	_load_level()

func _load_level() -> void:
	_clear_current_scene()
	var level := LEVEL_SCENE.instantiate()
	if level.has_signal("level_completed"):
		level.level_completed.connect(_on_level_completed)
	if level.has_signal("return_to_menu_requested"):
		level.return_to_menu_requested.connect(_show_menu)
	current_scene = level
	add_child(level)

func _clear_current_scene() -> void:
	for child in get_children():
		child.queue_free()
	current_scene = null

func _on_level_completed() -> void:
	GameState.complete_level()
	await get_tree().create_timer(2.0).timeout
	_show_menu()

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
	event.keycode = keycode
	if not InputMap.action_has_event(action_name, event):
		InputMap.action_add_event(action_name, event)
