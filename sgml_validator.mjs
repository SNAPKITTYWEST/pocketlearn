// pocketlearn/sgml_validator.mjs
// Browser-native SGML structural validator
// Validates documents against inline DTD rules before ILP induction.
// Matches ISO 8879:1986 semantics for element presence and minimization.
//
// Connects to: claimguard.mjs (same oracle pattern)
//              dsssl-synthesis.mjs (SGML grove parser)
//              ontology.dtd, training_record.dtd, sovereign_prompt.dtd
//
// Ahmad Ali Parr -- Bel Esprit D'Accord Irrevocable Trust -- EIN 42-697643

// ── DTD rule registry ─────────────────────────────────────────────────────────
const DTD_RULES = {

  // sovereign_prompt.dtd
  system_prompt: {
    required_children: ['identity', 'logic_gates', 'execution_flow'],
    optional_children: [],
    minimization: ['both_required', 'both_required'], // - -
  },
  logic_gates: {
    required_children: ['gate'],
    min_count: { gate: 1 },
    minimization: ['both_required', 'both_required'],
  },
  gate: {
    required_children: ['name', 'condition', 'action'],
    optional_children: ['seal'],
    minimization: ['both_required', 'both_required'],
  },
  seal: {
    required_attrs: ['hash'],
    fixed_attrs: { algo: 'SHA-256' },
    content_model: 'EMPTY',
    minimization: ['both_required', 'end_optional'], // - O
  },

  // ontology.dtd
  ontology: {
    required_attrs: ['name'],
    required_children: ['concepts'],
    minimization: ['both_required', 'both_required'],
  },
  concept: {
    required_attrs: ['id', 'is_a'],
    optional_children: ['member', 'induced_rule'],
    minimization: ['both_required', 'both_required'],
  },
  member: {
    required_attrs: ['word', 'strength'],
    content_model: 'EMPTY',
    minimization: ['both_required', 'end_optional'], // - O
  },

  // training_record.dtd
  training_record: {
    required_attrs: ['id', 'source_sha256', 'split', 'created_by', 'review_status', 'weight'],
    required_children: ['meta', 'content'],
    optional_children: ['flags', 'seal'],
    minimization: ['both_required', 'both_required'],
  },
  content: {
    required_children: ['instruction', 'output'],
    optional_children: ['context'],
    minimization: ['both_required', 'both_required'],
  },
}

const VALID_SPLITS      = ['train', 'val', 'test', 'holdout']
const CRITICAL_DOMAINS  = ['security', 'cryptography', 'formal_verification', 'systems_architecture']
const HEDGE_PHRASES     = ['i think', 'probably', 'it seems', 'might be', 'could be', 'i believe']

// ── Parse SGML to simple element tree (matches dsssl-synthesis.mjs pattern) ──

function parseSGML(sgml) {
  const stripDTD = sgml.replace(/<!DOCTYPE[\s\S]*?]>/i, '').trim()
  const elements = []
  const tagRe   = /<(\/?)([\w-]+)([^>]*)>/g
  let match
  const stack   = [{ name: 'root', children: [], attrs: {} }]

  let lastIndex = 0
  while ((match = tagRe.exec(stripDTD)) !== null) {
    const [full, closing, name, attrsStr] = match
    const text = stripDTD.slice(lastIndex, match.index).trim()
    if (text) stack.at(-1).text = (stack.at(-1).text || '') + text

    if (closing) {
      const closed = stack.pop()
      if (stack.length > 0) stack.at(-1).children.push(closed)
    } else {
      const attrs = {}
      const attrRe = /([\w-]+)="([^"]*)"/g
      let am
      while ((am = attrRe.exec(attrsStr)) !== null) attrs[am[1]] = am[2]
      const el = { name, attrs, children: [], text: '' }
      // EMPTY elements don't get pushed (self-closing equivalent in SGML)
      const rule = DTD_RULES[name]
      if (rule?.content_model === 'EMPTY') {
        stack.at(-1).children.push(el)
      } else {
        stack.push(el)
      }
    }
    lastIndex = tagRe.lastIndex
  }
  while (stack.length > 1) {
    const el = stack.pop()
    stack.at(-1).children.push(el)
  }
  return stack[0].children[0] || null
}

// ── DTD validation ────────────────────────────────────────────────────────────

function validateElement(el, errors = []) {
  if (!el) return errors
  const rule = DTD_RULES[el.name]
  if (!rule) return errors  // no rule = permissive pass

  // Check required attributes
  if (rule.required_attrs) {
    for (const attr of rule.required_attrs) {
      if (!el.attrs[attr]) {
        errors.push(`SGML: element <${el.name}> missing required attribute "${attr}" (#REQUIRED)`)
      }
    }
  }

  // Check fixed attributes
  if (rule.fixed_attrs) {
    for (const [attr, val] of Object.entries(rule.fixed_attrs)) {
      if (el.attrs[attr] && el.attrs[attr] !== val) {
        errors.push(`SGML: <${el.name}> attribute "${attr}" must be #FIXED "${val}", got "${el.attrs[attr]}"`)
      }
    }
  }

  // Check required children
  if (rule.required_children) {
    const childNames = el.children.map(c => c.name)
    for (const req of rule.required_children) {
      if (!childNames.includes(req)) {
        errors.push(`SGML: element <${el.name}> missing required child <${req}> (minimization: - -)`)
      }
    }
  }

  // Check minimum counts
  if (rule.min_count) {
    for (const [child, min] of Object.entries(rule.min_count)) {
      const count = el.children.filter(c => c.name === child).length
      if (count < min) {
        errors.push(`SGML: <${el.name}> requires at least ${min} <${child}> element(s), found ${count}`)
      }
    }
  }

  // Check content model EMPTY
  if (rule.content_model === 'EMPTY' && el.children.length > 0) {
    errors.push(`SGML: <${el.name}> has EMPTY content model but contains children`)
  }

  // Recurse
  for (const child of el.children) validateElement(child, errors)
  return errors
}

// ── Claim oracle (matches claimguard.mjs z3OracleCheck) ───────────────────────

function oracleCheck(content) {
  const lower = content.toLowerCase()
  for (const hedge of HEDGE_PHRASES) {
    if (lower.includes(hedge)) {
      return { valid: false, reason: `Oracle: hedge phrase detected: "${hedge}"` }
    }
  }
  if (!content.trim()) {
    return { valid: false, reason: 'Oracle: empty content rejected' }
  }
  return { valid: true, reason: 'Structural + oracle check passed' }
}

// ── Main validator ────────────────────────────────────────────────────────────

export function validateSGML(sgml, doctype = 'auto') {
  const el     = parseSGML(sgml)
  const errors = validateElement(el)

  // Oracle check on text content
  const textContent = sgml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const oracle      = oracleCheck(textContent)
  if (!oracle.valid) errors.push(oracle.reason)

  return {
    valid:   errors.length === 0,
    errors,
    element: el?.name || 'unknown',
    oracle:  oracle.valid
  }
}

// Training record specific validator (mirrors transformer.dl plasma_pass)
export function validateTrainingRecord(record) {
  const errors = []

  if (!record.id)            errors.push('SGML: training_record missing id (#REQUIRED)')
  if (!record.source_sha256) errors.push('SGML: training_record missing source_sha256 (#REQUIRED)')
  if (!VALID_SPLITS.includes(record.split))
    errors.push(`SGML: invalid split "${record.split}" — must be (train|val|test|holdout)`)
  if (!record.created_by)    errors.push('SGML: training_record missing created_by (#REQUIRED)')
  if (!record.review_status) errors.push('SGML: training_record missing review_status (#REQUIRED)')

  const weight = parseFloat(record.weight)
  if (isNaN(weight) || weight <= 0 || weight > 1)
    errors.push(`SGML: weight="${record.weight}" out of range (0, 1]`)

  // Critical domain inaccuracy check (mirrors transformer.dl has_critical_inaccuracy)
  if (record.inaccuracies) {
    for (const inc of record.inaccuracies) {
      if (CRITICAL_DOMAINS.includes(inc.domain)) {
        errors.push(`SGML: critical domain inaccuracy in "${inc.domain}": ${inc.reason}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── Encode as SGML (matches claimguard.mjs encodeAsSgml) ──────────────────────

export function encodeAsSGML(obj, doctype = 'record') {
  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const lines = [
    `<!DOCTYPE ${doctype} [`,
    `  <!ELEMENT ${doctype} - - (` + Object.keys(obj).join(', ') + `)>`,
  ]
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`  <!ELEMENT ${k} - - (#PCDATA)>`)
  }
  lines.push(`]>`)
  lines.push(`<${doctype}>`)
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`  <${k}>${esc(v)}</${k}>`)
  }
  lines.push(`</${doctype}>`)
  return lines.join('\n')
}
