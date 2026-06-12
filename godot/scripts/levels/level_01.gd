extends Node2D

signal level_completed
signal return_to_menu_requested

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyScene := preload("res://scenes/enemies/EnemyGuard.tscn")
const BossScene := preload("res://scenes/enemies/BossOni.tscn")
const WaveScene := preload("res://scenes/combat/WaveProjectile.tscn")
const HitVfxScene := preload("res://scenes/vfx/HitVfx.tscn")
const CoinScene := preload("res://scenes/pickups/Coin.tscn")
const HeartScene := preload("res://scenes/pickups/Heart.tscn")
const FireScene := preload("res://scenes/hazards/FireHazard.tscn")

const LEVEL_WIDTH := 11520.0
const CELL := 48.0

@onready var platforms: Node2D = $Platforms
@onready var actors: Node2D = $Actors
@onready var projectiles: Node2D = $Projectiles
@onready var vfx: Node2D = $Vfx
@onready var pickups: Node2D = $Pickups
@onready var hazards: Node2D = $Hazards
@onready var camera: Camera2D = $Camera2D
@onready var hud = $Hud

var player
var score := 0
var is_finished := false
var checkpoint_areas: Array[Area2D] = []
var camera_shake := 0.0
var camera_base_position := Vector2.ZERO

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_level()
	_spawn_player()
	_spawn_enemies()
	_spawn_pickups()
	_spawn_hazards()
	_build_exit()
	score = GameState.score
	hud.update_score(score)
	hud.update_coins(GameState.coins)
	GameState.coins_changed.connect(func(c): hud.update_coins(c))
	AudioManager.play_music("level")

func _process(delta: float) -> void:
	if is_instance_valid(player):
		var lookahead := Vector2(260 * player.facing, -120)
		camera_base_position = camera.global_position.lerp(player.global_position + lookahead, 0.08)
		camera.global_position = camera_base_position + _shake_offset()
		camera_shake = maxf(0.0, camera_shake - delta * 8.0)
		camera.limit_left = 0
		camera.limit_right = int(LEVEL_WIDTH)
		camera.limit_top = -200
		camera.limit_bottom = 900
	if Input.is_action_just_pressed("pause"):
		get_tree().paused = not get_tree().paused
		hud.set_pause_visible(get_tree().paused)
		if get_tree().paused:
			AudioManager.play_sfx("pause")

func _build_level() -> void:
	var builder := ForestLevelBuilder.new()
	builder.build_backdrop(self, LEVEL_WIDTH)
	var terrain := builder.make_terrain_layer(self, "Terrain", -10)
	# Screen 1-2: Starting ground + first platforms
	builder.paint_ground(terrain, 0, 30, 13, 22)
	builder.add_ground_collision(platforms, 0, 30, 13)
	builder.paint_island(terrain, 14, 6, 9)
	builder.add_one_way_rect(platforms, Rect2(14 * CELL, 9 * CELL, 6 * CELL, CELL))
	builder.paint_leaf_platform(terrain, 22, 4, 7)
	builder.add_one_way_rect(platforms, Rect2(22 * CELL, 7 * CELL, 4 * CELL, CELL))
	# Screen 3: Rising platforms
	builder.paint_ground(terrain, 30, 48, 13, 22)
	builder.add_ground_collision(platforms, 30, 48, 13)
	builder.paint_island(terrain, 32, 5, 10)
	builder.add_one_way_rect(platforms, Rect2(32 * CELL, 10 * CELL, 5 * CELL, CELL))
	builder.paint_island(terrain, 39, 5, 7)
	builder.add_one_way_rect(platforms, Rect2(39 * CELL, 7 * CELL, 5 * CELL, CELL))
	# Screen 4: Gap + high path
	builder.paint_ground(terrain, 54, 80, 13, 22)
	builder.add_ground_collision(platforms, 54, 80, 13)
	builder.paint_leaf_platform(terrain, 50, 3, 10)
	builder.add_one_way_rect(platforms, Rect2(50 * CELL, 10 * CELL, 3 * CELL, CELL))
	builder.paint_island(terrain, 58, 6, 6)
	builder.add_one_way_rect(platforms, Rect2(58 * CELL, 6 * CELL, 6 * CELL, CELL))
	builder.paint_island(terrain, 68, 6, 9)
	builder.add_one_way_rect(platforms, Rect2(68 * CELL, 9 * CELL, 6 * CELL, CELL))
	# Screen 5-6: Long ground with vertical branch
	builder.paint_ground(terrain, 80, 130, 13, 22)
	builder.add_ground_collision(platforms, 80, 130, 13)
	builder.paint_island(terrain, 90, 8, 8)
	builder.add_one_way_rect(platforms, Rect2(90 * CELL, 8 * CELL, 8 * CELL, CELL))
	builder.paint_island(terrain, 94, 4, 4)
	builder.add_one_way_rect(platforms, Rect2(94 * CELL, 4 * CELL, 4 * CELL, CELL))
	builder.paint_leaf_platform(terrain, 110, 5, 10)
	builder.add_one_way_rect(platforms, Rect2(110 * CELL, 10 * CELL, 5 * CELL, CELL))
	# Screen 7: Pit with fire hazards
	builder.paint_ground(terrain, 136, 160, 13, 22)
	builder.add_ground_collision(platforms, 136, 160, 13)
	builder.paint_leaf_platform(terrain, 142, 4, 9)
	builder.add_one_way_rect(platforms, Rect2(142 * CELL, 9 * CELL, 4 * CELL, CELL))
	builder.paint_leaf_platform(terrain, 150, 4, 9)
	builder.add_one_way_rect(platforms, Rect2(150 * CELL, 9 * CELL, 4 * CELL, CELL))
	# Screen 8-9: Boss approach with brick walls
	builder.paint_ground(terrain, 160, 220, 13, 22)
	builder.add_ground_collision(platforms, 160, 220, 13)
	var wall_layer := builder.make_terrain_layer(self, "WallDecor", -15, Color(0.75, 0.75, 0.75))
	builder.paint_brick_wall(wall_layer, 170, 200, 3, 12)
	builder.paint_island(terrain, 180, 7, 9)
	builder.add_one_way_rect(platforms, Rect2(180 * CELL, 9 * CELL, 7 * CELL, CELL))
	builder.paint_island(terrain, 192, 7, 6)
	builder.add_one_way_rect(platforms, Rect2(192 * CELL, 6 * CELL, 7 * CELL, CELL))
	# Screen 10: Boss arena
	builder.paint_ground(terrain, 220, 240, 13, 22)
	builder.add_ground_collision(platforms, 220, 240, 13)
	builder.paint_brick_wall(wall_layer, 220, 240, 2, 14)
	# Decor
	for x in [4, 8, 16, 28, 35, 56, 62, 75, 88, 102, 118, 125, 140, 155, 168, 185, 198, 215, 228, 235]:
		builder.add_decor(self, "bush_green", Vector2(x * CELL, 13 * CELL), -5)
	for x in [10, 24, 42, 70, 82, 96, 108, 134, 148, 162, 176, 190, 205, 222, 232]:
		builder.add_grass_tuft(self, Vector2(x * CELL, 13 * CELL))
	for x in [18, 64, 112, 158, 202]:
		builder.add_decor(self, "pine_big", Vector2(x * CELL, 13 * CELL), -6)
	for x in [172, 224]:
		builder.add_decor(self, "pillar", Vector2(x * CELL, 13 * CELL), -5)
	_build_checkpoints()

func _build_checkpoints() -> void:
	var checkpoints := [
		{"pos": Vector2(37 * CELL, 13 * CELL), "label": "CHECKPOINT: CLIMB"},
		{"pos": Vector2(105 * CELL, 13 * CELL), "label": "CHECKPOINT: MIDPOINT"},
		{"pos": Vector2(175 * CELL, 13 * CELL), "label": "CHECKPOINT: RUINS"},
	]
	for cp in checkpoints:
		var area := Area2D.new()
		area.global_position = cp["pos"]
		area.collision_layer = 0
		area.collision_mask = 2
		area.set_meta("label", cp["label"])
		var shape := CollisionShape2D.new()
		var rect := RectangleShape2D.new()
		rect.size = Vector2(88, 160)
		shape.shape = rect
		area.add_child(shape)
		var marker := ColorRect.new()
		marker.color = Color(0.1, 1.0, 0.58, 0.18)
		marker.size = Vector2(64, 132)
		marker.position = Vector2(-32, -132)
		area.add_child(marker)
		area.body_entered.connect(_on_checkpoint_entered.bind(area))
		checkpoint_areas.append(area)
		add_child(area)

func _on_checkpoint_entered(body: Node, area: Area2D) -> void:
	if body != player:
		return
	GameState.set_checkpoint(area.global_position, player.health)
	hud.show_message(String(area.get_meta("label")), 1.2)
	AudioManager.play_sfx("checkpoint")
	area.queue_free()

func _spawn_player() -> void:
	player = PlayerScene.instantiate()
	player.global_position = GameState.get_spawn(Vector2(180, 13 * CELL))
	player.health = GameState.checkpoint_health
	player.wave_cast.connect(_on_player_wave_cast)
	player.hit_landed.connect(_on_hit_landed)
	player.health_changed.connect(_on_player_health_changed)
	player.died.connect(_on_player_died)
	actors.add_child(player)
	hud.update_health(player.health, player.max_health)

func _spawn_enemies() -> void:
	var enemies := [
		{"type": "guard", "pos": Vector2(20 * CELL, 13 * CELL)},
		{"type": "axe", "pos": Vector2(43 * CELL, 13 * CELL)},
		{"type": "ninja", "pos": Vector2(72 * CELL, 13 * CELL)},
		{"type": "guard", "pos": Vector2(100 * CELL, 13 * CELL)},
		{"type": "axe", "pos": Vector2(122 * CELL, 13 * CELL)},
		{"type": "ninja", "pos": Vector2(145 * CELL, 13 * CELL)},
		{"type": "guard", "pos": Vector2(165 * CELL, 13 * CELL)},
		{"type": "axe", "pos": Vector2(188 * CELL, 13 * CELL)},
		{"type": "boss", "pos": Vector2(230 * CELL, 13 * CELL)},
	]
	for e in enemies:
		var enemy := BossScene.instantiate() if e["type"] == "boss" else EnemyScene.instantiate()
		if enemy.has_method("configure"):
			enemy.configure(e["type"])
		enemy.global_position = e["pos"]
		enemy.hit_landed.connect(_on_hit_landed)
		enemy.defeated.connect(_on_enemy_defeated)
		actors.add_child(enemy)

func _spawn_pickups() -> void:
	var coins := [
		Vector2(16 * CELL, 9 * CELL), Vector2(23 * CELL, 7 * CELL), Vector2(33 * CELL, 10 * CELL),
		Vector2(40 * CELL, 7 * CELL), Vector2(60 * CELL, 6 * CELL), Vector2(70 * CELL, 9 * CELL),
		Vector2(92 * CELL, 8 * CELL), Vector2(95 * CELL, 4 * CELL), Vector2(112 * CELL, 10 * CELL),
		Vector2(143 * CELL, 9 * CELL), Vector2(151 * CELL, 9 * CELL), Vector2(182 * CELL, 9 * CELL),
		Vector2(194 * CELL, 6 * CELL),
	]
	for pos in coins:
		var coin := CoinScene.instantiate()
		coin.global_position = pos
		pickups.add_child(coin)
	var hearts := [
		Vector2(50 * CELL, 10 * CELL), Vector2(96 * CELL, 4 * CELL), Vector2(195 * CELL, 6 * CELL),
	]
	for pos in hearts:
		var heart := HeartScene.instantiate()
		heart.global_position = pos
		pickups.add_child(heart)

func _spawn_hazards() -> void:
	for x in [131, 132, 133, 134]:
		var fire := FireScene.instantiate()
		fire.global_position = Vector2(x * CELL, 13 * CELL)
		hazards.add_child(fire)

func _on_player_wave_cast(origin: Vector2, direction: int) -> void:
	var wave := WaveScene.instantiate()
	wave.global_position = origin + Vector2(58 * direction, -48)
	wave.direction = direction
	wave.hit_landed.connect(_on_hit_landed)
	projectiles.add_child(wave)

func _on_hit_landed(point: Vector2) -> void:
	var effect := HitVfxScene.instantiate()
	effect.global_position = point
	vfx.add_child(effect)
	camera_shake = minf(1.0, camera_shake + 0.22)

func _build_exit() -> void:
	var exit_area := Area2D.new()
	exit_area.name = "ExitArea"
	exit_area.global_position = Vector2(238 * CELL, 13 * CELL - 75)
	exit_area.collision_layer = 0
	exit_area.collision_mask = 2
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(86, 150)
	shape.shape = rect
	exit_area.add_child(shape)
	var marker := ColorRect.new()
	marker.color = Color(0.2, 0.85, 1.0, 0.28)
	marker.size = Vector2(86, 150)
	marker.position = Vector2(-43, -75)
	exit_area.add_child(marker)
	exit_area.body_entered.connect(_on_exit_body_entered)
	add_child(exit_area)

func _on_enemy_defeated(points: int, point: Vector2) -> void:
	score = GameState.add_score(points)
	hud.update_score(score)
	_on_hit_landed(point)

func _on_player_health_changed(current: int, max_health: int) -> void:
	hud.update_health(current, max_health)
	hud.flash_damage()
	camera_shake = minf(1.2, camera_shake + 0.45)

func _on_player_died() -> void:
	if is_finished:
		return
	is_finished = true
	hud.show_message("YOU DIED - TAP SPACE TO RETRY", 0.65)
	await get_tree().create_timer(0.65).timeout
	GameState.restart_current_level()
	get_tree().reload_current_scene()

func _on_exit_body_entered(body: Node) -> void:
	if is_finished or body != player:
		return
	is_finished = true
	score = GameState.add_score(1000)
	hud.update_score(score)
	hud.show_message("ACT CLEAR", 2.0)
	AudioManager.play_sfx("clear")
	level_completed.emit()

func _shake_offset() -> Vector2:
	if camera_shake <= 0.0:
		return Vector2.ZERO
	var t := Time.get_ticks_msec() * 0.021
	return Vector2(sin(t * 1.7), cos(t * 2.1)) * camera_shake * 12.0
