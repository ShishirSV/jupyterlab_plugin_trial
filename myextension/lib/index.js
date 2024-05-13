const { ToolbarButton } = require("@jupyterlab/apputils");
const { DocumentRegistry } = require("@jupyterlab/docregistry");
const { NotebookPanel, Notebook } = require("@jupyterlab/notebook");
const { IDisposable } = require("@lumino/disposable");
const {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  JupyterLab, JupyterLabPlugin
} = require('@jupyterlab/application');
const { editorServices } = require('@jupyterlab/codemirror');
const app = JupyterFrontEnd.instance;
const saveAs = require('file-saver');

class ButtonExtension {
  constructor(app) {
    this.app = app;
  }

  createNew(panel, context) {
    let story_creation = new ToolbarButton({
        label: 'Create Story',
        onClick: () => this.addStory(panel, context)
    });
    panel.toolbar.insertItem(10, 'story_creation', story_creation);

    let to_csv = new ToolbarButton({
      label: 'Save to CSV',
      onClick: () => this.saveToCSV(context)
    });
    panel.toolbar.insertItem(11, 'to_csv', to_csv);

    return [story_creation, to_csv];
  }

  async saveToCSV(context) {
    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    console.log(activeCell);
    const cellContent = activeCell.model.sharedModel.getSource();
    console.log(cellContent);
    const blob = new Blob([cellContent], {type: 'text/csv;charset=utf-8'});
    saveAs(blob, 'data.csv');

    await context.save();
    console.log('Notebook saved');
  }

  async addStory(panel, context) {
    // console.log(this.app.commands);

    // Inserting new cell below
    this.app.commands.execute('notebook:insert-cell-below');

    // const notebook = new Notebook();
    // // const content_factory = notebook.contentFactory;
    // const active_cell = notebook.activeCell;
    // console.log(active_cell);

    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    // activeCell.loadEditableState();
    console.log(activeCell);
    console.log(activeCell.editor);
    
    // Story comments
    const story_comments = [
      '# id: ',
      '# description: ',
      '# accpentance_criteria: '
    ];
    const story_text = story_comments.join('\n');
    activeCell.model.sharedModel.setSource(story_text);

    // Saving the file
    await context.save();
  }

  // async createStory(panel) {
  //   // const cell = panel.content.model.contentFactory.createCodeCell({
  //   //   cell: {
  //   //     source: code[model.defaultKernelName],
  //   //     metadata: {
  //   //       trusted: true
  //   //     }
  //   //   }
  //   // });
    


  //   const widget = panel.content;
  //   const active_cell = widget.activeCell; 
  //   console.log(active_cell);

  //   if (active_cell && active_cell.model.type === 'code') {
  //     const story_comments = [
  //       '# id: ',
  //       '# description: ',
  //       '# accpentance_criteria: '
  //     ];

  //     const code = active_cell.value.text;
  //     const new_code = story_comments.join('\n') + '\n' + code;
  //     active_cell.value.text = new_code;

  //     console.log('Story created');
  //   } else {
  //     console.log('No active cell');
  //   }
  // }
}

// Plugin to be exported
const yourPlugin = {
  id: 'story-buttons',
  autoStart: true,
  activate: (app) => {
    const your_button = new ButtonExtension(app);
    app.docRegistry.addWidgetExtension('Notebook', your_button);
  }
};

module.exports = yourPlugin;


