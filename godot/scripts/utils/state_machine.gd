class_name StateMachine
extends RefCounted
## Reusable finite state machine for GDScript.
##
## Mirrors phaser/src/utils/StateMachine.ts. Supports:
## - on_enter / on_update / on_exit per state
## - allowed-transition guards
## - transition callbacks
##
## Usage:
##   var sm := StateMachine.new(self)
##   sm.add_state("idle", _on_idle_enter, _on_idle_update, _on_idle_exit)
##   sm.add_state("run", _on_run_enter, _on_run_update)
##   sm.add_transition("idle", "run")
##   sm.set_state("idle")
##   sm.update(delta)

var _states: Dictionary = {}
var _current: Dictionary = {}
var _context: Object
var _allowed: Dictionary = {}
var _callbacks: Array = []

func _init(context: Object) -> void:
	_context = context

func add_state(name: String, on_enter: Callable = Callable(), on_update: Callable = Callable(), on_exit: Callable = Callable()) -> StateMachine:
	_states[name] = {
		"name": name,
		"on_enter": on_enter,
		"on_update": on_update,
		"on_exit": on_exit,
	}
	return self

func add_transition(from: String, to: String) -> StateMachine:
	if not _allowed.has(from):
		_allowed[from] = []
	if not _allowed[from].has(to):
		_allowed[from].append(to)
	return self

func on_transition(callback: Callable) -> StateMachine:
	_callbacks.append(callback)
	return self

func set_state(name: String) -> void:
	if _current.get("name", "") == name:
		return
	var next_state: Dictionary = _states.get(name, {})
	if next_state.is_empty():
		push_warning("StateMachine: state '%s' not found" % name)
		return
	if not _current.is_empty() and _allowed.has(_current["name"]):
		var allowed: Array = _allowed[_current["name"]]
		if not allowed.has(name):
			push_warning("StateMachine: blocked transition %s -> %s" % [_current["name"], name])
			return
	var from_name: String = _current.get("name", "")
	if not _current.is_empty() and _current["on_exit"].is_valid():
		_current["on_exit"].call(_context)
	_current = next_state
	for cb in _callbacks:
		cb.call(from_name, name)
	if _current["on_enter"].is_valid():
		_current["on_enter"].call(_context)

func update(delta: float) -> void:
	if not _current.is_empty() and _current["on_update"].is_valid():
		_current["on_update"].call(_context, delta)

func get_current_state() -> String:
	return _current.get("name", "")

func is_in(name: String) -> bool:
	return _current.get("name", "") == name

func clear() -> void:
	_states.clear()
	_allowed.clear()
	_callbacks.clear()
	_current = {}
