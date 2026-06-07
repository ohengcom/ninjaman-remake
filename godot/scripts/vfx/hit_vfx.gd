extends Node2D

func _ready() -> void:
	_spawn_burst()
	await get_tree().create_timer(0.42).timeout
	queue_free()

func _spawn_burst() -> void:
	for i in range(12):
		var dot := Sprite2D.new()
		dot.texture = _make_dot_texture()
		dot.modulate = Color(1.0, 0.45 + randf() * 0.35, 0.18, 1.0)
		dot.scale = Vector2.ONE * randf_range(0.5, 1.2)
		add_child(dot)
		var angle := randf_range(0.0, TAU)
		var distance := randf_range(22.0, 72.0)
		var target := Vector2(cos(angle), sin(angle)) * distance
		var tween := create_tween()
		tween.set_parallel(true)
		tween.tween_property(dot, "position", target, 0.28).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		tween.tween_property(dot, "modulate:a", 0.0, 0.28)

func _make_dot_texture() -> Texture2D:
	var image := Image.create(16, 16, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	for y in range(16):
		for x in range(16):
			var d := Vector2(x - 8, y - 8).length()
			if d <= 7.0:
				image.set_pixel(x, y, Color(1, 1, 1, 1.0 - d / 8.0))
	return ImageTexture.create_from_image(image)
