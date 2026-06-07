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
var sprite_tint := Color(0.76, 0.88, 1.0)
var sprite_scale := Vector2(0.21, 0.21)

func configure(type_name: String) -> void:
	enemy_type = type_name
	if enemy_type == "axe":
		max_health = 70
		walk_speed = 64.0
		score_value = 220
		sprite_tint = Color(1.0, 0.62, 0.42)
		sprite_scale = Vector2(0.25, 0.25)
	elif enemy_type == "ninja":
		max_health = 34
		walk_speed = 145.0
		score_value = 260
		sprite_tint = Color(0.66, 0.95, 1.0)
		sprite_scale = Vector2(0.19, 0.19)
	else:
		max_health = 45
		walk_speed = 90.0
		score_value = 150
		sprite_tint = Color(0.78, 0.88, 1.0)
		sprite_scale = Vector2(0.21, 0.21)
	health = max_health

func _ready() -> void:
	_build_sprite_frames()
	sprite.position = Vector2(0, -86)
	sprite.scale = sprite_scale
	sprite.modulate = sprite_tint
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
	_add_file_anim(frames, "walk", "res://assets/characters/foxy/animation/run/foxy-run_%02d.png", 0, 15, 13.0, true)
	_add_file_anim(frames, "hurt", "res://assets/characters/foxy/animation/hurt/foxy-hurt_%02d.png", 0, 11, 16.0, false)
	sprite.sprite_frames = frames
	sprite.play("walk")

func _add_file_anim(frames: SpriteFrames, name: StringName, path_pattern: String, start: int, count: int, fps: float, loop: bool) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, fps)
	frames.set_animation_loop(name, loop)
	for i in range(count):
		var texture := load(path_pattern % (start + i))
		if texture:
			frames.add_frame(name, texture)
