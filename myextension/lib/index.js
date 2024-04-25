module.exports = [
  {
    id: 'myextension',
    autoStart: true,
    activate: function (app) {
      console.log(
        'JupyterLab extension myextension is activated!'
      );
      console.log(app.commands);
    }
  }
];
