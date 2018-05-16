# rx-subject
[![NPM](https://nodei.co/npm/rx-subject.png?compact=true)](https://nodei.co/npm/rx-subject/)

minimal Subject implementation, independent of reactive framework.

a Subject exposes a `sink` Observer, and a `source$` Subscribable.
values pushed into the `sink` Observer are emitted by the `source$` Subscribable.

the `source$` Subscribable is hot and accepts any number of subscribers.

# Credits
* implementation based on createEventHandler from [`recompose`](https://github.com/acdlite/recompose).
* unit tests based on the [Subject test suite](https://github.com/ReactiveX/rxjs/spec/Subject-spec.ts) of [`RxJS`](http://reactivex.io/rxjs/).

# API
this module exposes a Subject factory:
```ts
export default function createSubject<T>(): Subject<T>

export interface Subject<T> {
  sink: Observer<T>
  source$: Subscribable<T>
}

export interface Observer<T> {
  next(val: T): void
  error?(error?: any): void
  complete?(): void
}

export interface Subscribable<T> {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    next: (val: T) => void,
    error?: (error?: any) => void,
    complete?: () => void
  ): Subscription
}

export interface Subscription {
  unsubscribe(): void
}
```

for a detailed specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/rx-subject/v3.0.2/spec/web/index.html)
in your browser.
these unit tests are a subset of the [RxJS Subject test suite](https://github.com/ReactiveX/rxjs/spec/Subject-spec.ts).

# `Symbol.observable`
This module expects `Symbol.observable` to be defined in the global scope.
Use a polyfill such as [`symbol-observable`](https://npmjs.com/package/symbol-observable/)
and if necessary a `Symbol` polyfill.
Check the [`symbol-observable-polyfill` script](./package.json#L10)
for an example of how to generate the standalone polyfill,
which can than be [loaded from a script tag](./spec/web/index.html#L26),
or simply add `import 'symbol-observable'` at the top of your project's main file.

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.
