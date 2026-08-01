:- is_a(C, C).
:- member(W, _), not word(W).
:- word(W), not member(W, _).

disjoint(stack_op, compiler_word).
disjoint(stack_op, meta_word).
disjoint(compiler_word, meta_word).
disjoint(learning_word, stack_op).

:- member(W, C1), member(W, C2), disjoint(C1, C2), C1 != C2.
:- member(W, stack_op), not stack_effect(W, _, _).

is_a_transitive(C, P) :- is_a(C, P).
is_a_transitive(C, P) :- is_a(C, Mid), is_a_transitive(Mid, P).
