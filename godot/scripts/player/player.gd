extends CharacterBody2D

signal wave_cast(origin: Vector2, direction: int)
signal hit_landed(point: Vector2)
signal health_changed(current: int, max_health: int)
signal died

const GRAVITY := 1800.0
const RUN_SPEED := 390.0
const AIR_SPEED := 330.0
const JUMP_VELOCITY := -660.0
const DOUBLE_JUMP_VELOCITY := -610.0
const DASH_SPEED := 900.0
const DASH_TIME := 0.14
const DASH_COOLDOWN := 0.45
const ATTACK_TIME := 0.28
const ATTACK_ACTIVE_START := 0.10
const ATTACK_ACTIVE_END := 0.20
const WAVE_COOLDOWN := 0.42
const COYOTE_TIME := 0.10
const JUMP_BUFFER_TIME := 0.11
const HURT_INVULNERABLE_TIME := 0.82

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_shape: CollisionShape2D = $AttackArea/AttackShape
@onready var animation_tree: AnimationTree = $AnimationTree
@onready var animation_player: AnimationPlayer = $AnimationPlayer

var facing := 1
var jumps_used := 0
var dash_timer := 0.0
var dash_cooldown := 0.0
var attack_timer := 0.0
var wave_cooldown := 0.0
var coyote_timer := 0.0
var jump_buffer_timer := 0.0
var invulnerable_timer := 0.0
var hurt_lock_timer := 0.0
var afterimage_timer := 0.0
var landed_last_frame := false
var max_health := 100
var health := max_health
var is_dead := false
var hit_targets: Array[Node] = []

func _ready() -> void:
	_build_sprite_frames()
	_build_attack_shape()
	sprite.scale = Vector2(0.26, 0.26)
	attack_area.body_entered.connect(_on_attack_body_entered)
	animation_tree.active = false
	animation_player.playback_active = true
	add_to_group("player")

func _physics_process(delta: float) -> void:
	if is_dead:
		velocity.y += GRAVITY * delta
		move_and_slide()
		return
	_apply_timers(delta)
	_handle_facing()
	_handle_jump()
	_handle_dash()
	_handle_attacks()
	_apply_movement(delta)
	move_and_slide()
	_handle_landing_feedback()
	_update_animation()

func _apply_timers(delta: float) -> void:
	dash_timer = maxf(0.0, dash_timer - delta)
	dash_cooldown = maxf(0.0, dash_cooldown - delta)
	attack_timer = maxf(0.0, attack_timer - delta)
	wave_cooldown = maxf(0.0, wave_cooldown - delta)
	jump_buffer_timer = maxf(0.0, jump_buffer_timer - delta)
	invulnerable_timer = maxf(0.0, invulnerable_timer - delta)
	hurt_lock_timer = maxf(0.0, hurt_lock_timer - delta)
	afterimage_timer = maxf(0.0, afterimage_timer - delta)
	coyote_timer = COYOTE_TIME if is_on_floor() else maxf(0.0, coyote_timer - delta)
	attack_shape.disabled = attack_timer <= ATTACK_ACTIVE_START or attack_timer >= ATTACK_ACTIVE_END
	if attack_timer <= 0.0:
		hit_targets.clear()
	sprite.modulate = Color.WHITE if invulnerable_timer <= 0.0 or int(invulnerable_timer * 18.0) % 2 == 0 else Color(1.0, 1.0, 1.0, 0.38)
	if is_on_floor():
		jumps_used = 0

func _handle_facing() -> void:
	var input_x := Input.get_axis("move_left", "move_right")
	if absf(input_x) > 0.1 and attack_timer <= 0.0:
		facing = 1 if input_x > 0.0 else -1
		sprite.flip_h = facing < 0
		attack_area.scale.x = facing

func _handle_jump() -> void:
	if Input.is_action_just_pressed("jump"):
		jump_buffer_timer = JUMP_BUFFER_TIME
	if jump_buffer_timer <= 0.0:
		return
	if is_on_floor() or coyote_timer > 0.0:
		velocity.y = JUMP_VELOCITY
		jumps_used = 1
		jump_buffer_timer = 0.0
		coyote_timer = 0.0
	elif jumps_used < 2:
		velocity.y = DOUBLE_JUMP_VELOCITY
		jumps_used += 1
		jump_buffer_timer = 0.0

func _handle_dash() -> void:
	if Input.is_action_just_pressed("dash") and dash_timer <= 0.0 and dash_cooldown <= 0.0:
		dash_timer = DASH_TIME
		dash_cooldown = DASH_COOLDOWN
		invulnerable_timer = maxf(invulnerable_timer, DASH_TIME + 0.04)
		afterimage_timer = 0.0
		velocity.x = DASH_SPEED * facing

func _handle_attacks() -> void:
	if Input.is_action_just_pressed("attack") and attack_timer <= 0.0:
		attack_timer = ATTACK_TIME
		hit_targets.clear()
		sprite.play("attack")
	if Input.is_action_just_pressed("wave") and wave_cooldown <= 0.0:
		wave_cooldown = WAVE_COOLDOWN
		sprite.play("wave")
		wave_cast.emit(global_position, facing)

func _apply_movement(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	if dash_timer > 0.0:
		if afterimage_timer <= 0.0:
			_spawn_afterimage()
			afterimage_timer = 0.045
		return
	if hurt_lock_timer > 0.0:
		velocity.x = move_toward(velocity.x, 0.0, RUN_SPEED * 6.0 * delta)
		return
	if attack_timer > 0.06:
		velocity.x = move_toward(velocity.x, 0.0, RUN_SPEED * 8.0 * delta)
		return
	var input_x := Input.get_axis("move_left", "move_right")
	var speed := RUN_SPEED if is_on_floor() else AIR_SPEED
	velocity.x = move_toward(velocity.x, input_x * speed, speed * 10.0 * delta)

func _update_animation() -> void:
	if attack_timer > 0.0:
		return
	if sprite.animation == "wave" and sprite.is_playing():
		return
	if not is_on_floor():
		sprite.play("jump" if velocity.y < 0.0 else "fall")
	elif absf(velocity.x) > 12.0:
		sprite.play("run")
	else:
		sprite.play("idle")

func take_damage(amount: int, from_x: float) -> void:
	if is_dead or invulnerable_timer > 0.0:
		return
	health -= amount
	health_changed.emit(health, max_health)
	invulnerable_timer = HURT_INVULNERABLE_TIME
	hurt_lock_timer = 0.24
	velocity.x = 360.0 * sign(global_position.x - from_x)
	velocity.y = -210.0
	sprite.play("hurt")
	if health <= 0:
		is_dead = true
		died.emit()

func _on_attack_body_entered(body: Node) -> void:
	if attack_shape.disabled or hit_targets.has(body) or not body.has_method("take_damage"):
		return
	hit_targets.append(body)
	body.take_damage(18, global_position.x)
	hit_landed.emit(body.global_position + Vector2(0, -48))
	Engine.time_scale = 0.12
	await get_tree().create_timer(0.035, true, false, true).timeout
	Engine.time_scale = 1.0

func _handle_landing_feedback() -> void:
	if is_on_floor() and not landed_last_frame and velocity.y >= 0.0:
		hit_landed.emit(global_position + Vector2(0, -10))
	landed_last_frame = is_on_floor()

func _spawn_afterimage() -> void:
	var ghost := AnimatedSprite2D.new()
	ghost.sprite_frames = sprite.sprite_frames
	ghost.animation = sprite.animation
	ghost.frame = sprite.frame
	ghost.flip_h = sprite.flip_h
	ghost.global_position = sprite.global_position
	ghost.scale = sprite.scale
	ghost.modulate = Color(0.35, 0.9, 1.0, 0.35)
	ghost.z_index = sprite.z_index - 1
	get_tree().current_scene.add_child(ghost)
	var tween := ghost.create_tween()
	tween.tween_property(ghost, "modulate:a", 0.0, 0.18)
	tween.tween_callback(ghost.queue_free)

func _build_attack_shape() -> void:
	var rect := RectangleShape2D.new()
	rect.size = Vector2(92, 64)
	attack_shape.shape = rect
	attack_shape.position = Vector2(62, -58)
	attack_shape.disabled = true

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	_add_file_anim(frames, "idle", "res://assets/characters/foxy/animation/idle/foxy-idle_%02d.png", 0, 15, 9.0, true)
	_add_file_anim(frames, "run", "res://assets/characters/foxy/animation/run/foxy-run_%02d.png", 0, 15, 16.0, true)
	_add_file_anim(frames, "jump", "res://assets/characters/foxy/animation/jump/foxy-jump_%02d.png", 0, 10, 13.0, false)
	_add_file_anim(frames, "fall", "res://assets/characters/foxy/animation/jump/foxy-jump_%02d.png", 10, 12, 12.0, true)
	_add_file_anim(frames, "attack", "res://assets/characters/foxy/animation/blaster shoot/foxy-blaster shoot_%d.png", 0, 9, 18.0, false)
	_add_file_anim(frames, "wave", "res://assets/characters/foxy/animation/blaster shoot/foxy-blaster shoot_%d.png", 0, 9, 18.0, false)
	_add_file_anim(frames, "hurt", "res://assets/characters/foxy/animation/hurt/foxy-hurt_%02d.png", 0, 11, 16.0, false)
	sprite.sprite_frames = frames
	sprite.play("idle")

func _add_file_anim(frames: SpriteFrames, name: StringName, path_pattern: String, start: int, count: int, fps: float, loop: bool) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, fps)
	frames.set_animation_loop(name, loop)
	for i in range(count):
		var texture := load(path_pattern % (start + i))
		if texture:
			frames.add_frame(name, texture)
