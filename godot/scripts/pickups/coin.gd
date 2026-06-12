extends Area2D

const COIN_TEX := "res://assets/tiles/four_seasons/objects/coin.png"

var collected := false

func _ready() -> void:
	collision_layer = 0
	collision_mask = 2
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 22.0
	shape.shape = circle
	add_child(shape)
	var sprite := AnimatedSprite2D.new()
	sprite.name = "Sprite"
	var frames := SpriteFrames.new()
	frames.add_animation("spin")
	frames.set_animation_speed("spin", 12.0)
	frames.set_animation_loop("spin", true)
	var texture: Texture2D = load(COIN_TEX)
	for i in range(12):
		var tex := AtlasTexture.new()
		tex.atlas = texture
		tex.region = Rect2(i * 16, 0, 16, 16)
		frames.add_frame("spin", tex)
	sprite.sprite_frames = frames
	sprite.scale = Vector2(3.0, 3.0)
	sprite.play("spin")
	sprite.frame = randi_range(0, 11)
	add_child(sprite)
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if collected or not body.is_in_group("player"):
		return
	collected = true
	GameState.add_coin()
	AudioManager.play_sfx("coin", -4.0, randf_range(0.96, 1.08))
	set_deferred("monitoring", false)
	var sprite := get_node("Sprite") as AnimatedSprite2D
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite, "position:y", -42.0, 0.22).set_ease(Tween.EASE_OUT)
	tween.tween_property(sprite, "modulate:a", 0.0, 0.22)
	tween.chain().tween_callback(queue_free)
