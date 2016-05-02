module.exports = [
  {
    name: 'compile:markup',
    doc : 'compile markup',
    deps: [
      'fs',
      'glob',
      'pug',
      'path',
      'mkdirp'
    ],
    func: (fs, glob, pug, path, mkdirp, aby) => {
      const outputDir = aby.config.paths.destinations.markup;
      mkdirp.sync(outputDir);
      glob(aby.config.paths.sources.docs, (err, files) => {
        for (const file of files) {
          try {
            const data = aby.config.pluginOpts.pug.data,
              markup = pug.compileFile(`${process.cwd()}/${file}`)(data),
              name = path.basename(file, '.pug'),
              loc = `${outputDir}${name}.html`;
            fs.writeFileSync(loc, markup);
            aby.log.info(`${loc} created!`);
          } catch (err) {
            aby.reject(err);
          }
        }
        aby.resolve();
      });
    }
  },
  {
    name: 'lint:markup',
    doc: 'lint markup src',
    deps: [
      'fs',
      'glob',
      'pug-lint'
    ],
    func: (fs, glob, plinter, aby) => {
      'use strict';
      try {
        const linter = new plinter(),
          config = require(`${process.cwd()}/.puglintrc`);
        linter.configure(config);
        glob(aby.config.paths.sources.markup, (err, files) => {
          for (const file of files) {
            const errors = linter.checkFile(file);
            if (errors.length > 0) {
              var errString = `\n\n${errors.length} error/s found in ${file} \n`;
              for (const err of errors)
                errString += `${err.msg} @ line ${err.line} column ${err.column}\n`;
              aby.log.error(errString);
            }
          }
          aby.resolve();
        });
      } catch (err) {
        aby.reject(err);
      }
    }
  },
  {
    name: 'watch:markup',
    doc: 'watch and compile markup files',
    deps: [
      'gaze'
    ],
    func: function(gaze, aby) {
      gaze(aby.config.paths.sources.markup, (err, watcher) => {
        watcher.on('changed', function(file) {
          aby.log.info(`${file} changed!`);
          aby.run('compile:markup');
        });
      });
    }
  }
];
