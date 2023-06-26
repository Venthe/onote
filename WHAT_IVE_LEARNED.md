# WIL

* When working with a list, and use fragments - one must assign KEY to top level element, in this example a Fragment - wherein <></> syntax won't wrok
* Old state should never be mutated. New state should always be "new". Consider immer/deep copy
* Sort mutates. Bad, bad function :)
* Are hooks named useX necessary? / No, it's a convention
* useRef does not rerender
* One can use context to pass data across the levels
* Add react-specific linter for hooks
* Change key to force react to reset state
* Use effect only for code that should run BECAUSE the element was displated
* In dev, there is a mechanism tied to a strict mode which causes a second run of an effect after destrucor
* When fetching external data, one will encounter race conditions. This is bull. https://react.dev/learn/synchronizing-with-effects#fetching-data
