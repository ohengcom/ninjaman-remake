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
	_add_anim(frames, "idle", 8, Color(0.12, 0.14, 0.18), Color(0.75, 0.12, 0.18))
	_add_anim(frames, "run", 8, Color(0.10, 0.12, 0.16), Color(0.85, 0.15, 0.22), true)
	_add_anim(frames, "jump", 4, Color(0.12, 0.14, 0.19), Color(0.9, 0.18, 0.26))
	_add_anim(frames, "fall", 4, Color(0.11, 0.13, 0.17), Color(0.65, 0.1, 0.16))
	_add_anim(frames, "attack", 6, Color(0.13, 0.15, 0.2), Color(0.95, 0.2, 0.28), false, true)
	_add_anim(frames, "wave", 5, Color(0.11, 0.14, 0.2), Color(0.2, 0.85, 1.0), false, true)
	_add_anim(frames, "hurt", 2, Color(0.18, 0.08, 0.09), Color(1.0, 0.25, 0.25))
	sprite.sprite_frames = frames
	sprite.play("idle")

func _add_anim(frames: SpriteFrames, name: StringName, count: int, body: Color, accent: Color, stride := false, blade := false) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, 10.0 if name == "run" else 8.0)
	frames.set_animation_loop(name, name in [&"idle", &"run", &"fall"])
	for i in range(count):
		frames.add_frame(name, _make_character_texture(i, count, body, accent, stride, blade))

func _make_character_texture(index: int, count: int, body: Color, accent: Color, stride: bool, blade: bool) -> Texture2D:
	var image := Image.create(112, 128, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	var t := TAU * float(index) / maxf(1.0, float(count))
	var bob := int(sin(t) * 3.0)
	var leg := int(sin(t) * 10.0) if stride else 0
	_rect(image, 43, 20 + bob, 26, 24, body.darkened(0.25))
	_rect(image, 36, 45 + bob, 40, 48, body)
	_rect(image, 31, 50 + bob, 14, 33, body.darkened(0.15))
	_rect(image, 70, 49 + bob, 14, 35, body.lightened(0.08))
	_rect(image, 37, 87 + bob, 14, 34 + leg, body.darkened(0.25))
	_rect(image, 62, 87 + bob, 14, 34 - leg, body.darkened(0.1))
	_rect(image, 30, 36 + bob, 52, 9, accent)
	_rect(image, 35, 92 + bob, 45, 9, accent.darkened(0.2))
	_rect(image, 47, 28 + bob, 21, 6, Color(0.88, 0.72, 0.55))
	_rect(image, 61, 28 + bob, 10, 5, Color(0.9, 1.0, 0.96))
	if blade:
		_line(image, 73, 64 + bob, 108, 26 + bob - index * 2, Color(0.9, 1.0, 1.0), 3)
	else:
		_line(image, 73, 65 + bob, 95, 38 + bob, Color(0.65, 0.72, 0.76), 2)
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
