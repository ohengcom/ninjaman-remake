extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

const GRAVITY := 1800.0
const WALK_SPEED := 72.0
const RUSH_SPEED := 280.0

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

var direction := -1
var max_health := 260
var health := max_health
var attack_cooldown := 0.0
var hurt_timer := 0.0
var rush_timer := 0.0

func _ready() -> void:
	_build_sprite_frames()
	add_to_group("enemies")
	add_to_group("boss")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	attack_cooldown = maxf(0.0, attack_cooldown - delta)
	hurt_timer = maxf(0.0, hurt_timer - delta)
	rush_timer = maxf(0.0, rush_timer - delta)

	var player := get_tree().get_first_node_in_group("player") as Node2D
	if is_instance_valid(player):
		direction = 1 if player.global_position.x > global_position.x else -1
		sprite.flip_h = direction > 0
		var distance := global_position.distance_to(player.global_position)
		if distance < 520.0 and rush_timer <= 0.0 and health < max_health * 0.65:
			rush_timer = 0.55
		if distance < 92.0 and attack_cooldown <= 0.0 and player.has_method("take_damage"):
			attack_cooldown = 1.1
			player.take_damage(22, global_position.x)
			hit_landed.emit(player.global_position + Vector2(0, -52))

	if hurt_timer > 0.0:
		velocity.x = move_toward(velocity.x, 0.0, WALK_SPEED * 10.0 * delta)
	elif rush_timer > 0.0:
		velocity.x = RUSH_SPEED * direction
	else:
		velocity.x = WALK_SPEED * direction
	move_and_slide()

	if health <= 0:
		defeated.emit(2500, global_position + Vector2(0, -80))
		queue_free()
	elif hurt_timer > 0.0:
		sprite.play("hurt")
	elif rush_timer > 0.0:
		sprite.play("rush")
	else:
		sprite.play("walk")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = 0.14
	velocity.x = 140.0 * sign(global_position.x - from_x)
	velocity.y = -90.0
	hit_landed.emit(global_position + Vector2(0, -80))

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	_add_anim(frames, "walk", Color(0.28, 0.08, 0.08), Color(0.95, 0.28, 0.15), 4)
	_add_anim(frames, "rush", Color(0.42, 0.08, 0.1), Color(1.0, 0.55, 0.18), 4)
	_add_anim(frames, "hurt", Color(0.55, 0.12, 0.14), Color(1.0, 0.8, 0.32), 2)
	sprite.sprite_frames = frames
	sprite.play("walk")

func _add_anim(frames: SpriteFrames, name: StringName, body: Color, accent: Color, count: int) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, 7.0)
	frames.set_animation_loop(name, name != &"hurt")
	for i in range(count):
		frames.add_frame(name, _make_texture(i, count, body, accent))

func _make_texture(index: int, count: int, body: Color, accent: Color) -> Texture2D:
	var image := Image.create(150, 168, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	var bob := int(sin(TAU * float(index) / maxf(1.0, float(count))) * 3.0)
	_rect(image, 52, 18 + bob, 46, 42, body.darkened(0.18))
	_rect(image, 38, 58 + bob, 74, 66, body)
	_rect(image, 26, 70 + bob, 22, 48, body.darkened(0.1))
	_rect(image, 102, 70 + bob, 22, 48, body.darkened(0.05))
	_rect(image, 48, 120 + bob, 22, 42, body.darkened(0.24))
	_rect(image, 84, 120 + bob, 22, 42, body.darkened(0.2))
	_rect(image, 36, 58 + bob, 78, 12, accent)
	_rect(image, 45, 18 + bob, 16, 28, Color(0.86, 0.78, 0.55))
	_rect(image, 93, 18 + bob, 16, 28, Color(0.86, 0.78, 0.55))
	_line(image, 108, 84 + bob, 142, 42 + bob, Color(0.9, 0.92, 0.84), 5)
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
