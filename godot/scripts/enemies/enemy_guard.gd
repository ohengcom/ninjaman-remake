extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

var GRAVITY := Balance.GRAVITY
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var body_shape: CollisionShape2D = $CollisionShape2D

var enemy_type := "guard"
var direction := -1
var max_health := 45
var health := max_health
var hurt_timer := 0.0
var windup_timer := 0.0
var attack_timer := 0.0
var attack_cooldown := 0.0
var walk_speed := 90.0
var chase_speed := 138.0
var attack_range := 74.0
var detect_range := Balance.ENEMY_COMMON.detect_range
var attack_damage := 12
var score_value := 150
var windup_time := 0.22
var cooldown_after_attack := 0.9
var sprite_tint := Color.WHITE
var sprite_scale := Vector2(3.0, 3.0)
var character_key := "goblin_"
var home_x := 0.0
var patrol_radius := Balance.ENEMY_COMMON.patrol_radius
var attack_has_hit := false

var sm: StateMachine

func configure(type_name: String) -> void:
	enemy_type = type_name
	var stats: Dictionary = Balance.enemy_stats(type_name)
	max_health = stats.max_health
	walk_speed = stats.walk_speed
	chase_speed = stats.chase_speed
	attack_range = stats.attack_range
	attack_damage = stats.attack_damage
	score_value = stats.score_value
	windup_time = stats.windup_time
	cooldown_after_attack = stats.attack_cooldown
	sprite_tint = stats.tint
	sprite_scale = stats.scale
	character_key = stats.character_key
	health = max_health

func _ready() -> void:
	_build_sprite_frames()
	_build_body_shape()
	sprite.position = Vector2(0, -42)
	sprite.scale = sprite_scale
	sprite.modulate = sprite_tint
	home_x = global_position.x
	_update_facing()
	add_to_group("enemies")
	_setup_state_machine()
	sm.set_state("patrol")

func _setup_state_machine() -> void:
	sm = StateMachine.new(self)
	sm.add_state("patrol", Callable(), _on_patrol_update)
	sm.add_state("chase", Callable(), _on_chase_update)
	sm.add_state("windup", _on_windup_enter, _on_windup_update)
	sm.add_state("attack", _on_attack_enter, _on_attack_update)
	sm.add_state("hurt", Callable(), _on_hurt_update)
	sm.add_transition("patrol", "chase")
	sm.add_transition("chase", "windup")
	sm.add_transition("chase", "patrol")
	sm.add_transition("windup", "attack")
	sm.add_transition("attack", "chase")
	sm.add_transition("hurt", "patrol")
	sm.add_transition("hurt", "chase")

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	hurt_timer = maxf(0.0, hurt_timer - delta)
	windup_timer = maxf(0.0, windup_timer - delta)
	attack_timer = maxf(0.0, attack_timer - delta)
	attack_cooldown = maxf(0.0, attack_cooldown - delta)

	# Hurt overrides any state (manual interrupt — mirrors original).
	if hurt_timer > 0.0 and not sm.is_in("hurt"):
		sm.set_state("hurt")

	var player := get_tree().get_first_node_in_group("player") as Node2D
	var distance_to_player := INF
	if is_instance_valid(player):
		distance_to_player = global_position.distance_to(player.global_position)
		if not sm.is_in("hurt") and not sm.is_in("windup") and not sm.is_in("attack") and distance_to_player < detect_range:
			_set_direction_to(player.global_position.x)
			if not sm.is_in("chase"):
				sm.set_state("chase")

	sm.update(delta)
	move_and_slide()

	if health <= 0:
		_play_death_animation()
		return
	_update_animation()

# --- State callbacks ---

func _on_patrol_update(_ctx, _delta: float) -> void:
	sprite.modulate = sprite_tint
	velocity.x = walk_speed * direction
	if is_on_wall() or absf(global_position.x - home_x) > patrol_radius:
		direction *= -1
	_update_facing()

func _on_chase_update(_ctx, _delta: float) -> void:
	var player := get_tree().get_first_node_in_group("player") as Node2D
	if not is_instance_valid(player):
		sm.set_state("patrol")
		return
	sprite.modulate = sprite_tint
	_set_direction_to(player.global_position.x)
	var distance_to_player := global_position.distance_to(player.global_position)
	if distance_to_player <= attack_range and attack_cooldown <= 0.0:
		sm.set_state("windup")
	elif distance_to_player > detect_range * 1.5:
		sm.set_state("patrol")
	else:
		velocity.x = chase_speed * direction

func _on_windup_enter(_ctx) -> void:
	windup_timer = windup_time
	velocity.x = 0.0

func _on_windup_update(_ctx, delta: float) -> void:
	velocity.x = move_toward(velocity.x, 0.0, walk_speed * 10.0 * delta)
	sprite.modulate = Color(1.0, 0.34, 0.28)
	if windup_timer <= 0.0:
		sm.set_state("attack")

func _on_attack_enter(_ctx) -> void:
	attack_timer = 0.18
	attack_has_hit = false
	AudioManager.play_sword_sfx()

func _on_attack_update(_ctx, delta: float) -> void:
	var player := get_tree().get_first_node_in_group("player") as Node2D
	velocity.x = move_toward(velocity.x, chase_speed * 1.6 * direction, chase_speed * 16.0 * delta)
	_try_hit_player(player)
	if attack_timer <= 0.0:
		attack_cooldown = cooldown_after_attack
		sm.set_state("chase")

func _on_hurt_update(_ctx, delta: float) -> void:
	velocity.x = move_toward(velocity.x, 0.0, walk_speed * 8.0 * delta)
	if hurt_timer <= 0.0:
		sm.set_state("chase")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = Balance.ENEMY_COMMON.hurt_time
	sm.set_state("hurt")
	velocity.x = 220.0 * sign(global_position.x - from_x)
	velocity.y = -150.0
	hit_landed.emit(global_position + Vector2(0, -48))
	if health <= 0:
		AudioManager.play_sfx("kill", -2.0)
	else:
		AudioManager.play_sfx("hit", -3.0, randf_range(0.94, 1.05))

func _build_sprite_frames() -> void:
	var frames := SpriteFrames.new()
	var base := "res://assets/characters/dungeon_sprites/%s/" % character_key
	_add_dir_anim(frames, "walk", base + "walkRun_/", "lWalkRun", 4, 9.0, true)
	_add_dir_anim(frames, "attack", base + "turn_/", "lTurn", 4, 13.0, true)
	_add_dir_anim(frames, "hurt", base + "hurt_/", "lHurt", 4, 10.0, false)
	_add_dir_anim(frames, "death", base + "death_/", "lDeath", 4, 9.0, false)
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
	rect.size = Vector2(34, 62) if enemy_type != "axe" else Vector2(42, 70)
	body_shape.shape = rect
	body_shape.position = Vector2(0, -31) if enemy_type != "axe" else Vector2(0, -35)

func _set_direction_to(x: float) -> void:
	direction = 1 if x > global_position.x else -1
	_update_facing()

func _try_hit_player(player: Node2D) -> void:
	if attack_has_hit or not is_instance_valid(player) or not player.has_method("take_damage"):
		return
	if absf(player.global_position.x - global_position.x) <= attack_range + 18.0 and absf(player.global_position.y - global_position.y) <= 92.0:
		attack_has_hit = true
		player.take_damage(attack_damage, global_position.x)
		hit_landed.emit(player.global_position + Vector2(0, -52))

func _update_animation() -> void:
	if hurt_timer > 0.0:
		sprite.play("hurt")
	elif sm.is_in("windup") or sm.is_in("attack"):
		sprite.play("attack")
	else:
		sprite.play("walk")

func _play_death_animation() -> void:
	set_physics_process(false)
	collision_layer = 0
	collision_mask = 0
	sprite.play("death")
	defeated.emit(score_value, global_position + Vector2(0, -48))
	await sprite.animation_finished
	queue_free()
