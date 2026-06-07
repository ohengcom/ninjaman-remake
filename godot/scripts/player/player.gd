extends CharacterBody2D

signal wave_cast(origin: Vector2, direction: int)
signal hit_landed(point: Vector2)
signal health_changed(current: int, max_health: int)
signal died

const GRAVITY := 1800.0
const RUN_SPEED := 360.0
const AIR_SPEED := 300.0
const JUMP_VELOCITY := -660.0
const DOUBLE_JUMP_VELOCITY := -610.0
const DASH_SPEED := 820.0
const DASH_TIME := 0.16
const ATTACK_TIME := 0.22
const WAVE_COOLDOWN := 0.42

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_shape: CollisionShape2D = $AttackArea/AttackShape
@onready var animation_tree: AnimationTree = $AnimationTree
@onready var animation_player: AnimationPlayer = $AnimationPlayer

var facing := 1
var jumps_used := 0
var dash_timer := 0.0
var attack_timer := 0.0
var wave_cooldown := 0.0
var max_health := 100
var health := max_health
var is_dead := false

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
	_update_animation()

func _apply_timers(delta: float) -> void:
	dash_timer = maxf(0.0, dash_timer - delta)
	attack_timer = maxf(0.0, attack_timer - delta)
	wave_cooldown = maxf(0.0, wave_cooldown - delta)
	attack_shape.disabled = attack_timer <= 0.08
	if is_on_floor():
		jumps_used = 0

func _handle_facing() -> void:
	var input_x := Input.get_axis("move_left", "move_right")
	if absf(input_x) > 0.1 and attack_timer <= 0.0:
		facing = 1 if input_x > 0.0 else -1
		sprite.flip_h = facing < 0
		attack_area.scale.x = facing

func _handle_jump() -> void:
	if not Input.is_action_just_pressed("jump"):
		return
	if is_on_floor():
		velocity.y = JUMP_VELOCITY
		jumps_used = 1
	elif jumps_used < 2:
		velocity.y = DOUBLE_JUMP_VELOCITY
		jumps_used += 1

func _handle_dash() -> void:
	if Input.is_action_just_pressed("dash") and dash_timer <= 0.0:
		dash_timer = DASH_TIME
		velocity.x = DASH_SPEED * facing

func _handle_attacks() -> void:
	if Input.is_action_just_pressed("attack") and attack_timer <= 0.0:
		attack_timer = ATTACK_TIME
		sprite.play("attack")
	if Input.is_action_just_pressed("wave") and wave_cooldown <= 0.0:
		wave_cooldown = WAVE_COOLDOWN
		sprite.play("wave")
		wave_cast.emit(global_position, facing)

func _apply_movement(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	if dash_timer > 0.0:
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
	if is_dead:
		return
	health -= amount
	health_changed.emit(health, max_health)
	velocity.x = 280.0 * sign(global_position.x - from_x)
	velocity.y = -210.0
	sprite.play("hurt")
	if health <= 0:
		is_dead = true
		died.emit()

func _on_attack_body_entered(body: Node) -> void:
	if attack_timer <= 0.0 or not body.has_method("take_damage"):
		return
	body.take_damage(18, global_position.x)
	hit_landed.emit(body.global_position + Vector2(0, -48))

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
