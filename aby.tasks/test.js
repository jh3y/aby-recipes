module.exports = [
  {
    name: 'FAKER',
    doc : 'Test fake module',
    deps: [
      'fake-module'
    ],
    func: function(fake, instance) {
      setTimeout(instance.resolve, 500);
    }
  },
  {
    name: 'TEST',
    doc: 'getting require working :(',
    sequence: [
      'A',
      'B'
    ]
  },
  {
    name: 'A',
    doc: 'task a',
    post: 'B',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 2000);
    }
  },
  {
    name: 'B',
    doc: 'task b',
    pre: 'A',
    post: 'C',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 10000);
    }
  },
  {
    name: 'C',
    doc: 'task c',
    pre: 'B',
    post: 'D',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 3000);
    }
  },
  {
    name: 'D',
    doc: 'task d',
    pre: 'C',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 1000);
    }
  },
  {
    name: 'Z',
    doc: 'Boilerplate half second timeout log',
    pre: 'lint:scripts',
    func: (instance) => {
      setTimeout(instance.resolve, 500);
    }
  },
  {
    name: 'E',
    doc: 'runs compile:scripts followed by compile:styles',
    sequence: [
      'compile:scripts',
      'compile:styles'
    ]
  },
  {
    name: 'L',
    doc : 'test context',
    func: (instance) => {
      console.log(this);
      Object.assign(this, instance);
      console.log(this);
      instance.resolve();
    }
  },
  {
    name: 'F',
    doc: 'runs watch:scripts and watch:styles simultaneously',
    concurrent: [
      'watch:scripts',
      'watch:styles'
    ]
  },
  {
    name: 'big',
    doc: 'runs some things',
    sequence: [
      'Z',
      'compile',
      'A',
      'server'
    ]
  }
];
