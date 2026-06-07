extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

const GRAVITY := 1800.0
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

var enemy_type := "guard"
var direction := -1
var max_health := 45
var health := max_health
var hurt_timer := 0.0
var walk_speed := 90.0
var score_value := 150
var body_color := Color(0.18, 0.21, 0.24)
var accent_color := Color(0.55, 0.14, 0.12)

func configure(type_name: String) -> void:
	enemy_type = type_name
	if enemy_type == "axe":
		max_health = 70
		walk_speed = 64.0
		score_value = 220
		body_color = Color(0.30, 0.20, 0.13)
		accent_color = Color(0.85, 0.35, 0.12)
	elif enemy_type == "ninja":
		max_health = 34
		walk_speed = 145.0
		score_value = 260
		body_color = Color(0.06, 0.08, 0.12)
		accent_color = Color(0.18, 0.55, 0.70)
	else:
		max_health = 45
		walk_speed = 90.0
		score_value = 150
		body_color = Color(0.18, 0.21, 0.24)
		accent_color = Color(0.55, 0.14, 0.12)
	health = max_health

func _ready() -> void:
	_build_sprite_frames()
	add_to_group("enemies")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	if hurt_timer > 0.0:
		hurt_timer -= delta
		velocity.x = move_toward(velocity.x, 0.0, walk_speed * 8.0 * delta)
	else:
		velocity.x = walk_speed * direction
		if is_on_wall():
			direction *= -1
			sprite.flip_h = direction > 0
	move_and_slide()
	if health <= 0:
		defeated.emit(score_value, global_position + Vector2(0, -48))
		queue_free()
	elif hurt_timer > 0.0:
		sprite.play("hurt")
	else:
		sprite.play("walk")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = 0.2
	velocity.x = 220.0 * sign(global_position.x - from_x)
	velocity.y = -150.0
	hit_landed.emit(global_position + Vector2(0, -48))

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	_add_anim(frames, "walk", body_color, accent_color, 4)
	_add_anim(frames, "hurt", body_color.lightened(0.22), Color(1.0, 0.32, 0.22), 2)
	sprite.sprite_frames = frames
	sprite.play("walk")

func _add_anim(frames: SpriteFrames, name: StringName, body: Color, accent: Color, count: int) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, 8.0)
	frames.set_animation_loop(name, name == &"walk")
	for i in range(count):
		frames.add_frame(name, _make_texture(i, count, body, accent))

func _make_texture(index: int, count: int, body: Color, accent: Color) -> Texture2D:
	var image := Image.create(112, 128, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	var bob := int(sin(TAU * float(index) / maxf(1.0, float(count))) * 3.0)
	_rect(image, 40, 24 + bob, 32, 28, body.darkened(0.2))
	_rect(image, 34, 53 + bob, 45, 44, body)
	_rect(image, 29, 61 + bob, 14, 28, body.darkened(0.1))
	_rect(image, 70, 60 + bob, 14, 30, body.darkened(0.05))
	_rect(image, 38, 94 + bob, 14, 28, body.darkened(0.2))
	_rect(image, 62, 94 + bob, 14, 28, body.darkened(0.2))
	_rect(image, 34, 55 + bob, 45, 8, accent)
	_rect(image, 48, 34 + bob, 20, 7, Color(0.76, 0.58, 0.42))
	if enemy_type == "axe":
		_line(image, 72, 68 + bob, 102, 32 + bob, Color(0.46, 0.30, 0.14), 5)
		_rect(image, 98, 25 + bob, 18, 16, Color(0.75, 0.75, 0.68))
	elif enemy_type == "ninja":
		_line(image, 74, 66 + bob, 100, 54 + bob, Color(0.82, 0.9, 0.92), 2)
		_line(image, 33, 67 + bob, 12, 48 + bob, Color(0.82, 0.9, 0.92), 2)
	else:
		_line(image, 72, 68 + bob, 96, 42 + bob, Color(0.72, 0.78, 0.82), 3)
	return ImageTexture.create_from_image(image)

func _rect(image: Image, x: int, y: int, w: int, h: int, color: Color) -> void:
	for py in range(maxi(0, y), mini(image.get_height(), y + h)):
		for px in range(maxi(0, x), mini(image.get_width(), x + w)):
			image.set_pixel(px, py, color)

func _line(image: Image, x1: int, y1: int, x2: int, y2: int, color: Color, width: int) -> void:
	var steps := maxi(absi(x2 - x1), absi(y2 - y1))
	for i in range(steps + 1):
		var p := float(i) / maxf(1.0, float(steps))
		_rect(image, int(lerpf(x1, x2, p)), int(lerpf(y1, y2, p)), width, width, color)
