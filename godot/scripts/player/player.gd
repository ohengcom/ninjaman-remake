extends CharacterBody2D

signal wave_cast(origin: Vector2, direction: int)
signal hit_landed(point: Vector2)
signal health_changed(current: int, max_health: int)
signal died

var GRAVITY := Balance.GRAVITY
var RUN_SPEED := Balance.PLAYER.run_speed
var AIR_SPEED := Balance.PLAYER.air_speed
var JUMP_VELOCITY := Balance.PLAYER.jump_velocity
var DOUBLE_JUMP_VELOCITY := Balance.PLAYER.double_jump_velocity
var DASH_SPEED := Balance.PLAYER.dash_speed
var DASH_TIME := Balance.PLAYER.dash_time
var DASH_COOLDOWN := Balance.PLAYER.dash_cooldown
var ATTACK_TIME := Balance.PLAYER.attack_time
var ATTACK_ACTIVE_START := Balance.PLAYER.attack_active_start
var ATTACK_ACTIVE_END := Balance.PLAYER.attack_active_end
var WAVE_COOLDOWN := Balance.PLAYER.wave_cooldown
var COYOTE_TIME := Balance.PLAYER.coyote_time
var JUMP_BUFFER_TIME := Balance.PLAYER.jump_buffer_time
var HURT_INVULNERABLE_TIME := Balance.PLAYER.hurt_invulnerable_time
var HURT_LOCK_TIME := Balance.PLAYER.hurt_lock_time
var ATTACK_DAMAGE := Balance.PLAYER.attack_damage
var MAX_JUMPS := Balance.PLAYER.max_jumps

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_shape: CollisionShape2D = $AttackArea/AttackShape
@onready var animation_tree: AnimationTree = $AnimationTree
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var body_shape: CollisionShape2D = $CollisionShape2D

var sword_overlay: Sprite2D
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
var max_health := Balance.PLAYER.max_health
var health := max_health
var is_dead := false
var hit_targets: Array[Node] = []

var sm: StateMachine

func _ready() -> void:
	_build_sprite_frames()
	_build_attack_shape()
	_build_body_shape()
	_build_sword_overlay()
	sprite.position = Vector2(0, -44)
	sprite.scale = Vector2(3.0, 3.0)
	attack_area.body_entered.connect(_on_attack_body_entered)
	animation_tree.active = false
	animation_player.playback_active = true
	add_to_group("player")
	_setup_state_machine()
	sm.set_state("ground")

func _setup_state_machine() -> void:
	# Player uses a hybrid model: the state machine selects the active movement
	# mode + animation, while concurrent timers (dash/attack/hurt/wave) drive
	# sub-state behavior. This mirrors the Phaser Player hybrid approach and
	# preserves the original feel where dash > hurt > attack > normal movement.
	sm = StateMachine.new(self)
	sm.add_state("ground", Callable(), _on_ground_update)
	sm.add_state("air", Callable(), _on_air_update)
	sm.add_state("attack", Callable(), _on_attack_update)
	sm.add_state("hurt", Callable(), _on_hurt_update)
	sm.add_state("dash", Callable(), _on_dash_update)
	sm.add_state("dead", _on_dead_enter, _on_dead_update)

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
	_resolve_state()
	sm.update(delta)
	move_and_slide()
	_handle_landing_feedback()
	_update_animation()

## Picks the active movement-mode state by priority, mirroring the original
## _apply_movement() precedence: dash > hurt > attack > air/ground.
func _resolve_state() -> void:
	if dash_timer > 0.0:
		if not sm.is_in("dash"):
			sm.set_state("dash")
	elif hurt_lock_timer > 0.0:
		if not sm.is_in("hurt"):
			sm.set_state("hurt")
	elif attack_timer > 0.06:
		if not sm.is_in("attack"):
			sm.set_state("attack")
	elif not is_on_floor():
		if not sm.is_in("air"):
			sm.set_state("air")
	else:
		if not sm.is_in("ground"):
			sm.set_state("ground")

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
		AudioManager.play_sfx("jump", -6.0)
	elif jumps_used < MAX_JUMPS:
		velocity.y = DOUBLE_JUMP_VELOCITY
		jumps_used += 1
		jump_buffer_timer = 0.0
		AudioManager.play_sfx("jump", -8.0, 1.15)

func _handle_dash() -> void:
	if Input.is_action_just_pressed("dash") and dash_timer <= 0.0 and dash_cooldown <= 0.0:
		dash_timer = DASH_TIME
		dash_cooldown = DASH_COOLDOWN
		invulnerable_timer = maxf(invulnerable_timer, DASH_TIME + 0.04)
		afterimage_timer = 0.0
		velocity.x = DASH_SPEED * facing
		AudioManager.play_sfx("dash", -4.0)

func _handle_attacks() -> void:
	if Input.is_action_just_pressed("attack") and attack_timer <= 0.0:
		attack_timer = ATTACK_TIME
		hit_targets.clear()
		sprite.play("attack")
		AudioManager.play_sword_sfx()
		_swing_sword()
	if Input.is_action_just_pressed("wave") and wave_cooldown <= 0.0:
		wave_cooldown = WAVE_COOLDOWN
		sprite.play("wave")
		wave_cast.emit(global_position, facing)
		AudioManager.play_sfx("wave", -4.0)

func _on_ground_update(_ctx, delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
		return
	var input_x := Input.get_axis("move_left", "move_right")
	velocity.x = move_toward(velocity.x, input_x * RUN_SPEED, RUN_SPEED * 10.0 * delta)

func _on_air_update(_ctx, delta: float) -> void:
	velocity.y += GRAVITY * delta
	var input_x := Input.get_axis("move_left", "move_right")
	velocity.x = move_toward(velocity.x, input_x * AIR_SPEED, AIR_SPEED * 10.0 * delta)

func _on_attack_update(_ctx, delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	velocity.x = move_toward(velocity.x, 0.0, RUN_SPEED * 8.0 * delta)

func _on_hurt_update(_ctx, delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	velocity.x = move_toward(velocity.x, 0.0, RUN_SPEED * 6.0 * delta)

func _on_dash_update(_ctx, delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	if afterimage_timer <= 0.0:
		_spawn_afterimage()
		afterimage_timer = 0.045

func _on_dead_enter(_ctx) -> void:
	set_physics_process(false)

func _on_dead_update(_ctx, delta: float) -> void:
	velocity.y += GRAVITY * delta

func _apply_movement(_delta: float) -> void:
	# Deprecated: movement is now driven by state callbacks (_on_*_update).
	# Kept as no-op to avoid breaking any external callers.
	pass

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
	hurt_lock_timer = HURT_LOCK_TIME
	velocity.x = 360.0 * sign(global_position.x - from_x)
	velocity.y = -210.0
	sprite.play("hurt")
	if health <= 0:
		is_dead = true
		AudioManager.play_sfx("death", -2.0)
		sprite.play("death")
		died.emit()
	else:
		AudioManager.play_sfx("hurt", -3.0)

func heal(amount: int) -> void:
	if is_dead:
		return
	health = mini(max_health, health + amount)
	health_changed.emit(health, max_health)

func _on_attack_body_entered(body: Node) -> void:
	if attack_shape.disabled or hit_targets.has(body) or not body.has_method("take_damage"):
		return
	hit_targets.append(body)
	body.take_damage(ATTACK_DAMAGE, global_position.x)
	hit_landed.emit(body.global_position + Vector2(0, -48))
	AudioManager.play_sfx("hit", -3.0, randf_range(0.95, 1.06))
	AudioManager.hit_stop(0.05, 0.12)

func _handle_landing_feedback() -> void:
	if is_on_floor() and not landed_last_frame and velocity.y >= 0.0:
		hit_landed.emit(global_position + Vector2(0, -10))
		AudioManager.play_sfx("land", -10.0, randf_range(0.95, 1.05))
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
	rect.size = Vector2(86, 54)
	attack_shape.shape = rect
	attack_shape.position = Vector2(54, -42)
	attack_shape.disabled = true

func _build_body_shape() -> void:
	var rect := RectangleShape2D.new()
	rect.size = Vector2(34, 66)
	body_shape.shape = rect
	body_shape.position = Vector2(0, -33)

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	var base := "res://assets/characters/dungeon_sprites/mHero_/"
	_add_dir_anim(frames, "idle", base + "idle_/", "rIdle", 4, 8.0, true)
	_add_dir_anim(frames, "run", base + "walkRun_/", "rWalkRun", 4, 13.0, true)
	_add_dir_anim(frames, "jump", base + "jump_/", "rJump", 4, 10.0, false)
	_add_dir_anim(frames, "fall", base + "jump_/", "rJump", 4, 8.0, true)
	_add_dir_anim(frames, "attack", base + "turn_/", "rTurn", 4, 16.0, false)
	_add_dir_anim(frames, "wave", base + "turn_/", "rTurn", 4, 16.0, false)
	_add_dir_anim(frames, "hurt", base + "hurt_/", "rHurt", 4, 12.0, false)
	_add_dir_anim(frames, "death", base + "death_/", "rDeath", 4, 9.0, false)
	sprite.sprite_frames = frames
	sprite.play("idle")

func _add_dir_anim(frames: SpriteFrames, name: StringName, directory: String, prefix: String, count: int, fps: float, loop: bool) -> void:
	frames.add_animation(name)
	frames.set_animation_speed(name, fps)
	frames.set_animation_loop(name, loop)
	for i in range(count):
		var texture := load("%s%s_%d.png" % [directory, prefix, i])
		if texture:
			frames.add_frame(name, texture)

func _build_sword_overlay() -> void:
	sword_overlay = Sprite2D.new()
	sword_overlay.texture = load("res://assets/characters/dungeon_sprites/weapons_/rSword.png")
	sword_overlay.position = Vector2(42, -42)
	sword_overlay.scale = Vector2(3.0, 3.0)
	sword_overlay.z_index = 1
	sword_overlay.visible = false
	add_child(sword_overlay)

func _swing_sword() -> void:
	if not sword_overlay:
		return
	sword_overlay.visible = true
	sword_overlay.position = Vector2(42 * facing, -42)
	sword_overlay.rotation = -0.8 * facing
	sword_overlay.flip_h = facing < 0
	var tween := create_tween()
	tween.tween_property(sword_overlay, "rotation", 0.6 * facing, 0.12).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_callback(func(): sword_overlay.visible = false)
