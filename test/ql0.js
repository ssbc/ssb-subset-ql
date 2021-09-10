const test = require('tape')
const { and, author, type } = require('ssb-db2/operators')
const ssbKeys = require('ssb-keys')
const { QL0 } = require('../')

const ALICE_ID = ssbKeys.generate().id
const BOB_ID = ssbKeys.generate().id

test('QL0.validate() happy inputs', (t) => {
  t.equals(
    QL0.validate({ author: ALICE_ID, type: 'vote', private: false }),
    undefined,
    'basic object'
  )

  t.equals(
    QL0.validate(
      JSON.stringify({ author: ALICE_ID, type: 'vote', private: false })
    ),
    undefined,
    'json stringified'
  )

  t.equals(
    QL0.validate({ author: ALICE_ID, type: null, private: false }),
    undefined,
    'type null'
  )

  t.end()
})

test('QL0.validate() sad inputs', (t) => {
  t.throws(
    () => {
      QL0.validate({
        author: ALICE_ID,
        type: 'vote',
        private: false,
        other: 123,
      })
    },
    /too many fields/,
    'too many fields'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, private: false })
    },
    /missing the "type" field/,
    'missing type'
  )

  t.throws(
    () => {
      QL0.validate({ type: 'vote', private: false })
    },
    /missing the "author" field/,
    'missing author'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, type: 'vote' })
    },
    /missing the "private" field/,
    'missing private'
  )

  t.throws(
    () => {
      QL0.validate({ author: 3, type: 'vote', private: false })
    },
    /"author" should be a string/,
    'author not string'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, type: 3, private: false })
    },
    /"type" should be a string/,
    'type not string'
  )

  t.throws(
    () => {
      QL0.validate({ author: ALICE_ID, type: 'vote', private: 'yes' })
    },
    /"private" should be a boolean/,
    'private not boolean'
  )

  t.throws(
    () => {
      QL0.validate({ author: '@fafa', type: 'vote', private: false })
    },
    /should be a valid SSB feed ID/,
    'bad author'
  )

  t.throws(
    () => {
      QL0.validate(null)
    },
    /should be truthy/,
    'bad input'
  )

  t.throws(
    () => {
      QL0.validate(3)
    },
    /should be a string or an object/,
    'bad input'
  )
  t.end()
})

test('QL0.parse() happy inputs', (t) => {
  const parsed1 = QL0.parse(
    `{"author":"${ALICE_ID}","type":"vote","private":false}`
  )
  t.deepEquals(
    parsed1,
    { author: ALICE_ID, type: 'vote', private: false },
    'parsed string'
  )

  const parsed2 = QL0.parse({ author: ALICE_ID, type: 'vote', private: false })
  t.deepEquals(
    parsed2,
    { author: ALICE_ID, type: 'vote', private: false },
    'parsed obj'
  )

  t.end()
})

test('QL0.parse() sad inputs', (t) => {
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

test('QL0.toOperator()', (t) => {
  const actualOP = QL0.toOperator(
    { author: ALICE_ID, type: 'vote', private: false },
    true
  )
  const expectedOP = and(
    author(ALICE_ID, { dedicated: true }),
    type('vote', { dedicated: true })
  )
  t.deepEquals(actualOP, expectedOP, 'output is correct')
  t.end()
})

test('QL0.stringify()', (t) => {
  const q1 = { author: ALICE_ID, type: 'vote', private: false }
  t.equals(QL0.stringify(q1), JSON.stringify(q1), 'same as JSON.stringify')

  const q2 = { type: 'vote', author: ALICE_ID, private: false }
  t.equals(QL0.stringify(q2), JSON.stringify(q1), 'order is author & type')
  t.notEquals(QL0.stringify(q2), JSON.stringify(q2), 'order is stable')
  t.end()
})

test('QL0.isEquals()', (t) => {
  t.true(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote', private: false },
      { type: 'vote', author: ALICE_ID, private: false }
    ),
    'order doesnt matter'
  )

  t.true(
    QL0.isEquals(`{"private":false,"author":"${ALICE_ID}","type":"vote"}`, {
      author: ALICE_ID,
      type: 'vote',
      private: false,
    }),
    'string or obj, doesnt matter'
  )

  t.false(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote', private: false },
      { author: BOB_ID, type: 'vote', private: false }
    ),
    'author must match'
  )

  t.false(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote', private: false },
      { author: ALICE_ID, type: 'post', private: false }
    ),
    'type must match'
  )

  t.false(
    QL0.isEquals(
      { author: ALICE_ID, type: 'vote', private: false },
      { author: ALICE_ID, type: 'vote', private: true }
    ),
    'private must match'
  )

  t.end()
})
