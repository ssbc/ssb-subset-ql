const Ref = require('ssb-ref')
const { and, author, type } = require('ssb-db2/operators')
const deepEqual = require('nano-equal')

/**
 * @typedef {object} QueryQL0
 * @property {string} author
 * @property {string} type
 */

const EXPECTED_KEYS = ['author', 'type']

/**
 * @param {Partial<QueryQL0>} [query]
 * @returns {undefined}
 */
function validate(query) {
  if (!query) throw new Error('query should be truthy: ' + query)
  if (typeof query !== 'string' && typeof query !== 'object') {
    throw new Error('query should be a string or an object')
  }
  const obj = typeof query === 'string' ? JSON.parse(query) : query
  const keys = Object.keys(obj)
  if (keys.length > EXPECTED_KEYS.length) {
    throw new Error('query has too many fields: ' + obj)
  }
  for (const k of EXPECTED_KEYS) {
    if (!keys.includes(k) || !obj[k]) {
      throw new Error(`query is missing the "${k}" field: ${obj}`)
    }
    if (typeof obj[k] !== 'string') {
      throw new Error(`query "${k}" should be a valid string: ${obj}`)
    }
  }
  if (!Ref.isFeedId(obj.author)) {
    throw new Error(`query.author should be a valid SSB feed ID: ${obj}`)
  }
}

/**
 * @param {string | QueryQL0} [query]
 * @returns {QueryQL0}
 */
function parse(query) {
  if (!query) return null
  try {
    if (typeof query === 'string') {
      const parsed = JSON.parse(query)
      validate(parsed)
      return parsed
    } else if (typeof query === 'object') {
      validate(query)
      return query
    } else {
      throw new Error('QL0 query should be an object or string: ' + query)
    }
  } catch (err) {
    console.warn('Error parsing QL0 query: ' + query)
    return null
  }
}

/**
 * @param {string | QueryQL0} query
 * @param {boolean} dedicated
 * @returns {object}
 */
function toOperator(query, dedicated = false) {
  validate(query)
  const actualQuery = parse(query)
  return and(
    author(actualQuery.author, { dedicated }),
    type(actualQuery.type, { dedicated })
  )
}

/**
 * @param {QueryQL0} query
 * @returns {string}
 */
function stringify(query) {
  validate(query)
  // Doesn't use JSON.stringify because we want to ensure this exact order
  return `{"author":"${query.author}","type":"${query.type}"}`
}

/**
 * @param {string | QueryQL0} [q1]
 * @param {string | QueryQL0} [q2]
 * @returns {boolean}
 */
function isEquals(q1, q2) {
  const q1Obj = parse(q1)
  const q2Obj = parse(q2)
  return deepEqual(q1Obj, q2Obj)
}

module.exports = {
  validate,
  parse,
  toOperator,
  stringify,
  isEquals,
}
