extends Area2D

signal hit_landed(point: Vector2)

const SPEED := 680.0
const LIFE := 0.95

@onready var sprite: Sprite2D = $Sprite2D

var direction := 1
var age := 0.0
var damage := 22

func _ready() -> void:
	sprite.texture = _make_wave_texture()
	sprite.flip_h = direction < 0
	body_entered.connect(_on_body_entered)

func _physics_process(delta: float) -> void:
	age += delta
	global_position.x += direction * SPEED * delta
	if age >= LIFE:
		queue_free()

func _on_body_entered(body: Node) -> void:
	if body.has_method("take_damage"):
		body.take_damage(damage, global_position.x)
		hit_landed.emit(global_position)
		queue_free()

func _make_wave_texture() -> Texture2D:
	var image := Image.create(128, 64, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	for x in range(8, 120):
		var t := float(x - 8) / 112.0
		var center := 32.0 + sin(t * PI) * 2.0
		var half_h := 7.0 + sin(t * PI) * 18.0
		for y in range(int(center - half_h), int(center + half_h)):
			if y >= 0 and y < 64:
				var edge := 1.0 - absf(float(y) - center) / half_h
				image.set_pixel(x, y, Color(0.25 + edge * 0.7, 0.75 + edge * 0.25, 1.0, edge * 0.9))
	return ImageTexture.create_from_image(image)
