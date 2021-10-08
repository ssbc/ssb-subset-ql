// SPDX-FileCopyrightText: 2021 Andre 'Staltz' Medeiros
//
// SPDX-License-Identifier: Unlicense

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

test('QL1.validate() happy inputs', (t) => {
  t.equals(
    QL1.validate({
      op: 'and',
      args: [
        { op: 'type', string: 'vote' },
        { op: 'author', feed: ALICE_ID },
      ],
    }),
    undefined,
    'validated'
  )

  t.equals(
    QL1.validate(
      JSON.stringify({
        op: 'and',
        args: [
          { op: 'type', string: 'vote' },
          { op: 'author', feed: ALICE_ID },
        ],
      })
    ),
    undefined,
    'validated'
  )
  t.end()
})

test('QL1.validate() sad inputs', (t) => {
  t.throws(
    () => {
      QL1.validate('')
    },
    (err) => err.message.startsWith('query should be truthy'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate(3)
    },
    (err) => err.message.startsWith('query should be a string or an object'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({})
    },
    (err) => err.message.startsWith('query is missing "op"'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({ op: 'and', args: 123 })
    },
    (err) => err.message.startsWith('"args" field must be an array'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({
        op: 'ThisIsNotAValidOperator',
        args: [
          { op: 'type', string: 'vote' },
          { op: 'author', feed: ALICE_ID },
        ],
      })
    },
    (err) => err.message.startsWith('Unknown "op" field'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({
        op: 'and',
        args: [{ op: 'type' }, { op: 'author', feed: ALICE_ID }],
      })
    },
    (err) => err.message.startsWith('"type" in the query must have a "string"'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({
        op: 'and',
        args: [{ op: 'type', string: 'vote' }, { op: 'author' }],
      })
    },
    (err) => err.message.startsWith('"author" in the query must have a "feed"'),
    'bad input'
  )

  t.throws(
    () => {
      QL1.validate({
        op: 'or',
        args: [
          { op: 'ThisIsNotAValidOP', string: 'vote' },
          { op: 'author', feed: ALICE_ID },
        ],
      })
    },
    (err) => err.message.startsWith('Unknown "op" field'),
    'bad input'
  )
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

test('QL1.isEquals() is not supported (yet)', (t) => {
  t.throws(() => {
    QL1.isEquals(
      {
        op: 'and',
        args: [
          { op: 'type', string: 'vote' },
          { op: 'author', feed: ALICE_ID },
        ],
      },
      {
        op: 'and',
        args: [
          { op: 'type', string: 'vote' },
          { op: 'author', feed: ALICE_ID },
        ],
      }
    ),
      (err) => err.message.startsWith('QL1.isEquals() is not supported'),
      'throws error'
  })
  t.end()
})
