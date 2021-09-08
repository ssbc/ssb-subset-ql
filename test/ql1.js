const test = require('tape')
const { and, author, type } = require('ssb-db2/operators')
const ssbKeys = require('ssb-keys')
const { QL1 } = require('../')

const ALICE_ID = ssbKeys.generate().id

test('QL1.toOperator()', (t) => {
  const actualOP = QL1.toOperator(
    {
      op: 'and',
      args: [
        { op: 'type', string: 'vote' },
        { op: 'author', feed: ALICE_ID },
      ],
    },
    true
  )
  const expectedOP = and(
    type('vote', { dedicated: true }),
    author(ALICE_ID, { dedicated: true })
  )
  t.deepEquals(actualOP, expectedOP, 'output is correct')
  t.end()
})

test('QL1.stringify()', (t) => {
  const q1 = {
    op: 'and',
    args: [
      { op: 'type', string: 'vote' },
      { op: 'author', feed: ALICE_ID },
    ],
  }
  t.equals(QL1.stringify(q1), JSON.stringify(q1), 'same as JSON.stringify')

  t.end()
})
