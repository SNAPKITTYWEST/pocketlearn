<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="text"/>
<!-- corpus_to_forth.xslt: XML -> FORTH dictionary. ZERO PYTHON. -->
<xsl:template match="/corpus">
\ FORTH auto-generated from corpus_tokens.xml
\ Pipeline: XML --(XSLT)--> FORTH  (no Python)

256 CONSTANT MAX-VOCAB
CREATE VOCAB MAX-VOCAB 32 * ALLOT
VARIABLE VOCAB-SIZE  0 VOCAB-SIZE !

: vocab-id ( c-addr u -- id|-1 )
  -1 VOCAB-SIZE @ 0 ?DO
    VOCAB I 32 * + COUNT 2OVER COMPARE 0= IF DROP I UNLOOP EXIT THEN
  LOOP NIP NIP ;

: add-word ( c-addr u -- id )
  2DUP vocab-id DUP -1 &lt;&gt; IF NIP NIP EXIT THEN
  DROP VOCAB-SIZE @  DUP &gt;R  VOCAB R@ 32 * + PLACE
  R@ 1+ VOCAB-SIZE !  R&gt; ;

: .word ( id -- )
  VOCAB SWAP 32 * + COUNT TYPE ;

: init-vocab
<xsl:for-each select="vocab/word">  S" <xsl:value-of select="."/>" add-word DROP
</xsl:for-each>;

<xsl:value-of select="count(vocab/word)"/> CONSTANT CORPUS-LEN
CREATE CORPUS
<xsl:for-each select="tokens/token">  <xsl:value-of select="@id"/> ,<xsl:if test="position() mod 10 = 0">
</xsl:if></xsl:for-each>

: cooccur-window ( center -- )
  DUP 2 - MAX 0 SWAP  2 + CORPUS-LEN MIN SWAP
  DO I OVER &lt;&gt; IF
    ." cooccur: " OVER .word ."  ~ " I CORPUS + @ .word CR
  THEN LOOP DROP ;

: train ( -- )
  CR ." Training on " CORPUS-LEN . ." tokens..." CR
  CORPUS-LEN 0 DO CORPUS I + @ cooccur-window LOOP ;

: demo
  0 VOCAB-SIZE !
  init-vocab
  CR ." PocketLearn FORTH runtime" CR
  ." vocab size: " VOCAB-SIZE @ . CR
  ." Running co-occurrence (window=2)..." CR
  \ train   \ uncomment to print all pairs
  CR ." Done. Type: 0 .word  or  train" CR ;

demo
</xsl:template>
</xsl:stylesheet>
