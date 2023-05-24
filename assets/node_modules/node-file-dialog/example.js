const dialog = require('node-file-dialog').dialog;
const config = {
  type: 'open-file',
  extra: {
    ext: ".mp4",
    types: {
      "mp4 files": '.mp4',
      "webm files": ".webm",
      "mov files": ".mov"
    },
    startdir: "E:\\development\\node-file-dialog-fork",
    title: 'selection test'
  }
};
dialog(config).then(dir => console.log(dir)).catch(err => console.log(err))
