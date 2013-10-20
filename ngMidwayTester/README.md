# ngMidwayTester

A pure-javascript integration tester for AngularJS that can be run inline with application code.  

## Installation

1. npm install ngMidwayTester.
2. include `./node_modules/ngMidwayTester/src/ngMidwayTester.js` into your test runner.

## Getting Started

Inside of your test spec code, you can use the midway tester like so:

```javascript
//creating the tester
var tester = ngMidwayTester('moduleName');

//destroying the tester
tester.destroy();
tester = null;
```

Be sure to have a new instance of the tester for each spec you're testing.

## Docs

http://yearofmoo.github.io/ngMidwayTester/docs
