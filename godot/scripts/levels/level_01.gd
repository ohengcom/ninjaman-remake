extends Node2D

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyScene := preload("res://scenes/enemies/EnemyGuard.tscn")
const WaveScene := preload("res://scenes/combat/WaveProjectile.tscn")
const HitVfxScene := preload("res://scenes/vfx/HitVfx.tscn")

@onready var platforms: Node2D = $Platforms
@onready var actors: Node2D = $Actors
@onready var projectiles: Node2D = $Projectiles
@onready var vfx: Node2D = $Vfx
@onready var camera: Camera2D = $Camera2D

var player: CharacterBody2D

func _ready() -> void:
	_build_backdrop()
	_build_level_geometry()
	_spawn_player()
	_spawn_enemies()

func _process(_delta: float) -> void:
	if is_instance_valid(player):
		camera.global_position = camera.global_position.lerp(player.global_position + Vector2(260, -120), 0.08)

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
	_add_platform(Vector2(2400, 684), Vector2(4800, 72), Color(0.23, 0.16, 0.11), false)
	_add_platform(Vector2(720, 492), Vector2(280, 34), Color(0.34, 0.24, 0.15), true)
	_add_platform(Vector2(1160, 454), Vector2(300, 34), Color(0.34, 0.24, 0.15), true)
	_add_platform(Vector2(1660, 424), Vector2(320, 34), Color(0.34, 0.24, 0.15), true)
	_add_platform(Vector2(2260, 464), Vector2(320, 34), Color(0.34, 0.24, 0.15), true)

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
	player.global_position = Vector2(180, 612)
	player.wave_cast.connect(_on_player_wave_cast)
	player.hit_landed.connect(_on_hit_landed)
	actors.add_child(player)

func _spawn_enemies() -> void:
	for x in [980, 1540, 2340]:
		var enemy := EnemyScene.instantiate()
		enemy.global_position = Vector2(x, 612)
		enemy.hit_landed.connect(_on_hit_landed)
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
