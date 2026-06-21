extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

var GRAVITY := Balance.GRAVITY
var WALK_SPEED := Balance.BOSS.walk_speed
var RUSH_SPEED := Balance.BOSS.rush_speed
var JUMP_SLAM_VELOCITY := Balance.BOSS.jump_slam_velocity

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var body_shape: CollisionShape2D = $CollisionShape2D

var direction := -1
var max_health := Balance.BOSS.max_health
var health := max_health
var attack_cooldown := 0.0
var hurt_timer := 0.0
var rush_timer := 0.0
var windup_timer := 0.0
var swipe_timer := 0.0
var slam_timer := 0.0
var phase := 1
var music_triggered := false
var attack_has_hit := false

var sm: StateMachine

func _ready() -> void:
	_build_sprite_frames()
	_build_body_shape()
	sprite.position = Vector2(0, -72)
	sprite.scale = Balance.BOSS.scale
	sprite.modulate = Balance.BOSS.tint
	_update_facing()
	add_to_group("enemies")
	add_to_group("boss")
	_setup_state_machine()
	sm.set_state("stalk")

func _setup_state_machine() -> void:
	sm = StateMachine.new(self)
	sm.add_state("stalk", Callable(), _on_stalk_update)
	sm.add_state("windup", _on_windup_enter, _on_windup_update)
	sm.add_state("swipe", _on_swipe_enter, _on_swipe_update)
	sm.add_state("rush", _on_rush_enter, _on_rush_update)
	sm.add_state("slam", _on_slam_enter, _on_slam_update)
	sm.add_state("hurt", Callable(), _on_hurt_update)
	sm.add_transition("stalk", "windup")
	sm.add_transition("stalk", "rush")
	sm.add_transition("stalk", "slam")
	sm.add_transition("windup", "swipe")
	sm.add_transition("swipe", "stalk")
	sm.add_transition("rush", "stalk")
	sm.add_transition("slam", "stalk")
	sm.add_transition("hurt", "stalk")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	attack_cooldown = maxf(0.0, attack_cooldown - delta)
	hurt_timer = maxf(0.0, hurt_timer - delta)
	rush_timer = maxf(0.0, rush_timer - delta)
	windup_timer = maxf(0.0, windup_timer - delta)
	swipe_timer = maxf(0.0, swipe_timer - delta)
	slam_timer = maxf(0.0, slam_timer - delta)
	phase = 3 if health < max_health * Balance.BOSS.phase3_threshold else 2 if health < max_health * Balance.BOSS.phase2_threshold else 1
	if phase >= 2 and hurt_timer > 0.0:
		AudioManager.play_sfx("boss_roar", -3.0)

	var player := get_tree().get_first_node_in_group("player") as Node2D
	if is_instance_valid(player):
		var distance := global_position.distance_to(player.global_position)
		if not music_triggered and distance < Balance.BOSS.engage_distance:
			music_triggered = true
			AudioManager.play_music("boss")
			AudioManager.play_sfx("boss_roar", 0.0)
		direction = 1 if player.global_position.x > global_position.x else -1
		_update_facing()
		if sm.is_in("swipe") or sm.is_in("rush") or sm.is_in("slam"):
			_try_hit_player(player)

	if hurt_timer > 0.0 and not sm.is_in("hurt"):
		sm.set_state("hurt")

	sm.update(delta)
	move_and_slide()

	if health <= 0:
		_play_death_animation()
		return
	_update_animation()

# --- State callbacks ---

func _on_stalk_update(_ctx, _delta: float) -> void:
	var player := get_tree().get_first_node_in_group("player") as Node2D
	if not is_instance_valid(player) or attack_cooldown > 0.0:
		sprite.modulate = Balance.BOSS.tint
		velocity.x = WALK_SPEED * direction
		return
	var distance := global_position.distance_to(player.global_position)
	if distance < Balance.BOSS.melee_distance:
		sm.set_state("windup")
	elif distance < 560.0 and phase >= 2:
		sm.set_state("rush")
	elif distance < 430.0 and phase >= 3 and is_on_floor():
		sm.set_state("slam")
	else:
		sprite.modulate = Balance.BOSS.tint
		velocity.x = WALK_SPEED * direction

func _on_windup_enter(_ctx) -> void:
	windup_timer = 0.42
	velocity.x = 0.0

func _on_windup_update(_ctx, delta: float) -> void:
	sprite.modulate = Color(1.0, 0.26, 0.20)
	velocity.x = move_toward(velocity.x, 0.0, WALK_SPEED * 12.0 * delta)
	if windup_timer <= 0.0:
		sm.set_state("swipe")

func _on_swipe_enter(_ctx) -> void:
	swipe_timer = 0.24
	attack_has_hit = false
	AudioManager.play_sword_sfx()

func _on_swipe_update(_ctx, delta: float) -> void:
	velocity.x = move_toward(velocity.x, RUSH_SPEED * 0.75 * direction, RUSH_SPEED * 8.0 * delta)
	if swipe_timer <= 0.0:
		attack_cooldown = 0.75 if phase >= 3 else 1.1
		sm.set_state("stalk")

func _on_rush_enter(_ctx) -> void:
	rush_timer = 0.58 if phase == 2 else 0.75
	attack_has_hit = false

func _on_rush_update(_ctx, _delta: float) -> void:
	sprite.modulate = Color(1.0, 0.48, 0.34)
	velocity.x = RUSH_SPEED * direction if rush_timer > 0.0 else 0.0
	if rush_timer <= 0.0:
		attack_cooldown = 1.05
		sm.set_state("stalk")

func _on_slam_enter(_ctx) -> void:
	slam_timer = 0.9
	velocity.y = JUMP_SLAM_VELOCITY

func _on_slam_update(_ctx, _delta: float) -> void:
	sprite.modulate = Color(1.0, 0.68, 0.24)
	velocity.x = WALK_SPEED * 1.4 * direction
	if is_on_floor() and velocity.y >= 0.0 and slam_timer < 0.7:
		hit_landed.emit(global_position + Vector2(0, -40))
		attack_cooldown = 1.2
		sm.set_state("stalk")

func _on_hurt_update(_ctx, delta: float) -> void:
	velocity.x = move_toward(velocity.x, 0.0, WALK_SPEED * 10.0 * delta)
	if hurt_timer <= 0.0:
		sm.set_state("stalk")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = 0.14
	sm.set_state("hurt")
	velocity.x = 140.0 * sign(global_position.x - from_x)
	velocity.y = -90.0
	hit_landed.emit(global_position + Vector2(0, -80))
	if health <= 0:
		AudioManager.play_sfx("kill", 0.0)
	else:
		AudioManager.play_sfx("hit", -2.0, randf_range(0.92, 1.03))

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
	var range_x := 108.0 if not sm.is_in("rush") else 132.0
	var range_y := 122.0 if not sm.is_in("slam") else 160.0
	if absf(player.global_position.x - global_position.x) <= range_x and absf(player.global_position.y - global_position.y) <= range_y:
		attack_has_hit = true
		var damage := Balance.BOSS.swipe_damage if sm.is_in("swipe") else Balance.BOSS.rush_damage if sm.is_in("rush") else Balance.BOSS.slam_damage
		player.take_damage(damage, global_position.x)
		hit_landed.emit(player.global_position + Vector2(0, -52))

func _update_animation() -> void:
	if hurt_timer > 0.0:
		sprite.play("hurt")
	elif sm.is_in("windup") or sm.is_in("swipe"):
		sprite.play("attack")
	elif sm.is_in("rush"):
		sprite.play("rush")
	elif sm.is_in("slam"):
		sprite.play("slam")
	else:
		sprite.play("walk")

func _play_death_animation() -> void:
	set_physics_process(false)
	collision_layer = 0
	collision_mask = 0
	sprite.play("death")
	defeated.emit(Balance.BOSS.score_value, global_position + Vector2(0, -80))
	AudioManager.play_music("victory")
	await sprite.animation_finished
	queue_free()
