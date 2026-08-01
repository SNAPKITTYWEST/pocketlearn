\ FORTH auto-generated from corpus_tokens.xml
\ Pipeline: ontology.xml --(XSLT)--> FORTH  ZERO PYTHON

256 CONSTANT MAX-VOCAB
CREATE VOCAB MAX-VOCAB 32 * ALLOT
VARIABLE VOCAB-SIZE  0 VOCAB-SIZE !

: add-word ( c-addr u -- id )
  VOCAB-SIZE @ DUP >R VOCAB R@ 32 * + PLACE R@ 1+ VOCAB-SIZE ! R> ;

: init-vocab
  S" pocketforth" add-word DROP   \ id=0  seed
  S" stack"       add-word DROP   \ id=11 seed: stack_op
  S" forth"       add-word DROP   \ id=4  seed
  S" dup"         add-word DROP   \ id=15 seed: stack_op
  S" drop"        add-word DROP   \ id=16 seed: stack_op
  S" swap"        add-word DROP   \ id=17 seed: stack_op
  S" over"        add-word DROP   \ id=18 seed: stack_op
  S" include"     add-word DROP   \ INDUCED by drop  <-- ILP result
  S" colon"       add-word DROP   \ id=25 seed: compiler_word
  S" semicolon"   add-word DROP   \ id=27 seed: compiler_word
  S" defined"     add-word DROP   \ INDUCED by semicolon
  S" xslt"        add-word DROP   \ id=37 seed: meta_word
  S" asp"         add-word DROP   \ id=42 seed: meta_word
  S" xml"         add-word DROP   \ id=41 seed: meta_word
  S" learns"      add-word DROP   \ id=32 seed: learning_word
  S" statistical" add-word DROP   \ id=33 seed: learning_word
  S" embeddings"  add-word DROP   \ id=48 seed: learning_word
  S" similarity"  add-word DROP   \ INDUCED by statistical
;

53 CONSTANT CORPUS-LEN
CREATE CORPUS
  0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 2 , 9 , 10 ,
  4 , 1 , 11 , 12 , 11 , 13 , 14 , 15 , 16 , 17 , 18 ,
  19 , 20 , 21 , 22 , 23 , 24 , 25 , 26 , 27 ,
  28 , 29 , 21 , 30 , 31 , 21 ,
  32 , 33 , 34 , 35 , 36 , 37 , 38 , 39 , 40 , 41 ,
  42 , 43 , 44 , 45 ,

: demo
  0 VOCAB-SIZE !
  init-vocab
  CR ." PocketLearn FORTH — seed + ILP-induced vocab" CR
  ." vocab size: " VOCAB-SIZE @ . CR
  ." Induced members: include (by drop), defined (by semicolon), similarity (by statistical)" CR ;

demo
