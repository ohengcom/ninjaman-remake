extends Node2D

signal level_completed
signal return_to_menu_requested

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyScene := preload("res://scenes/enemies/EnemyGuard.tscn")
const BossScene := preload("res://scenes/enemies/BossOni.tscn")
const WaveScene := preload("res://scenes/combat/WaveProjectile.tscn")
const HitVfxScene := preload("res://scenes/vfx/HitVfx.tscn")

const LEVEL_LAYOUT := {
	"spawn": Vector2(180, 612),
	"exit": Vector2(5220, 560),
	"platforms": [
		{ "center": Vector2(2700, 684), "size": Vector2(5400, 72), "semisolid": false },
		{ "center": Vector2(720, 492), "size": Vector2(280, 34), "semisolid": true },
		{ "center": Vector2(1160, 454), "size": Vector2(300, 34), "semisolid": true },
		{ "center": Vector2(1660, 424), "size": Vector2(320, 34), "semisolid": true },
		{ "center": Vector2(2260, 464), "size": Vector2(320, 34), "semisolid": true },
		{ "center": Vector2(3040, 438), "size": Vector2(360, 34), "semisolid": true },
		{ "center": Vector2(3520, 492), "size": Vector2(280, 34), "semisolid": true },
		{ "center": Vector2(3920, 420), "size": Vector2(320, 34), "semisolid": true },
	],
	"enemies": [
		{ "type": "guard", "position": Vector2(940, 612) },
		{ "type": "axe", "position": Vector2(1540, 612) },
		{ "type": "ninja", "position": Vector2(2340, 612) },
		{ "type": "guard", "position": Vector2(3140, 612) },
		{ "type": "ninja", "position": Vector2(3580, 612) },
		{ "type": "axe", "position": Vector2(3860, 612) },
		{ "type": "boss", "position": Vector2(4620, 586) },
	],
	"checkpoints": [
		{ "position": Vector2(1780, 600), "label": "CHECKPOINT: HIGH PATH" },
		{ "position": Vector2(3340, 600), "label": "CHECKPOINT: BOSS APPROACH" },
	],
	"tips": [
		{ "position": Vector2(380, 600), "text": "A/D move  SPACE jump  SHIFT dash" },
		{ "position": Vector2(760, 600), "text": "J melee  L wave shot" },
		{ "position": Vector2(3220, 600), "text": "Enemies flash red before striking" },
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
var checkpoint_areas: Array[Area2D] = []
var camera_shake := 0.0
var camera_base_position := Vector2.ZERO
var tone_player: AudioStreamPlayer

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_backdrop()
	_build_level_geometry()
	_build_exit()
	_build_checkpoints()
	_build_tips()
	_build_audio()
	_spawn_player()
	_spawn_enemies()
	exit_area.body_entered.connect(_on_exit_body_entered)
	score = GameState.score
	hud.update_score(score)

func _process(delta: float) -> void:
	if is_instance_valid(player):
		var lookahead := Vector2(260 * player.facing, -120)
		camera_base_position = camera.global_position.lerp(player.global_position + lookahead, 0.08)
		camera.global_position = camera_base_position + _shake_offset()
		camera_shake = maxf(0.0, camera_shake - delta * 8.0)
	if Input.is_action_just_pressed("pause"):
		get_tree().paused = not get_tree().paused
		hud.set_pause_visible(get_tree().paused)

func _build_backdrop() -> void:
	var sky := ColorRect.new()
	sky.color = Color(0.025, 0.035, 0.065)
	sky.size = Vector2(5000, 720)
	sky.position = Vector2(0, 0)
	sky.z_index = -100
	add_child(sky)

	var moon := Polygon2D.new()
	moon.polygon = _circle_polygon(Vector2(1040, 132), 76, 32)
	moon.color = Color(0.72, 0.86, 1.0, 0.42)
	moon.z_index = -98
	add_child(moon)

	for i in range(54):
		var star := ColorRect.new()
		var x := float((i * 317) % 4920 + 24)
		var y := float(34 + (i * 71) % 210)
		var size := float(2 + (i % 3))
		star.color = Color(0.70, 0.86, 1.0, 0.26 + float(i % 4) * 0.08)
		star.position = Vector2(x, y)
		star.size = Vector2(size, size)
		star.z_index = -99
		add_child(star)

	for i in range(9):
		var fog := ColorRect.new()
		fog.color = Color(0.28, 0.45, 0.55, 0.055)
		fog.position = Vector2(float(i * 620 - 180), float(390 + (i % 3) * 34))
		fog.size = Vector2(540, 26)
		fog.z_index = -75
		add_child(fog)

	for i in range(11):
		var mountain := Polygon2D.new()
		var x := float(i * 420 - 180)
		mountain.polygon = PackedVector2Array([Vector2(x, 650), Vector2(x + 260, 250 + (i % 3) * 38), Vector2(x + 560, 650)])
		mountain.color = Color(0.055, 0.09, 0.14, 0.92)
		mountain.z_index = -90
		add_child(mountain)

	for i in range(26):
		var trunk := ColorRect.new()
		var x := float(i * 190 + 40)
		var h := float(80 + (i % 5) * 24)
		trunk.color = Color(0.08, 0.055, 0.04, 0.85)
		trunk.position = Vector2(x, 610 - h)
		trunk.size = Vector2(14, h)
		trunk.z_index = -60
		add_child(trunk)

		var crown := Polygon2D.new()
		crown.polygon = PackedVector2Array([Vector2(x - 54, 618 - h), Vector2(x + 7, 506 - h), Vector2(x + 70, 618 - h)])
		crown.color = Color(0.05, 0.18, 0.13, 0.82)
		crown.z_index = -61
		add_child(crown)

	for i in range(44):
		var blade := Polygon2D.new()
		var x := float(i * 113 + 18)
		var h := float(18 + (i % 5) * 4)
		blade.polygon = PackedVector2Array([Vector2(x, 684), Vector2(x + 8, 684 - h), Vector2(x + 18, 684)])
		blade.color = Color(0.10, 0.30, 0.16, 0.64)
		blade.z_index = -20
		add_child(blade)

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
	visual.color = color.darkened(0.05)
	visual.size = size
	visual.position = -size / 2.0
	body.add_child(visual)

	var bevel := ColorRect.new()
	bevel.color = Color(0.62, 0.46, 0.28, 0.22)
	bevel.size = Vector2(size.x, 5)
	bevel.position = Vector2(-size.x / 2.0, -size.y / 2.0 + 8.0)
	body.add_child(bevel)

	var cap := ColorRect.new()
	cap.color = Color(0.32, 0.52, 0.28)
	cap.size = Vector2(size.x, 8)
	cap.position = Vector2(-size.x / 2.0, -size.y / 2.0)
	body.add_child(cap)

	var shadow := ColorRect.new()
	shadow.color = Color(0.0, 0.0, 0.0, 0.18)
	shadow.size = Vector2(size.x - 12.0, 7.0)
	shadow.position = Vector2(-size.x / 2.0 + 6.0, size.y / 2.0 - 10.0)
	body.add_child(shadow)

	if size.x > 120.0:
		for i in range(int(size.x / 96.0)):
			var notch := ColorRect.new()
			notch.color = Color(0.0, 0.0, 0.0, 0.10)
			notch.size = Vector2(18, 3)
			notch.position = Vector2(-size.x / 2.0 + 36.0 + i * 96.0, -size.y / 2.0 + 18.0 + float(i % 3) * 9.0)
			body.add_child(notch)

	platforms.add_child(body)

func _circle_polygon(center: Vector2, radius: float, segments: int) -> PackedVector2Array:
	var points := PackedVector2Array()
	for i in range(segments):
		var a := TAU * float(i) / float(segments)
		points.append(center + Vector2(cos(a), sin(a)) * radius)
	return points

func _spawn_player() -> void:
	player = PlayerScene.instantiate()
	player.global_position = GameState.get_spawn(LEVEL_LAYOUT["spawn"])
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
	camera_shake = minf(1.0, camera_shake + 0.22)
	_play_tone(360.0, 0.045, 0.18)

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
	score = GameState.add_score(points)
	hud.update_score(score)
	_on_hit_landed(point)
	_play_tone(160.0, 0.12, 0.24)

func _on_player_health_changed(current: int, max_health: int) -> void:
	hud.update_health(current, max_health)
	hud.flash_damage()
	camera_shake = minf(1.2, camera_shake + 0.45)
	_play_tone(110.0, 0.10, 0.28)

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
	_play_tone(520.0, 0.2, 0.25)
	level_completed.emit()

func _build_checkpoints() -> void:
	for checkpoint in LEVEL_LAYOUT["checkpoints"]:
		var area := Area2D.new()
		area.global_position = checkpoint["position"]
		area.collision_layer = 0
		area.collision_mask = 2
		area.set_meta("label", checkpoint["label"])
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

func _build_tips() -> void:
	for tip in LEVEL_LAYOUT["tips"]:
		var label := Label.new()
		label.text = tip["text"]
		label.position = tip["position"] + Vector2(-160, -126)
		label.size = Vector2(320, 40)
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.add_theme_font_size_override("font_size", 18)
		label.add_theme_color_override("font_color", Color(0.72, 0.95, 1.0, 0.88))
		add_child(label)

func _on_checkpoint_entered(body: Node, area: Area2D) -> void:
	if body != player:
		return
	GameState.set_checkpoint(area.global_position)
	hud.show_message(String(area.get_meta("label")), 1.2)
	_play_tone(720.0, 0.12, 0.18)
	area.queue_free()

func _shake_offset() -> Vector2:
	if camera_shake <= 0.0:
		return Vector2.ZERO
	var t := Time.get_ticks_msec() * 0.021
	return Vector2(sin(t * 1.7), cos(t * 2.1)) * camera_shake * 12.0

func _build_audio() -> void:
	tone_player = AudioStreamPlayer.new()
	tone_player.bus = "Master"
	add_child(tone_player)

func _play_tone(freq: float, duration: float, volume: float) -> void:
	if not is_instance_valid(tone_player):
		return
	var sample_rate := 22050
	var frames := int(sample_rate * duration)
	var data := PackedByteArray()
	data.resize(frames * 2)
	for i in range(frames):
		var fade := 1.0 - float(i) / float(maxi(1, frames))
		var sample := int(sin(TAU * freq * float(i) / float(sample_rate)) * 28000.0 * volume * fade)
		data.encode_s16(i * 2, sample)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = data
	tone_player.stream = stream
	tone_player.play()
