const test = require('tape')
const { and, author, type } = require('ssb-db2/operators')
const ssbKeys = require('ssb-keys')
const {QL0} = require('../')

const ALICE_ID = ssbKeys.generate().id
const BOB_ID = ssbKeys.generate().id

test('validate() happy inputs', (t) => {
  t.equals(
    QL0.validate({ author: ALICE_ID, type: 'vote' }),
    undefined,
    'validated'
  )
  t.end()
})

test('validate() sad inputs', (t) => {
  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, type: 'vote', other: 123 })
    },
    /too many fields/,
    'too many fields'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID })
    },
    /missing the "type" field/,
    'missing type'
  )

  t.throws(
    () => {
      QL0.validate({ type: 'vote' })
    },
    /missing the "author" field/,
    'missing author'
  )

  t.throws(
    () => {
      QL0.validate({ author: 3, type: 'vote' })
    },
    /"author" should be a valid string/,
    'author not string'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, type: 3 })
    },
    /"type" should be a valid string/,
    'type not string'
  )

  t.throws(
    () => {
      QL0.validate({ author: '@fafa', type: 'vote' })
    },
    /should be a valid SSB feed ID/,
    'bad author'
  )
  t.end()
})

test('parse() happy inputs', (t) => {
  const parsed1 = QL0.parse(`{"author":"${ALICE_ID}","type":"vote"}`)
  t.deepEquals(parsed1, { author: ALICE_ID, type: 'vote' }, 'parsed string')

  const parsed2 = QL0.parse({ author: ALICE_ID, type: 'vote' })
  t.deepEquals(parsed2, { author: ALICE_ID, type: 'vote' }, 'parsed obj')

  t.end()
})

test('parse() sad inputs', (t) => {
  let timesWarned = 0
  console.warn = () => {
    ++timesWarned
  }

  t.equals(QL0.parse(null), null, 'no input')
  t.equals(QL0.parse(3), null, 'bad input')
  t.equals(QL0.parse('completenonsense'), null, 'bad string')
  t.equals(QL0.parse({ author: ALICE_ID }), null, 'validation failed')
  t.equals(timesWarned, 3, 'console.warn called 3 times')

  t.end()
})

test('toOperator()', (t) => {
  const actualOP = QL0.toOperator({ author: ALICE_ID, type: 'vote' })
  const expectedOP = and(author(ALICE_ID, { dedicated: true }), type('vote'))
  t.deepEquals(actualOP, expectedOP, 'output is correct')
  t.end()
})

test('stringify()', (t) => {
  const q1 = { author: ALICE_ID, type: 'vote' }
  t.equals(QL0.stringify(q1), JSON.stringify(q1), 'same as JSON.stringify')

  const q2 = { type: 'vote', author: ALICE_ID }
  t.equals(QL0.stringify(q2), JSON.stringify(q1), 'order is author & type')
  t.notEquals(QL0.stringify(q2), JSON.stringify(q2), 'order is stable')
  t.end()
})

test('isEquals()', (t) => {
  t.true(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote' },
      { type: 'vote', author: ALICE_ID }
    ),
    'order doesnt matter'
  )

  t.true(
    QL0.isEquals(`{"author":"${ALICE_ID}","type":"vote"}`, {
      author: ALICE_ID,
      type: 'vote',
    }),
    'string or obj, doesnt matter'
  )

  t.false(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote' },
      { author: BOB_ID, type: 'vote' }
    ),
    'author must match'
  )

  t.false(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote' },
      { author: ALICE_ID, type: 'post' }
    ),
    'type must match'
  )
  t.end()
})
