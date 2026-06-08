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
	sprite.position = Vector2(0, -94)
	sprite.scale = Vector2(1.05, 1.05)
	sprite.modulate = Color(1.0, 0.46, 0.34)
	_update_facing()
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
		_update_facing()
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
	var base := "res://assets/characters/kenney_platformer/Zombie/Poses/zombie_"
	_add_pose_anim(frames, "walk", [base + "walk1.png", base + "walk2.png"], 5.5, true)
	_add_pose_anim(frames, "rush", [base + "kick.png", base + "walk2.png"], 12.0, true)
	_add_pose_anim(frames, "hurt", [base + "hurt.png", base + "idle.png"], 8.0, false)
	sprite.sprite_frames = frames
	sprite.play("walk")

func _add_pose_anim(frames: SpriteFrames, name: StringName, paths: Array[String], fps: float, loop: bool) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, fps)
	frames.set_animation_loop(name, loop)
	for path in paths:
		var texture := load(path)
		if texture:
			frames.add_frame(name, texture)

func _update_facing() -> void:
	sprite.flip_h = direction < 0
