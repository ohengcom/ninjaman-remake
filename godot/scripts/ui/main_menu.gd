extends CanvasLayer

signal start_requested

var prompt: Label

func _ready() -> void:
	_build_menu()

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("jump") or Input.is_action_just_pressed("attack"):
		start_requested.emit()

func _build_menu() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	var bg := ColorRect.new()
	bg.color = Color(0.015, 0.018, 0.028)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(bg)

	var title := Label.new()
	title.text = "NINJA MAN"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.position = Vector2(340, 185)
	title.size = Vector2(600, 80)
	title.add_theme_font_size_override("font_size", 72)
	title.add_theme_color_override("font_color", Color(0.96, 0.98, 1.0))
	root.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "GODOT 4 REBUILD PROTOTYPE"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.position = Vector2(340, 280)
	subtitle.size = Vector2(600, 40)
	subtitle.add_theme_font_size_override("font_size", 24)
	subtitle.add_theme_color_override("font_color", Color(0.45, 0.9, 1.0))
	root.add_child(subtitle)

	prompt = Label.new()
	prompt.text = "PRESS SPACE OR J TO START"
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt.position = Vector2(340, 430)
	prompt.size = Vector2(600, 40)
	prompt.add_theme_font_size_override("font_size", 24)
	prompt.add_theme_color_override("font_color", Color(1.0, 0.3, 0.4))
	root.add_child(prompt)

	var controls := Label.new()
	controls.text = "A/D MOVE   SPACE JUMP   SHIFT DASH   J ATTACK   L WAVE   ESC PAUSE"
	controls.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	controls.position = Vector2(240, 540)
	controls.size = Vector2(800, 40)
	controls.add_theme_font_size_override("font_size", 18)
	controls.add_theme_color_override("font_color", Color(0.75, 0.78, 0.82))
	root.add_child(controls)
