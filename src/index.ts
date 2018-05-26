/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
export interface Subject<T> {
  sink: Observer<T>
  source$: Subscribable<T>
}

export interface Observer<T> {
  next (val: T): void
  error? (error?: any): void
  complete? (): void
}

export interface Subscribable<T> {
  subscribe(observer: Observer<T>): Subscription
  subscribe (
    next: (val: T) => void,
    error?: (error?: any) => void,
    complete?: () => void
  ): Subscription
}

export interface Subscription {
  unsubscribe (): void
}

export default function createSubject <T>(): Subject<T> {
  let done: { key: 'error'|'complete', args: any[] }
  const observers = [] as Observer<T>[]

  const sink: Observer<T> = {
    next: emit('next'),
    error: emit('error'),
    complete: emit('complete')
  }

  const source$ = {
    subscribe,
    [Symbol.observable](): Subscribable<T> { return this }
  }

  return { sink, source$ }

  function emit (this: void, key: 'next'|'error'|'complete') {
    return function(...args: any[]) {
      if (done) { return }
      // freeze observers list before iteration
      for (const observer of observers.slice()) { apply(observer, key, args) }
      if (key === 'next') { return }
      observers.splice(0, observers.length)
      done = { key, args }
    }
  }

  function subscribe (
    this: void,
    observerOrNext: Observer<T>|((val: T) => void),
    error?: (error?: any) => void,
    complete?: () => void
  ) {
    const observer = toObserver(observerOrNext, error, complete)

    if (done) {
      const { key, args } = done
      apply(observer, key, args)
      return { unsubscribe() {} }
    }

    observers.push(observer)
    return { unsubscribe }

    function unsubscribe (): void {
      const i = observers.indexOf(observer)
      if (i >= 0) { observers.splice(i, 1) }
    }
  }
}

function toObserver <T>(
    this: void,
    observerOrNext = nop as Observer<T>|((val: T) => void),
    error = nop as (error?: any) => void,
    complete = nop as () => void
): Observer<T> {
  return typeof observerOrNext !== 'function'
    ? toObserver(
        observerOrNext.next.bind(observerOrNext),
        observerOrNext.error.bind(observerOrNext),
        observerOrNext.complete.bind(observerOrNext)
      )
    : { next: observerOrNext, error, complete }
}

function apply <T>(observer: Observer<T>, key: string, args: any[]) {
  ;(observer[key] as (val?: T) => void)(...args)
}

function nop () {}
