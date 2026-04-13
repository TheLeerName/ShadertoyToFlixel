const {exec} = require('child_process');
const path = require('path');
const {EOL} = require('os');
const pjson = require('./package.json');
const root = __dirname;

function askdialog(config) {
  var cmd = ""
  if (config.type === 'directory')
    cmd += ' -d';
  else if (config.type === 'save-file')
    cmd += ' -s';
  else if (config.type === 'open-file')
    cmd += ' -o';
  else if (config.type === 'open-files')
    cmd += ' -f';
  
  if (config.extra) {
    if (config.extra.ext) cmd += ` -ext="${config.extra.ext}"`;
    if (config.extra.types) {
      for (const item in config.extra.types) {
        const indexes = Object.keys(config.extra.types)
        if (item == indexes[0]) {
          cmd += ` -types="[('${item}','${config.extra.types[item]}')`
        }
        if (item != indexes[0]) {
          cmd += `,('${item}', '${config.extra.types[item]}')`
        }
      }
      cmd += ']"'
    }
    if (config.extra.startdir) cmd += ` -dir="${config.extra.startdir}"`;
    if (config.extra.startfile) cmd += ` -file="${config.extra.startfile}"`;
    if (config.extra.title) cmd += ` -title="${config.extra.title}"`;
  }


  var promise = new Promise((resolve, reject) => {
    exec(root + "\\python\\dist\\dialog.exe" + cmd, (error, stdout, stderr) => {
      if (stdout) {
        if (stdout.trim() === 'None')
          reject(new Error('Nothing selected'));
        else
          resolve(stdout.trim().split(EOL));
      } else if (error) {
        reject(new Error(error));
      } else if (stderr) {
        reject(new Error(stderr));
      }
    });
  })
  return promise;
}

module.exports = {dialog: askdialog};
