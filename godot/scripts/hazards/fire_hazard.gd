extends Area2D

const FIRE_TEX := "res://assets/tiles/kmh_dungeon/fire.png"

var damage := 12
var _cooldowns := {}

func _ready() -> void:
	collision_layer = 0
	collision_mask = 2
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(40, 52)
	shape.shape = rect
	shape.position = Vector2(0, -26)
	add_child(shape)
	var sprite := AnimatedSprite2D.new()
	var frames := SpriteFrames.new()
	frames.add_animation("burn")
	frames.set_animation_speed("burn", 9.0)
	frames.set_animation_loop("burn", true)
	var texture: Texture2D = load(FIRE_TEX)
	for x in [16, 32, 48]:
		var tex := AtlasTexture.new()
		tex.atlas = texture
		tex.region = Rect2(x, 16, 16, 16)
		frames.add_frame("burn", tex)
	sprite.sprite_frames = frames
	sprite.scale = Vector2(4.0, 4.0)
	sprite.position = Vector2(0, -30)
	sprite.play("burn")
	sprite.frame = randi_range(0, 2)
	add_child(sprite)
	var glow := PointLight2D.new()
	glow.texture = _make_glow_texture()
	glow.position = Vector2(0, -30)
	glow.energy = 0.7
	glow.texture_scale = 2.4
	glow.color = Color(1.0, 0.62, 0.28)
	add_child(glow)

func _physics_process(_delta: float) -> void:
	for body in get_overlapping_bodies():
		if not body.is_in_group("player") or not body.has_method("take_damage"):
			continue
		var now := Time.get_ticks_msec()
		var last: int = _cooldowns.get(body.get_instance_id(), -10000)
		if now - last < 700:
			continue
		_cooldowns[body.get_instance_id()] = now
		body.take_damage(damage, global_position.x)
		AudioManager.play_sfx("spike", -4.0)

func _make_glow_texture() -> Texture2D:
	var gradient := Gradient.new()
	gradient.set_color(0, Color(1, 1, 1, 0.8))
	gradient.set_color(1, Color(1, 1, 1, 0.0))
	var tex := GradientTexture2D.new()
	tex.gradient = gradient
	tex.width = 64
	tex.height = 64
	tex.fill = GradientTexture2D.FILL_RADIAL
	tex.fill_from = Vector2(0.5, 0.5)
	tex.fill_to = Vector2(1.0, 0.5)
	return tex
