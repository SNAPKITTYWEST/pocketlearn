<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="text"/>
<!-- ontology_to_asp.xslt: XML -> ASP facts for clingo validation -->
<xsl:template match="/ontology">
% ASP facts from <xsl:value-of select="@name"/>
<xsl:for-each select="concepts/concept">is_a("<xsl:value-of select="@id"/>", "<xsl:value-of select="@is_a"/>").
</xsl:for-each>
<xsl:for-each select="concepts/concept/member">member("<xsl:value-of select="@word"/>", "<xsl:value-of select="../@id"/>").
word("<xsl:value-of select="@word"/>").
</xsl:for-each>
</xsl:template>
</xsl:stylesheet>
