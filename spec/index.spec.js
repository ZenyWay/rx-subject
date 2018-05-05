'use strict' /* eslint-env jasmine */
/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 *
 * adapted from https://github.com/ReactiveX/rxjs/spec/Subject-spec.ts
 * LICENSE (full text): https://github.com/ReactiveX/rxjs/LICENSE.txt
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
const createSubject = require('../').default
const observableOf = require('rxjs').of
const delay = require('rxjs/operators').delay
const Subscriber = require('rxjs').Subscriber

describe('Subject', function () {
  describe('.source$', function () {
    it('should expose a compliant `Symbol.observable` property', function () {
      const subject = createSubject()
      expect(subject.source$[Symbol.observable]).toEqual(jasmine.any(Function))
      expect(subject.source$[Symbol.observable]()).toBe(subject.source$)
    })

    it('should pump values right on through itself', function (done) {
      const subject = createSubject()
      const expected = ['foo', 'bar']

      const sub = subject.source$.subscribe(
        function (x) {
          expect(x).toBe(expected.shift())
        },
        function (x) {
          sub.unsubscribe()
          done(new Error('should not be called'))
        },
        function (x) {
          sub.unsubscribe()
          done()
        }
      )

      subject.sink.next('foo')
      subject.sink.next('bar')
      subject.sink.complete()
    })

    it('should pump values to multiple subscribers', function (done) {
      const subject = createSubject()
      const expected = ['foo', 'bar']
      const subs = []

      let i = 0
      let j = 0

      subs.push(subject.source$.subscribe(function (x) {
        expect(x).toBe(expected[i++])
      }))

      subs.push(subject.source$.subscribe(
        function (x) {
          expect(x).toBe(expected[j++])
        },
        function (x) {
          subs.forEach(sub => sub.unsubscribe())
          done(new Error('should not be called'))
        },
        function (x) {
          subs.forEach(sub => sub.unsubscribe())
          done()
        }
      ))

      subject.sink.next('foo')
      subject.sink.next('bar')
      subject.sink.complete()
    })

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject does not complete', function () {
      const subject = createSubject()
      const results1 = []
      const results2 = []
      const results3 = []

      subject.sink.next(1)
      subject.sink.next(2)
      subject.sink.next(3)
      subject.sink.next(4)

      const subscription1 = subject.source$.subscribe(
        function (x) { results1.push(x) },
        function (e) { results1.push('E') },
        function () { results1.push('C') }
      )

      subject.sink.next(5)

      const subscription2 = subject.source$.subscribe(
        function (x) { results2.push(x) },
        function (e) { results2.push('E') },
        function () { results2.push('C') }
      )

      subject.sink.next(6)
      subject.sink.next(7)

      subscription1.unsubscribe()

      subject.sink.next(8)

      subscription2.unsubscribe()

      subject.sink.next(9)
      subject.sink.next(10)

      const subscription3 = subject.source$.subscribe(
        function (x) { results3.push(x) },
        function (e) { results3.push('E') },
        function () { results3.push('C') }
      )

      subject.sink.next(11)

      subscription3.unsubscribe()

      expect(results1).toEqual([5, 6, 7])
      expect(results2).toEqual([6, 7, 8])
      expect(results3).toEqual([11])
    })

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject completes', function () {
      const subject = createSubject()
      const results1 = []
      const results2 = []
      const results3 = []

      subject.sink.next(1)
      subject.sink.next(2)
      subject.sink.next(3)
      subject.sink.next(4)

      const subscription1 = subject.source$.subscribe(
        function (x) { results1.push(x) },
        function (e) { results1.push('E') },
        function () { results1.push('C') }
      )

      subject.sink.next(5)

      const subscription2 = subject.source$.subscribe(
        function (x) { results2.push(x) },
        function (e) { results2.push('E') },
        function () { results2.push('C') }
      )

      subject.sink.next(6)
      subject.sink.next(7)

      subscription1.unsubscribe()

      subject.sink.complete()

      subscription2.unsubscribe()

      const subscription3 = subject.source$.subscribe(
        function (x) { results3.push(x) },
        function (e) { results3.push('E') },
        function () { results3.push('C') }
      )

      subscription3.unsubscribe()

      expect(results1).toEqual([5, 6, 7])
      expect(results2).toEqual([6, 7, 'C'])
      expect(results3).toEqual(['C'])
    })

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject terminates with an error', function () {
      const subject = createSubject()
      const results1 = []
      const results2 = []
      const results3 = []

      subject.sink.next(1)
      subject.sink.next(2)
      subject.sink.next(3)
      subject.sink.next(4)

      const subscription1 = subject.source$.subscribe(
        function (x) { results1.push(x) },
        function (e) { results1.push('E') },
        function () { results1.push('C') }
      )

      subject.sink.next(5)

      const subscription2 = subject.source$.subscribe(
        function (x) { results2.push(x) },
        function (e) { results2.push('E') },
        function () { results2.push('C') }
      )

      subject.sink.next(6)
      subject.sink.next(7)

      subscription1.unsubscribe()

      subject.sink.error(new Error('err'))

      subscription2.unsubscribe()

      const subscription3 = subject.source$.subscribe(
        function (x) { results3.push(x) },
        function (e) { results3.push('E') },
        function () { results3.push('C') }
      )

      subscription3.unsubscribe()

      expect(results1).toEqual([5, 6, 7])
      expect(results2).toEqual([6, 7, 'E'])
      expect(results3).toEqual(['E'])
    })

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject completes before nexting any value', function () {
      const subject = createSubject()
      const results1 = []
      const results2 = []
      const results3 = []

      const subscription1 = subject.source$.subscribe(
        function (x) { results1.push(x) },
        function (e) { results1.push('E') },
        function () { results1.push('C') }
      )

      const subscription2 = subject.source$.subscribe(
        function (x) { results2.push(x) },
        function (e) { results2.push('E') },
        function () { results2.push('C') }
      )

      subscription1.unsubscribe()

      subject.sink.complete()

      subscription2.unsubscribe()

      const subscription3 = subject.source$.subscribe(
        function (x) { results3.push(x) },
        function (e) { results3.push('E') },
        function () { results3.push('C') }
      )

      subscription3.unsubscribe()

      expect(results1).toEqual([])
      expect(results2).toEqual(['C'])
      expect(results3).toEqual(['C'])
    })
    it('should support subscription from an RxJS Subscriber', function (done) {
      const subject = createSubject()
      const expected = ['foo', 'bar']
      const err = new Error('boom')

      const sub = subject.source$.subscribe(Subscriber.create(
        function (x) {
          expect(x).toBe(expected.shift())
        },
        function (x) {
          expect(x).toBe(err)
          sub.unsubscribe()
          done()
        },
        function (x) {
          sub.unsubscribe()
          done(new Error('should not be called'))
        }
      ))

      subject.sink.next('foo')
      subject.sink.next('bar')
      subject.sink.error(err)
    })
  })

  describe('.sink', function () {
    it('should be an Observer which can be given to Observable.subscribe', function (done) {
      const source = observableOf(1, 2, 3, 4, 5)
      const subject = createSubject()
      const expected = [1, 2, 3, 4, 5]

      const sub = subject.source$.subscribe(
        function (x) {
          expect(x).toBe(expected.shift())
        },
        function (x) {
          sub.unsubscribe()
          done(new Error('should not be called'))
        },
        function (x) {
          sub.unsubscribe()
          done()
        }
      )

      source.subscribe(subject.sink)
    })

    it('should be usable as an Observer of a finite delayed Observable', function (done) {
      const source = observableOf(1, 2, 3).pipe(delay(50))
      const subject = createSubject()

      const expected = [1, 2, 3]

      subject.source$.subscribe(
        function (x) {
          expect(x).toBe(expected.shift())
        },
        function (x) {
          done(new Error('should not be called'))
        },
        function () {
          done()
        })

      source.subscribe(subject.sink)
    })

    it('should not next after completed', function () {
      const subject = createSubject()
      const results = []
      const sub = subject.source$.subscribe(x => results.push(x), null, () => results.push('C'))
      subject.sink.next('a')
      subject.sink.complete()
      subject.sink.next('b')
      expect(results).toEqual(['a', 'C'])
      sub.unsubscribe()
    })

    it('should not next after error', function () {
      const error = new Error('wut?')
      const subject = createSubject()
      const results = []
      const sub = subject.source$.subscribe(x => results.push(x), (err) => results.push(err))
      subject.sink.next('a')
      subject.sink.error(error)
      subject.sink.next('b')
      expect(results).toEqual(['a', error])
      sub.unsubscribe()
    })
  })
})
