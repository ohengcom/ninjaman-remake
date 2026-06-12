extends Area2D

const ITEMS_TEX := "res://assets/tiles/four_seasons/objects/items.png"

var heal_amount := 35
var collected := false
var _sprite: Sprite2D

func _ready() -> void:
	collision_layer = 0
	collision_mask = 2
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 24.0
	shape.shape = circle
	add_child(shape)
	_sprite = Sprite2D.new()
	_sprite.texture = load(ITEMS_TEX)
	_sprite.region_enabled = true
	_sprite.region_rect = Rect2(32, 32, 16, 16)
	_sprite.scale = Vector2(3.0, 3.0)
	add_child(_sprite)
	var tween := create_tween()
	tween.set_loops()
	tween.tween_property(_sprite, "position:y", -8.0, 0.8).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(_sprite, "position:y", 0.0, 0.8).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if collected or not body.is_in_group("player") or not body.has_method("heal"):
		return
	if body.health >= body.max_health:
		return
	collected = true
	body.heal(heal_amount)
	AudioManager.play_sfx("heart", -3.0)
	set_deferred("monitoring", false)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(_sprite, "scale", Vector2(4.4, 4.4), 0.2)
	tween.tween_property(_sprite, "modulate:a", 0.0, 0.2)
	tween.chain().tween_callback(queue_free)
