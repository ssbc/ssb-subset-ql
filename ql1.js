const { and, or, type, author } = require('ssb-db2/operators')

function validate(query) {
  console.warn('QL1.validate is not yet implemented')
}

function parse(query) {
  if (!query) return null
  try {
    if (typeof query === 'string') {
      const parsed = JSON.parse(query)
      return parsed
    } else if (typeof query === 'object') {
      return query
    } else {
      throw new Error('QL1 query should be an object or string: ' + query)
    }
  } catch (err) {
    console.warn('Error parsing QL1 query: ' + query)
    return null
  }
}

// It's important to use dedicated: false because these operators are usually
// created by remote peers and we don't want to give them permission to create
// create an unbounded amount of new bitvector files in jitdb.
function toOperator(o) {
  if (!o.op) throw 'missing op'

  if (o.op === 'and') {
    if (!Array.isArray(o.args)) throw "args part of 'and' op must be an array"

    let args = o.args.map((op) => toOperator(op))
    return and(...args)
  } else if (o.op === 'or') {
    if (!Array.isArray(o.args)) throw "args part of 'and' op must be an array"

    let args = o.args.map((op) => toOperator(op))
    return or(...args)
  } else if (o.op === 'type') {
    if (typeof o.string !== 'string') throw "'type' must have an string option"
    return type(o.string, { dedicated: false })
  } else if (o.op === 'author') {
    if (typeof o.feed !== 'string') throw "'author' must have an feed option"
    return author(o.feed, { dedicated: false })
  } else throw 'Unknown op ' + o.op
}

function stringify(query) {
  return JSON.stringify(query)
}

function isEquals(q1, q2) {
  throw new Error(
    'QL1.isEquals() is not supported. In the general case, ' +
      'this seems to be an NP complete problem'
  )
}

module.exports = {
  validate,
  parse,
  toOperator,
  stringify,
  isEquals,
}
