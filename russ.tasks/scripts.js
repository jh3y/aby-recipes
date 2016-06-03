module.exports = [
  {
    name: 'compile:scripts',
    doc : 'compiles runtime JavaScript files',
    deps: [
      'fs',
      'path',
      'glob',
      'mkdirp',
      'uglify-js'
    ],
    func: function(fs, path, glob, mkdirp, uglify, russ) {
      const isDist = russ.env === 'dist';
      const outputDir = russ.config.paths.destinations.scripts;
      const pushToServe = (filePath) => {
        mkdirp.sync(`${outputDir}src/js`);
        const content = fs.readFileSync(filePath);
        fs.writeFileSync(`${outputDir}${filePath}`, content);
      };
      mkdirp.sync(outputDir);
      glob(russ.config.paths.sources.scripts, (err, files) => {
        if (!isDist) files.map(pushToServe);
        const res = uglify.minify(files, {
          outSourceMap: (!isDist) ? 'source.js.map' : null,
          wrap: 'recipes'
        });
        fs.writeFileSync('public/js/scripts.js', res.code);
        if (!isDist) fs.writeFileSync('public/js/source.js.map', res.map);
        russ.resolve();
      });
    }
  },
  {
    name: 'lint:scripts',
    doc: 'lints scripts using eslint',
    func: function(russ) {
      setTimeout(() => {
        russ.reject('hhhhmmm');
      }, 1000);
    }
  },
  {
    name: 'watch:scripts',
    doc: 'watch for script source changes then run and compile',
    deps: [
      'gaze'
    ],
    func: function(gaze, russ) {
      gaze(russ.config.paths.sources.scripts, (err, watcher) => {
        watcher.on('changed', (filepath) => {
          russ.log.info(`${filepath} changed!`);
          russ.run('compile:scripts');
        });
      });
    }
  }
];
