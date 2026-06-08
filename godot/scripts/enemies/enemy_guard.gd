extends CharacterBody2D

signal hit_landed(point: Vector2)
signal defeated(points: int, point: Vector2)

const GRAVITY := 1800.0
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var body_shape: CollisionShape2D = $CollisionShape2D

enum State { PATROL, CHASE, WINDUP, ATTACK, HURT }

var enemy_type := "guard"
var direction := -1
var max_health := 45
var health := max_health
var hurt_timer := 0.0
var windup_timer := 0.0
var attack_timer := 0.0
var attack_cooldown := 0.0
var walk_speed := 90.0
var chase_speed := 130.0
var attack_range := 74.0
var detect_range := 360.0
var attack_damage := 12
var score_value := 150
var sprite_tint := Color.WHITE
var sprite_scale := Vector2(3.0, 3.0)
var character_key := "goblin_"
var state := State.PATROL
var home_x := 0.0
var patrol_radius := 260.0
var attack_has_hit := false

func configure(type_name: String) -> void:
	enemy_type = type_name
	if enemy_type == "axe":
		max_health = 70
		walk_speed = 64.0
		chase_speed = 98.0
		attack_range = 88.0
		attack_damage = 18
		score_value = 220
		sprite_tint = Color(1.0, 0.88, 0.74)
		sprite_scale = Vector2(3.35, 3.35)
		character_key = "orc_"
	elif enemy_type == "ninja":
		max_health = 34
		walk_speed = 145.0
		chase_speed = 230.0
		attack_range = 132.0
		attack_damage = 10
		score_value = 260
		sprite_tint = Color(0.72, 0.92, 1.0)
		sprite_scale = Vector2(3.0, 3.0)
		character_key = "skeleton_"
	else:
		max_health = 45
		walk_speed = 90.0
		chase_speed = 138.0
		attack_range = 74.0
		attack_damage = 12
		score_value = 150
		sprite_tint = Color(0.9, 1.0, 0.82)
		sprite_scale = Vector2(3.0, 3.0)
		character_key = "goblin_"
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

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	hurt_timer = maxf(0.0, hurt_timer - delta)
	windup_timer = maxf(0.0, windup_timer - delta)
	attack_timer = maxf(0.0, attack_timer - delta)
	attack_cooldown = maxf(0.0, attack_cooldown - delta)

	var player := get_tree().get_first_node_in_group("player") as Node2D
	var distance_to_player := INF
	if is_instance_valid(player):
		distance_to_player = global_position.distance_to(player.global_position)
		if state != State.HURT and state != State.WINDUP and state != State.ATTACK and distance_to_player < detect_range:
			state = State.CHASE
			_set_direction_to(player.global_position.x)

	if hurt_timer > 0.0:
		state = State.HURT
		velocity.x = move_toward(velocity.x, 0.0, walk_speed * 8.0 * delta)
	elif state == State.WINDUP:
		velocity.x = move_toward(velocity.x, 0.0, walk_speed * 10.0 * delta)
		sprite.modulate = Color(1.0, 0.34, 0.28)
		if windup_timer <= 0.0:
			state = State.ATTACK
			attack_timer = 0.18
			attack_has_hit = false
	elif state == State.ATTACK:
		velocity.x = move_toward(velocity.x, chase_speed * 1.6 * direction, chase_speed * 16.0 * delta)
		_try_hit_player(player)
		if attack_timer <= 0.0:
			attack_cooldown = 0.9 if enemy_type != "ninja" else 0.55
			state = State.CHASE
	elif state == State.CHASE and is_instance_valid(player):
		sprite.modulate = sprite_tint
		_set_direction_to(player.global_position.x)
		if distance_to_player <= attack_range and attack_cooldown <= 0.0:
			state = State.WINDUP
			windup_timer = 0.34 if enemy_type == "axe" else 0.22
			velocity.x = 0.0
		elif distance_to_player > detect_range * 1.5:
			state = State.PATROL
		else:
			velocity.x = chase_speed * direction
	else:
		state = State.PATROL
		sprite.modulate = sprite_tint
		velocity.x = walk_speed * direction
		if is_on_wall() or absf(global_position.x - home_x) > patrol_radius:
			direction *= -1
		_update_facing()
	move_and_slide()
	if health <= 0:
		defeated.emit(score_value, global_position + Vector2(0, -48))
		queue_free()
	elif hurt_timer > 0.0:
		sprite.play("hurt")
	elif state == State.WINDUP or state == State.ATTACK:
		sprite.play("attack")
	else:
		sprite.play("walk")

func take_damage(amount: int, from_x: float) -> void:
	health -= amount
	hurt_timer = 0.2
	state = State.HURT
	velocity.x = 220.0 * sign(global_position.x - from_x)
	velocity.y = -150.0
	hit_landed.emit(global_position + Vector2(0, -48))

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
