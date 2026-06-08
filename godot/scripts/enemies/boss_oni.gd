extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

const GRAVITY := 1800.0
const WALK_SPEED := 72.0
const RUSH_SPEED := 280.0
const JUMP_SLAM_VELOCITY := -560.0

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var body_shape: CollisionShape2D = $CollisionShape2D

enum State { STALK, WINDUP, SWIPE, RUSH, SLAM, HURT }

var direction := -1
var max_health := 260
var health := max_health
var attack_cooldown := 0.0
var hurt_timer := 0.0
var rush_timer := 0.0
var windup_timer := 0.0
var swipe_timer := 0.0
var slam_timer := 0.0
var state := State.STALK
var attack_has_hit := false
var phase := 1

func _ready() -> void:
	_build_sprite_frames()
	_build_body_shape()
	sprite.position = Vector2(0, -72)
	sprite.scale = Vector2(4.6, 4.6)
	sprite.modulate = Color(1.0, 0.82, 0.58)
	_update_facing()
	add_to_group("enemies")
	add_to_group("boss")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	attack_cooldown = maxf(0.0, attack_cooldown - delta)
	hurt_timer = maxf(0.0, hurt_timer - delta)
	rush_timer = maxf(0.0, rush_timer - delta)
	windup_timer = maxf(0.0, windup_timer - delta)
	swipe_timer = maxf(0.0, swipe_timer - delta)
	slam_timer = maxf(0.0, slam_timer - delta)
	phase = 3 if health < max_health * 0.32 else 2 if health < max_health * 0.65 else 1

	var player := get_tree().get_first_node_in_group("player") as Node2D
	if is_instance_valid(player):
		direction = 1 if player.global_position.x > global_position.x else -1
		_update_facing()
		var distance := global_position.distance_to(player.global_position)
		if state == State.STALK and attack_cooldown <= 0.0:
			if distance < 112.0:
				state = State.WINDUP
				windup_timer = 0.42
				velocity.x = 0.0
			elif distance < 560.0 and phase >= 2:
				state = State.RUSH
				rush_timer = 0.58 if phase == 2 else 0.75
				attack_has_hit = false
			elif distance < 430.0 and phase >= 3 and is_on_floor():
				state = State.SLAM
				slam_timer = 0.9
				velocity.y = JUMP_SLAM_VELOCITY
		if state == State.SWIPE or state == State.RUSH or state == State.SLAM:
			_try_hit_player(player)

	if hurt_timer > 0.0:
		state = State.HURT
		velocity.x = move_toward(velocity.x, 0.0, WALK_SPEED * 10.0 * delta)
	elif state == State.WINDUP:
		sprite.modulate = Color(1.0, 0.26, 0.20)
		velocity.x = move_toward(velocity.x, 0.0, WALK_SPEED * 12.0 * delta)
		if windup_timer <= 0.0:
			state = State.SWIPE
			swipe_timer = 0.24
			attack_has_hit = false
	elif state == State.SWIPE:
		velocity.x = move_toward(velocity.x, RUSH_SPEED * 0.75 * direction, RUSH_SPEED * 8.0 * delta)
		if swipe_timer <= 0.0:
			attack_cooldown = 0.75 if phase >= 3 else 1.1
			state = State.STALK
	elif state == State.RUSH:
		state = State.RUSH
		sprite.modulate = Color(1.0, 0.48, 0.34)
		velocity.x = RUSH_SPEED * direction if rush_timer > 0.0 else 0.0
		if rush_timer <= 0.0:
			attack_cooldown = 1.05
			state = State.STALK
	elif state == State.SLAM:
		sprite.modulate = Color(1.0, 0.68, 0.24)
		velocity.x = WALK_SPEED * 1.4 * direction
		if is_on_floor() and velocity.y >= 0.0 and slam_timer < 0.7:
			hit_landed.emit(global_position + Vector2(0, -40))
			attack_cooldown = 1.2
			state = State.STALK
	else:
		state = State.STALK
		sprite.modulate = Color(1.0, 0.56, 0.44)
		velocity.x = WALK_SPEED * direction
	move_and_slide()

	if health <= 0:
		defeated.emit(2500, global_position + Vector2(0, -80))
		queue_free()
	elif hurt_timer > 0.0:
		sprite.play("hurt")
	elif state == State.WINDUP or state == State.SWIPE:
		sprite.play("attack")
	elif state == State.RUSH:
		sprite.play("rush")
	elif state == State.SLAM:
		sprite.play("slam")
	else:
		sprite.play("walk")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = 0.14
	state = State.HURT
	velocity.x = 140.0 * sign(global_position.x - from_x)
	velocity.y = -90.0
	hit_landed.emit(global_position + Vector2(0, -80))

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	var base := "res://assets/characters/dungeon_sprites/dragon_/"
	_add_dir_anim(frames, "walk", base + "walkRun_/", "lWalkRun", 4, 7.0, true)
	_add_dir_anim(frames, "rush", base + "walkRun_/", "lWalkRun", 4, 14.0, true)
	_add_dir_anim(frames, "attack", base + "attack_/", "lAttack", 4, 12.0, true)
	_add_dir_anim(frames, "slam", base + "jump_/", "lJump", 4, 10.0, true)
	_add_dir_anim(frames, "hurt", base + "hurt_/", "lHurt", 4, 9.0, false)
	_add_dir_anim(frames, "death", base + "death_/", "lDeath", 4, 8.0, false)
	sprite.sprite_frames = frames
	sprite.play("walk")

func _add_dir_anim(frames: SpriteFrames, name: StringName, directory: String, prefix: String, count: int, fps: float, loop: bool) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, fps)
	frames.set_animation_loop(name, loop)
	for i in range(count):
		var texture := load("%s%s_%d.png" % [directory, prefix, i])
		if texture:
			frames.add_frame(name, texture)

func _update_facing() -> void:
	sprite.flip_h = direction > 0

func _build_body_shape() -> void:
	var rect := RectangleShape2D.new()
	rect.size = Vector2(82, 112)
	body_shape.shape = rect
	body_shape.position = Vector2(0, -56)

func _try_hit_player(player: Node2D) -> void:
	if attack_has_hit or not is_instance_valid(player) or not player.has_method("take_damage"):
		return
	var range_x := 108.0 if state != State.RUSH else 132.0
	var range_y := 122.0 if state != State.SLAM else 160.0
	if absf(player.global_position.x - global_position.x) <= range_x and absf(player.global_position.y - global_position.y) <= range_y:
		attack_has_hit = true
		var damage := 18 if state == State.SWIPE else 24 if state == State.RUSH else 28
		player.take_damage(damage, global_position.x)
		hit_landed.emit(player.global_position + Vector2(0, -52))
