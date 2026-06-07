extends Node2D

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyScene := preload("res://scenes/enemies/EnemyGuard.tscn")
const BossScene := preload("res://scenes/enemies/BossOni.tscn")
const WaveScene := preload("res://scenes/combat/WaveProjectile.tscn")
const HitVfxScene := preload("res://scenes/vfx/HitVfx.tscn")

const LEVEL_LAYOUT := {
	"spawn": Vector2(180, 612),
	"exit": Vector2(4520, 560),
	"platforms": [
		{ "center": Vector2(2400, 684), "size": Vector2(4800, 72), "semisolid": false },
		{ "center": Vector2(720, 492), "size": Vector2(280, 34), "semisolid": true },
		{ "center": Vector2(1160, 454), "size": Vector2(300, 34), "semisolid": true },
		{ "center": Vector2(1660, 424), "size": Vector2(320, 34), "semisolid": true },
		{ "center": Vector2(2260, 464), "size": Vector2(320, 34), "semisolid": true },
		{ "center": Vector2(3040, 438), "size": Vector2(360, 34), "semisolid": true },
	],
	"enemies": [
		{ "type": "guard", "position": Vector2(980, 612) },
		{ "type": "axe", "position": Vector2(1540, 612) },
		{ "type": "ninja", "position": Vector2(2340, 612) },
		{ "type": "guard", "position": Vector2(3140, 612) },
		{ "type": "boss", "position": Vector2(4000, 586) },
	]
}

@onready var platforms: Node2D = $Platforms
@onready var actors: Node2D = $Actors
@onready var projectiles: Node2D = $Projectiles
@onready var vfx: Node2D = $Vfx
@onready var camera: Camera2D = $Camera2D
@onready var exit_area: Area2D = $ExitArea
@onready var hud = $Hud

var player
var score := 0
var is_finished := false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_backdrop()
	_build_level_geometry()
	_build_exit()
	_spawn_player()
	_spawn_enemies()
	exit_area.body_entered.connect(_on_exit_body_entered)

func _process(_delta: float) -> void:
	if is_instance_valid(player):
		camera.global_position = camera.global_position.lerp(player.global_position + Vector2(260, -120), 0.08)
	if Input.is_action_just_pressed("pause"):
		get_tree().paused = not get_tree().paused

func _build_backdrop() -> void:
	var sky := ColorRect.new()
	sky.color = Color(0.04, 0.07, 0.12)
	sky.size = Vector2(5000, 720)
	sky.position = Vector2(0, 0)
	sky.z_index = -100
	add_child(sky)

	for i in range(12):
		var mountain := Polygon2D.new()
		var x := float(i * 420 - 180)
		mountain.polygon = PackedVector2Array([Vector2(x, 650), Vector2(x + 260, 260 + (i % 3) * 40), Vector2(x + 560, 650)])
		mountain.color = Color(0.08, 0.13, 0.18, 0.85)
		mountain.z_index = -90
		add_child(mountain)

func _build_level_geometry() -> void:
	for platform in LEVEL_LAYOUT["platforms"]:
		var semisolid := bool(platform["semisolid"])
		_add_platform(platform["center"], platform["size"], Color(0.34, 0.24, 0.15) if semisolid else Color(0.23, 0.16, 0.11), semisolid)

func _add_platform(center: Vector2, size: Vector2, color: Color, semisolid: bool) -> void:
	var body := StaticBody2D.new()
	body.position = center
	body.collision_layer = 1
	body.collision_mask = 2 | 4
	body.set_meta("semisolid", semisolid)

	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	shape.shape = rect
	shape.one_way_collision = semisolid
	shape.one_way_collision_margin = 10.0
	body.add_child(shape)

	var visual := ColorRect.new()
	visual.color = color
	visual.size = size
	visual.position = -size / 2.0
	body.add_child(visual)

	var cap := ColorRect.new()
	cap.color = Color(0.32, 0.52, 0.28)
	cap.size = Vector2(size.x, 8)
	cap.position = Vector2(-size.x / 2.0, -size.y / 2.0)
	body.add_child(cap)

	platforms.add_child(body)

func _spawn_player() -> void:
	player = PlayerScene.instantiate()
	player.global_position = LEVEL_LAYOUT["spawn"]
	player.wave_cast.connect(_on_player_wave_cast)
	player.hit_landed.connect(_on_hit_landed)
	player.health_changed.connect(_on_player_health_changed)
	player.died.connect(_on_player_died)
	actors.add_child(player)
	hud.update_health(player.health, player.max_health)

func _spawn_enemies() -> void:
	for enemy_data in LEVEL_LAYOUT["enemies"]:
		var enemy := BossScene.instantiate() if enemy_data["type"] == "boss" else EnemyScene.instantiate()
		if enemy.has_method("configure"):
			enemy.configure(enemy_data["type"])
		enemy.global_position = enemy_data["position"]
		enemy.hit_landed.connect(_on_hit_landed)
		enemy.defeated.connect(_on_enemy_defeated)
		actors.add_child(enemy)

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

func _build_exit() -> void:
	exit_area.global_position = LEVEL_LAYOUT["exit"]
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

func _on_enemy_defeated(points: int, point: Vector2) -> void:
	score += points
	hud.update_score(score)
	_on_hit_landed(point)

func _on_player_health_changed(current: int, max_health: int) -> void:
	hud.update_health(current, max_health)

func _on_player_died() -> void:
	if is_finished:
		return
	is_finished = true
	hud.show_message("YOU DIED - RESTARTING", 1.2)
	await get_tree().create_timer(1.2).timeout
	get_tree().reload_current_scene()

func _on_exit_body_entered(body: Node) -> void:
	if is_finished or body != player:
		return
	is_finished = true
	score += 1000
	hud.update_score(score)
	hud.show_message("ACT CLEAR", 2.0)
