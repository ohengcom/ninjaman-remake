extends Node

const MUSIC_TRACKS := {
	"title": "res://assets/audio/music/music_title.ogg",
	"level": "res://assets/audio/music/music_level.ogg",
	"boss": "res://assets/audio/music/music_boss.ogg",
	"victory": "res://assets/audio/music/music_victory.ogg",
}

const SFX_PATHS := {
	"jump": "res://assets/audio/sfx/sfx_jump.ogg",
	"land": "res://assets/audio/sfx/sfx_land.ogg",
	"dash": "res://assets/audio/sfx/sfx_dash.ogg",
	"sword1": "res://assets/audio/sfx/sfx_sword1.ogg",
	"sword2": "res://assets/audio/sfx/sfx_sword2.ogg",
	"sword3": "res://assets/audio/sfx/sfx_sword3.ogg",
	"hit": "res://assets/audio/sfx/sfx_hit.ogg",
	"hurt": "res://assets/audio/sfx/sfx_hurt.ogg",
	"kill": "res://assets/audio/sfx/sfx_kill.ogg",
	"coin": "res://assets/audio/sfx/sfx_coin.ogg",
	"heart": "res://assets/audio/sfx/sfx_heart.ogg",
	"checkpoint": "res://assets/audio/sfx/sfx_checkpoint.ogg",
	"clear": "res://assets/audio/sfx/sfx_clear.ogg",
	"death": "res://assets/audio/sfx/sfx_death.ogg",
	"menu_move": "res://assets/audio/sfx/sfx_menu_move.ogg",
	"menu_select": "res://assets/audio/sfx/sfx_menu_select.ogg",
	"wave": "res://assets/audio/sfx/sfx_wave.ogg",
	"boss_roar": "res://assets/audio/sfx/sfx_boss_roar.ogg",
	"pause": "res://assets/audio/sfx/sfx_pause.ogg",
	"spike": "res://assets/audio/sfx/sfx_spike.ogg",
}

const SFX_POOL_SIZE := 10
const MUSIC_FADE_TIME := 0.8

var _music_player_a: AudioStreamPlayer
var _music_player_b: AudioStreamPlayer
var _active_music_player: AudioStreamPlayer
var _current_track := ""
var _sfx_players: Array[AudioStreamPlayer] = []
var _sfx_cache := {}
var _music_cache := {}
var _hit_stop_depth := 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_music_player_a = _make_music_player()
	_music_player_b = _make_music_player()
	_active_music_player = _music_player_a
	for i in range(SFX_POOL_SIZE):
		var sfx := AudioStreamPlayer.new()
		sfx.bus = "Master"
		sfx.process_mode = Node.PROCESS_MODE_ALWAYS
		add_child(sfx)
		_sfx_players.append(sfx)

func _make_music_player() -> AudioStreamPlayer:
	var player := AudioStreamPlayer.new()
	player.bus = "Master"
	player.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(player)
	return player

func play_music(track: String, volume_db := -8.0) -> void:
	if track == _current_track:
		return
	_current_track = track
	var stream: AudioStream = _music_cache.get(track)
	if stream == null:
		var path: String = MUSIC_TRACKS.get(track, "")
		if path == "" or not ResourceLoader.exists(path):
			return
		stream = load(path)
		if stream is AudioStreamOggVorbis:
			stream.loop = track != "victory"
		_music_cache[track] = stream
	var from := _active_music_player
	var to := _music_player_b if _active_music_player == _music_player_a else _music_player_a
	_active_music_player = to
	to.stream = stream
	to.volume_db = -38.0
	to.play()
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(to, "volume_db", volume_db, MUSIC_FADE_TIME)
	if from.playing:
		tween.tween_property(from, "volume_db", -38.0, MUSIC_FADE_TIME)
		tween.chain().tween_callback(from.stop)

func stop_music() -> void:
	_current_track = ""
	var tween := create_tween()
	tween.tween_property(_active_music_player, "volume_db", -38.0, 0.4)
	tween.tween_callback(_active_music_player.stop)

func play_sfx(sfx_name: String, volume_db := 0.0, pitch_scale := 1.0) -> void:
	var stream: AudioStream = _sfx_cache.get(sfx_name)
	if stream == null:
		var path: String = SFX_PATHS.get(sfx_name, "")
		if path == "" or not ResourceLoader.exists(path):
			return
		stream = load(path)
		_sfx_cache[sfx_name] = stream
	for player in _sfx_players:
		if not player.playing:
			player.stream = stream
			player.volume_db = volume_db
			player.pitch_scale = pitch_scale
			player.play()
			return
	var fallback := _sfx_players[0]
	fallback.stream = stream
	fallback.volume_db = volume_db
	fallback.pitch_scale = pitch_scale
	fallback.play()

func play_sword_sfx() -> void:
	play_sfx("sword%d" % (randi_range(1, 3)), -2.0, randf_range(0.94, 1.06))

func hit_stop(duration := 0.05, scale := 0.1) -> void:
	_hit_stop_depth += 1
	if _hit_stop_depth == 1:
		Engine.time_scale = scale
	await get_tree().create_timer(duration, true, false, true).timeout
	_hit_stop_depth = maxi(0, _hit_stop_depth - 1)
	if _hit_stop_depth == 0:
		Engine.time_scale = 1.0
