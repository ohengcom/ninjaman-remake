class_name ForestLevelBuilder
extends RefCounted

## Builds the visual terrain (TileMapLayer), parallax backdrop, props, and
## collision bodies for the forest level out of the CC0 fourSeasonsPlatformer_
## tileset by Kevin's Mom's House / analogstudios_.

const TILE := 16
const SCALE := 3.0
const CELL := 48.0

const SUMMER_TEX := "res://assets/tiles/four_seasons/midground/summer.png"
const DUNGEON_TEX := "res://assets/tiles/four_seasons/midground/dungeon.png"
const SKY_TEX := "res://assets/tiles/four_seasons/background/sky.png"
const OBJECTS_TEX := "res://assets/tiles/four_seasons/objects/static_objects.png"
const ITEMS_TEX := "res://assets/tiles/four_seasons/objects/items.png"
const COIN_TEX := "res://assets/tiles/four_seasons/objects/coin.png"
const FOREGROUND_TEX := "res://assets/tiles/four_seasons/foreground/foreground.png"

const SOURCE_SUMMER := 0
const SOURCE_DUNGEON := 1

# Atlas tiles registered in the summer source: name -> [atlas_coords, size_in_atlas]
const SUMMER_TILES := {
	"grass_surf_2": [Vector2i(0, 2), Vector2i(2, 1)],
	"grass_surf_1": [Vector2i(2, 2), Vector2i(1, 1)],
	"sand_surf_2": [Vector2i(3, 2), Vector2i(2, 1)],
	"sand_surf_1": [Vector2i(5, 2), Vector2i(1, 1)],
	"grass_tall_2": [Vector2i(0, 3), Vector2i(2, 2)],
	"grass_tall_1": [Vector2i(2, 3), Vector2i(1, 2)],
	"dirt_fill_3": [Vector2i(6, 2), Vector2i(3, 3)],
	"dirt_fill_2x1": [Vector2i(9, 2), Vector2i(2, 1)],
	"dirt_fill_1x1": [Vector2i(11, 2), Vector2i(1, 1)],
	"dirt_fill_2x2": [Vector2i(9, 3), Vector2i(2, 2)],
	"dirt_fill_1x2": [Vector2i(11, 3), Vector2i(1, 2)],
	"stone_surf_2": [Vector2i(0, 7), Vector2i(2, 1)],
	"stone_surf_1": [Vector2i(2, 7), Vector2i(1, 1)],
	"stone_tall_2": [Vector2i(0, 8), Vector2i(2, 2)],
	"stone_tall_1": [Vector2i(2, 8), Vector2i(1, 2)],
	"stone_fill_3": [Vector2i(6, 7), Vector2i(3, 3)],
	"stone_fill_2x1": [Vector2i(9, 7), Vector2i(2, 1)],
	"stone_fill_1x1": [Vector2i(11, 7), Vector2i(1, 1)],
	"stone_fill_2x2": [Vector2i(9, 8), Vector2i(2, 2)],
	"stone_fill_1x2": [Vector2i(11, 8), Vector2i(1, 2)],
	"plat_grass_2": [Vector2i(0, 0), Vector2i(2, 1)],
	"plat_grass_1": [Vector2i(2, 0), Vector2i(1, 1)],
	"plat_log_3": [Vector2i(6, 0), Vector2i(3, 1)],
	"plat_log_2": [Vector2i(9, 0), Vector2i(2, 1)],
	"leaf_fill_3": [Vector2i(0, 17), Vector2i(3, 3)],
	"leaf_block_2": [Vector2i(3, 18), Vector2i(2, 2)],
	"leaf_block_1": [Vector2i(5, 18), Vector2i(1, 2)],
}

const DUNGEON_TILES := {
	"brick_3_a": [Vector2i(0, 3), Vector2i(3, 3)],
	"brick_3_b": [Vector2i(3, 3), Vector2i(3, 3)],
	"brick_3_light": [Vector2i(6, 3), Vector2i(3, 3)],
	"brick_3_c": [Vector2i(9, 3), Vector2i(3, 3)],
	"brick_3_d": [Vector2i(12, 3), Vector2i(3, 3)],
	"brick_3_e": [Vector2i(0, 6), Vector2i(3, 3)],
}

# Decor sprite regions on static_objects.png (pixel rects).
const DECOR_REGIONS := {
	"bush_pink": Rect2(0, 16, 16, 48),
	"bush_green": Rect2(16, 16, 16, 48),
	"bush_ball": Rect2(32, 16, 16, 16),
	"bush_low": Rect2(32, 48, 16, 16),
	"palm": Rect2(64, 16, 32, 48),
	"bush_teal": Rect2(96, 16, 16, 48),
	"bush_orange": Rect2(112, 16, 16, 48),
	"pine_big": Rect2(144, 16, 32, 48),
	"pine_small": Rect2(192, 32, 16, 32),
	"tree_round": Rect2(208, 16, 16, 48),
	"pumpkin": Rect2(192, 16, 16, 16),
	"crate": Rect2(32, 64, 32, 32),
	"big_crate": Rect2(64, 64, 48, 32),
	"fence": Rect2(0, 80, 32, 16),
	"sign": Rect2(0, 96, 16, 32),
	"chain": Rect2(80, 96, 16, 48),
	"chain_b": Rect2(112, 96, 16, 48),
	"pillar": Rect2(128, 64, 16, 32),
	"mushroom": Rect2(144, 64, 16, 32),
	"rocks": Rect2(64, 128, 32, 16),
}

const HEART_REGION := Rect2(32, 32, 16, 16)

var summer_texture: Texture2D
var dungeon_texture: Texture2D
var objects_texture: Texture2D
var items_texture: Texture2D
var coin_texture: Texture2D
var sky_texture: Texture2D
var foreground_texture: Texture2D

func _init() -> void:
	summer_texture = load(SUMMER_TEX)
	dungeon_texture = load(DUNGEON_TEX)
	objects_texture = load(OBJECTS_TEX)
	items_texture = load(ITEMS_TEX)
	coin_texture = load(COIN_TEX)
	sky_texture = load(SKY_TEX)
	foreground_texture = load(FOREGROUND_TEX)

func build_tile_set() -> TileSet:
	var tile_set := TileSet.new()
	tile_set.tile_size = Vector2i(TILE, TILE)
	var summer := TileSetAtlasSource.new()
	summer.texture = summer_texture
	summer.texture_region_size = Vector2i(TILE, TILE)
	_register_tiles(summer, SUMMER_TILES)
	tile_set.add_source(summer, SOURCE_SUMMER)
	var dungeon := TileSetAtlasSource.new()
	dungeon.texture = dungeon_texture
	dungeon.texture_region_size = Vector2i(TILE, TILE)
	_register_tiles(dungeon, DUNGEON_TILES)
	tile_set.add_source(dungeon, SOURCE_DUNGEON)
	return tile_set

func _register_tiles(source: TileSetAtlasSource, tiles: Dictionary) -> void:
	for key in tiles:
		var coords: Vector2i = tiles[key][0]
		var size: Vector2i = tiles[key][1]
		source.create_tile(coords, size)
		var data := source.get_tile_data(coords, 0)
		# Anchor multi-cell tiles so the placed cell is the block's top-left.
		data.texture_origin = Vector2i(-(size.x - 1) * TILE / 2, -(size.y - 1) * TILE / 2)

func make_terrain_layer(parent: Node, layer_name: String, z := -10, tint := Color.WHITE) -> TileMapLayer:
	var layer := TileMapLayer.new()
	layer.name = layer_name
	layer.tile_set = build_tile_set()
	layer.scale = Vector2(SCALE, SCALE)
	layer.z_index = z
	layer.modulate = tint
	parent.add_child(layer)
	return layer

func place(layer: TileMapLayer, tile_key: String, cx: int, cy: int) -> void:
	var source_id := SOURCE_SUMMER
	var entry = SUMMER_TILES.get(tile_key)
	if entry == null:
		entry = DUNGEON_TILES.get(tile_key)
		source_id = SOURCE_DUNGEON
	if entry == null:
		push_warning("Unknown tile key: %s" % tile_key)
		return
	layer.set_cell(Vector2i(cx, cy), source_id, entry[0])

## Paints a solid ground segment from cx (inclusive) to cx_end (exclusive),
## with the walkable surface on row cy. Fills down to bottom_cy.
func paint_ground(layer: TileMapLayer, cx: int, cx_end: int, cy: int, bottom_cy: int, material := "grass") -> void:
	var surf_2 := "grass_surf_2" if material == "grass" else "stone_surf_2"
	var surf_1 := "grass_surf_1" if material == "grass" else "stone_surf_1"
	var x := cx
	while x < cx_end:
		if cx_end - x >= 2:
			place(layer, surf_2, x, cy)
			x += 2
		else:
			place(layer, surf_1, x, cy)
			x += 1
	_paint_fill(layer, cx, cx_end, cy + 1, bottom_cy, material)

func _paint_fill(layer: TileMapLayer, cx: int, cx_end: int, cy: int, bottom_cy: int, material := "grass") -> void:
	var fill_3 := "dirt_fill_3" if material == "grass" else "stone_fill_3"
	var fill_2x2 := "dirt_fill_2x2" if material == "grass" else "stone_fill_2x2"
	var fill_2x1 := "dirt_fill_2x1" if material == "grass" else "stone_fill_2x1"
	var fill_1x2 := "dirt_fill_1x2" if material == "grass" else "stone_fill_1x2"
	var fill_1x1 := "dirt_fill_1x1" if material == "grass" else "stone_fill_1x1"
	var y := cy
	while y <= bottom_cy:
		var rows_left := bottom_cy - y + 1
		var x := cx
		while x < cx_end:
			var cols_left := cx_end - x
			if rows_left >= 3 and cols_left >= 3:
				place(layer, fill_3, x, y)
				x += 3
			elif rows_left >= 2 and cols_left >= 2:
				place(layer, fill_2x2, x, y)
				x += 2
			elif rows_left >= 2:
				place(layer, fill_1x2, x, y)
				x += 1
			elif cols_left >= 2:
				place(layer, fill_2x1, x, y)
				x += 2
			else:
				place(layer, fill_1x1, x, y)
				x += 1
		if rows_left >= 3:
			y += 3
		elif rows_left >= 2:
			y += 2
		else:
			y += 1

## Floating island: grass surface row + one fill row below.
func paint_island(layer: TileMapLayer, cx: int, width: int, cy: int) -> void:
	paint_ground(layer, cx, cx + width, cy, cy + 1)

## Leaf hedge platform (self-contained wavy blocks).
func paint_leaf_platform(layer: TileMapLayer, cx: int, width: int, cy: int) -> void:
	var x := cx
	while x < cx + width:
		if cx + width - x >= 2:
			place(layer, "leaf_block_2", x, cy)
			x += 2
		else:
			place(layer, "leaf_block_1", x, cy)
			x += 1

## Brick backdrop wall for the ruin/boss section (visual only).
func paint_brick_wall(layer: TileMapLayer, cx: int, cx_end: int, cy: int, cy_end: int) -> void:
	var variants := ["brick_3_a", "brick_3_b", "brick_3_c", "brick_3_d", "brick_3_e"]
	var y := cy
	var row_index := 0
	while y < cy_end:
		var x := cx
		var col_index := 0
		while x < cx_end:
			var key: String = variants[(row_index * 2 + col_index) % variants.size()]
			if (row_index + col_index) % 5 == 3:
				key = "brick_3_light"
			place(layer, key, x, y)
			x += 3
			col_index += 1
		y += 3
		row_index += 1

# ---------------------------------------------------------------------------
# Collision bodies (invisible; visuals come from the TileMap)
# ---------------------------------------------------------------------------

func add_solid_rect(parent: Node, rect: Rect2) -> StaticBody2D:
	var body := StaticBody2D.new()
	body.position = rect.get_center()
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape2D.new()
	var rect_shape := RectangleShape2D.new()
	rect_shape.size = rect.size
	shape.shape = rect_shape
	body.add_child(shape)
	parent.add_child(body)
	return body

func add_one_way_rect(parent: Node, rect: Rect2) -> StaticBody2D:
	var body := add_solid_rect(parent, rect)
	body.set_meta("semisolid", true)
	var shape := body.get_child(0) as CollisionShape2D
	shape.one_way_collision = true
	shape.one_way_collision_margin = 10.0
	return body

## Ground collision for a segment in cell coords (surface top at cy).
func add_ground_collision(parent: Node, cx: int, cx_end: int, cy: int, depth_cells := 6) -> void:
	var rect := Rect2(cx * CELL, cy * CELL, (cx_end - cx) * CELL, depth_cells * CELL)
	add_solid_rect(parent, rect)

# ---------------------------------------------------------------------------
# Backdrop / parallax
# ---------------------------------------------------------------------------

func build_backdrop(parent: Node, level_width: float) -> void:
	# Static sky gradient (column 0 of sky_.png = blue day palette).
	var sky_holder := Parallax2D.new()
	sky_holder.name = "SkyParallax"
	sky_holder.scroll_scale = Vector2(0.0, 0.0)
	sky_holder.z_index = -100
	parent.add_child(sky_holder)
	var sky := Sprite2D.new()
	sky.texture = sky_texture
	sky.region_enabled = true
	sky.region_rect = Rect2(0, 0, 16, 112)
	sky.centered = false
	sky.position = Vector2(-200, -260)
	sky.scale = Vector2(120.0, 10.0)
	sky_holder.add_child(sky)

	# Far silhouette hills built from darkened terrain blocks.
	var hills := Parallax2D.new()
	hills.name = "HillsParallax"
	hills.scroll_scale = Vector2(0.22, 0.93)
	hills.repeat_size = Vector2(1488, 0)
	hills.repeat_times = ceili(level_width / 1488.0) + 3
	hills.z_index = -90
	parent.add_child(hills)
	var hill_tint := Color(0.45, 0.56, 0.74, 1.0)
	_add_region_sprite(hills, summer_texture, Rect2(96, 32, 48, 48), Vector2(60, 444), 3.0, hill_tint)
	_add_region_sprite(hills, summer_texture, Rect2(96, 32, 48, 48), Vector2(168, 492), 3.0, hill_tint)
	_add_region_sprite(hills, summer_texture, Rect2(96, 112, 48, 48), Vector2(420, 468), 3.0, hill_tint)
	_add_region_sprite(hills, summer_texture, Rect2(96, 32, 48, 48), Vector2(700, 432), 3.0, hill_tint)
	_add_region_sprite(hills, summer_texture, Rect2(96, 112, 48, 48), Vector2(812, 500), 3.0, hill_tint)
	_add_region_sprite(hills, summer_texture, Rect2(96, 32, 48, 48), Vector2(1120, 470), 3.0, hill_tint)

	# Mid-distance tree line.
	var woods := Parallax2D.new()
	woods.name = "WoodsParallax"
	woods.scroll_scale = Vector2(0.5, 0.97)
	woods.repeat_size = Vector2(1248, 0)
	woods.repeat_times = ceili(level_width / 1248.0) + 3
	woods.z_index = -80
	parent.add_child(woods)
	var wood_tint := Color(0.52, 0.64, 0.78, 1.0)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["pine_big"], Vector2(80, 462), 3.4, wood_tint)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["tree_round"], Vector2(330, 470), 3.4, wood_tint)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["pine_small"], Vector2(520, 512), 3.4, wood_tint)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["pine_big"], Vector2(704, 458), 3.4, wood_tint)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["bush_green"], Vector2(950, 478), 3.4, wood_tint)
	_add_region_sprite(woods, objects_texture, DECOR_REGIONS["pine_big"], Vector2(1106, 466), 3.4, wood_tint)

func _add_region_sprite(parent: Node, texture: Texture2D, region: Rect2, pos: Vector2, sprite_scale: float, tint := Color.WHITE) -> Sprite2D:
	var sprite := Sprite2D.new()
	sprite.texture = texture
	sprite.region_enabled = true
	sprite.region_rect = region
	sprite.centered = false
	# Anchor at bottom-left so y is the ground line.
	sprite.position = pos - Vector2(0, region.size.y * sprite_scale)
	sprite.scale = Vector2(sprite_scale, sprite_scale)
	sprite.modulate = tint
	parent.add_child(sprite)
	return sprite

# ---------------------------------------------------------------------------
# Props / decor in the gameplay layer
# ---------------------------------------------------------------------------

func add_decor(parent: Node, key: String, ground_pos: Vector2, z := -5, tint := Color.WHITE, decor_scale := SCALE) -> Sprite2D:
	var region: Rect2 = DECOR_REGIONS[key]
	var sprite := _add_region_sprite(parent, objects_texture, region, ground_pos, decor_scale, tint)
	sprite.position.x -= region.size.x * decor_scale * 0.5
	sprite.z_index = z
	return sprite

## Animated grass tuft from the foreground sheet (green row).
func add_grass_tuft(parent: Node, ground_pos: Vector2) -> void:
	var sprite := AnimatedSprite2D.new()
	var frames := SpriteFrames.new()
	frames.add_animation("sway")
	frames.set_animation_speed("sway", 6.0)
	frames.set_animation_loop("sway", true)
	for i in range(8):
		var tex := AtlasTexture.new()
		tex.atlas = foreground_texture
		tex.region = Rect2(i * 16, 112, 16, 16)
		frames.add_frame("sway", tex)
	sprite.sprite_frames = frames
	sprite.position = ground_pos + Vector2(0, -24)
	sprite.scale = Vector2(SCALE, SCALE)
	sprite.z_index = 5
	sprite.play("sway")
	sprite.frame = randi_range(0, 7)
	parent.add_child(sprite)
