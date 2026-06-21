extends SceneTree
## Lightweight test runner for the StateMachine utility.
##
## No external test framework dependency. Run headless:
##   godot --headless --script res://tests/run_tests.gd
##
## Exits non-zero on any failure so CI can detect regressions.

const StateMachine = preload("res://scripts/utils/state_machine.gd")

var failures: int = 0
var passed: int = 0

func _init() -> void:
	print("Running StateMachine tests...")
	_test_initial_state_empty()
	_test_add_and_set_state()
	_test_unknown_state_warns()
	_test_transition_guard_blocks()
	_test_allowed_transition_passes()
	_test_on_enter_on_exit_called()
	_test_update_calls_on_update()
	_test_is_in()
	_test_on_transition_callback()
	_test_clear()
	print("Passed: %d  Failed: %d" % [passed, failures])
	if failures > 0:
		print("TESTS FAILED")
		quit(1)
	else:
		print("ALL TESTS PASSED")
		quit(0)

func _assert(cond: bool, msg: String) -> void:
	if cond:
		passed += 1
	else:
		failures += 1
		push_error("ASSERT FAILED: " + msg)

func _test_initial_state_empty() -> void:
	var sm := StateMachine.new(null)
	_assert(sm.get_current_state() == "", "initial state should be empty")
	_assert(not sm.is_in("anything"), "is_in on empty sm should be false")

func _test_add_and_set_state() -> void:
	var sm := StateMachine.new(null)
	sm.add_state("idle")
	sm.set_state("idle")
	_assert(sm.get_current_state() == "idle", "set_state should switch to idle")
	_assert(sm.is_in("idle"), "is_in idle should be true")

func _test_unknown_state_warns() -> void:
	var sm := StateMachine.new(null)
	sm.add_state("idle")
	sm.set_state("idle")
	sm.set_state("nonexistent")
	_assert(sm.get_current_state() == "idle", "unknown state should not switch")

func _test_transition_guard_blocks() -> void:
	# Semantics: if a `from` state has *any* transition defined, only those
	# are allowed. If no transitions are defined for `from`, all are allowed.
	var sm := StateMachine.new(null)
	sm.add_state("idle")
	sm.add_state("run")
	sm.add_state("jump")
	# idle can only go to run (not jump)
	sm.add_transition("idle", "run")
	sm.set_state("idle")
	sm.set_state("jump")
	_assert(sm.get_current_state() == "idle", "disallowed transition idle->jump should be blocked")
	sm.set_state("run")
	_assert(sm.get_current_state() == "run", "allowed transition idle->run should pass")

func _test_allowed_transition_passes() -> void:
	var sm := StateMachine.new(null)
	sm.add_state("a")
	sm.add_state("b")
	sm.add_transition("a", "b")
	sm.add_transition("b", "a")
	sm.set_state("a")
	sm.set_state("b")
	_assert(sm.get_current_state() == "b", "a->b should pass")
	sm.set_state("a")
	_assert(sm.get_current_state() == "a", "b->a should pass")

func _test_on_enter_on_exit_called() -> void:
	var ctx := _TestObj.new()
	var sm := StateMachine.new(ctx)
	sm.add_state("a", Callable(ctx, "enter_a"), Callable(), Callable(ctx, "exit_a"))
	sm.add_state("b", Callable(ctx, "enter_b"), Callable(), Callable())
	sm.add_transition("a", "b")
	sm.set_state("a")
	_assert(ctx.log == ["enter_a"], "enter_a should be called, got %s" % str(ctx.log))
	sm.set_state("b")
	_assert(ctx.log == ["enter_a", "exit_a", "enter_b"], "exit_a then enter_b, got %s" % str(ctx.log))

func _test_update_calls_on_update() -> void:
	var ctx := _TestObj.new()
	var sm := StateMachine.new(ctx)
	sm.add_state("a", Callable(), Callable(ctx, "update_a"))
	sm.set_state("a")
	ctx.log.clear()
	sm.update(0.016)
	_assert(ctx.log == ["update_a:0.016"], "update should call on_update with delta, got %s" % str(ctx.log))

func _test_is_in() -> void:
	var sm := StateMachine.new(null)
	sm.add_state("x")
	sm.set_state("x")
	_assert(sm.is_in("x"), "is_in x should be true")
	_assert(not sm.is_in("y"), "is_in y should be false")

func _test_on_transition_callback() -> void:
	var ctx := _TestObj.new()
	var sm := StateMachine.new(ctx)
	sm.add_state("a")
	sm.add_state("b")
	sm.add_transition("a", "b")
	sm.on_transition(Callable(ctx, "on_trans"))
	sm.set_state("a")
	ctx.log.clear()
	sm.set_state("b")
	_assert(ctx.log == ["trans:a->b"], "transition callback should fire with from->to, got %s" % str(ctx.log))

func _test_clear() -> void:
	var sm := StateMachine.new(null)
	sm.add_state("a")
	sm.set_state("a")
	sm.clear()
	_assert(sm.get_current_state() == "", "clear should reset current state")
	_assert(not sm.is_in("a"), "clear should remove states")

class _TestObj extends RefCounted:
	var log: Array = []
	func enter_a(_ctx): log.append("enter_a")
	func exit_a(_ctx): log.append("exit_a")
	func enter_b(_ctx): log.append("enter_b")
	func update_a(_ctx, delta: float): log.append("update_a:%s" % delta)
	func on_trans(from: String, to: String): log.append("trans:%s->%s" % [from, to])
