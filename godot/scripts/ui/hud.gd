extends CanvasLayer

var health_bar: ColorRect
var health_back: ColorRect
var score_label: Label
var sector_label: Label
var message_label: Label
var pause_label: Label
var control_label: Label
var damage_flash: ColorRect

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_ui()
	update_health(100, 100)
	update_score(0)
	show_message("NINJA MAN: GODOT PROTOTYPE", 2.0)

func update_health(current: int, max_health: int) -> void:
	if not is_instance_valid(health_bar):
		return
	var ratio := clampf(float(current) / maxf(1.0, float(max_health)), 0.0, 1.0)
	health_bar.size = Vector2(280.0 * ratio, health_bar.size.y)
	health_bar.color = Color(0.1, 0.85, 0.48) if ratio > 0.35 else Color(0.95, 0.18, 0.18)

func update_score(score: int) -> void:
	if is_instance_valid(score_label):
		score_label.text = "SCORE %06d" % score

func flash_damage() -> void:
	if not is_instance_valid(damage_flash):
		return
	damage_flash.modulate.a = 0.34
	var tween := create_tween()
	tween.tween_property(damage_flash, "modulate:a", 0.0, 0.22)

func show_message(text: String, duration := 1.5) -> void:
	if not is_instance_valid(message_label):
		return
	message_label.text = text
	message_label.modulate.a = 1.0
	var tween := create_tween()
	tween.tween_interval(duration)
	tween.tween_property(message_label, "modulate:a", 0.0, 0.35)

func set_pause_visible(paused: bool) -> void:
	if is_instance_valid(pause_label):
		pause_label.visible = paused

func _build_ui() -> void:
	var root := Control.new()
	root.name = "Root"
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	health_back = ColorRect.new()
	health_back.color = Color(0.02, 0.02, 0.03, 0.82)
	health_back.position = Vector2(28, 24)
	health_back.size = Vector2(292, 28)
	root.add_child(health_back)

	health_bar = ColorRect.new()
	health_bar.color = Color(0.1, 0.85, 0.48)
	health_bar.position = Vector2(34, 30)
	health_bar.size = Vector2(280, 16)
	root.add_child(health_bar)

	sector_label = Label.new()
	sector_label.text = "ACT 1: FOREST TESTBED"
	sector_label.position = Vector2(28, 60)
	sector_label.add_theme_font_size_override("font_size", 18)
	root.add_child(sector_label)

	score_label = Label.new()
	score_label.position = Vector2(1030, 28)
	score_label.add_theme_font_size_override("font_size", 22)
	root.add_child(score_label)

	message_label = Label.new()
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.position = Vector2(360, 94)
	message_label.size = Vector2(560, 40)
	message_label.add_theme_font_size_override("font_size", 24)
	message_label.modulate = Color(0.75, 0.95, 1.0, 0.0)
	root.add_child(message_label)

	pause_label = Label.new()
	pause_label.text = "PAUSED"
	pause_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pause_label.position = Vector2(480, 310)
	pause_label.size = Vector2(320, 80)
	pause_label.add_theme_font_size_override("font_size", 54)
	pause_label.add_theme_color_override("font_color", Color(1.0, 0.32, 0.42))
	pause_label.visible = false
	root.add_child(pause_label)

	control_label = Label.new()
	control_label.text = "A/D MOVE  SPACE JUMP  SHIFT DASH  J MELEE  L WAVE  ESC PAUSE"
	control_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	control_label.position = Vector2(240, 672)
	control_label.size = Vector2(800, 32)
	control_label.add_theme_font_size_override("font_size", 16)
	control_label.add_theme_color_override("font_color", Color(0.7, 0.88, 1.0, 0.74))
	root.add_child(control_label)

	damage_flash = ColorRect.new()
	damage_flash.color = Color(1.0, 0.05, 0.02)
	damage_flash.set_anchors_preset(Control.PRESET_FULL_RECT)
	damage_flash.modulate.a = 0.0
	damage_flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(damage_flash)
