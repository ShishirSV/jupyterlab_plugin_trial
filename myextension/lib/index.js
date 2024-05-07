const { ToolbarButton } = require("@jupyterlab/apputils");
const { DocumentRegistry } = require("@jupyterlab/docregistry");
const { NotebookPanel, Notebook } = require("@jupyterlab/notebook");
const { IDisposable } = require("@lumino/disposable");
const {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} = require('@jupyterlab/application');
const { editorServices } = require('@jupyterlab/codemirror');
const app = JupyterFrontEnd.instance;

class ButtonExtension {
  createNew(panel, context) {
    let story_creation = new ToolbarButton({
        label: 'Create Story',
        onClick: () => this.addStory()
    });
    panel.toolbar.insertItem(10, 'story_creation', story_creation);

    let to_csv = new ToolbarButton({
      label: 'Save to CSV',
      onClick: () => this.saveNotebook(context)
    });
    panel.toolbar.insertItem(11, 'to_csv', to_csv);

    return [story_creation, to_csv];
  }

  async saveNotebook(context) {
    console.log(context);
    await context.save();
    console.log('Notebook saved');
  }

  async addStory() {
    const notebook = new Notebook();
    // const content_factory = notebook.contentFactory;
    const active_cell = notebook.activeCell;
    console.log(active_cell);
    
    // Story comments
    const story_comments = [
      '# id: ',
      '# description: ',
      '# accpentance_criteria: '
    ];

  }

  async createStory(panel) {
    // const cell = panel.content.model.contentFactory.createCodeCell({
    //   cell: {
    //     source: code[model.defaultKernelName],
    //     metadata: {
    //       trusted: true
    //     }
    //   }
    // });
    


    const widget = panel.content;
    const active_cell = widget.activeCell; 
    console.log(active_cell);

    if (active_cell && active_cell.model.type === 'code') {
      const story_comments = [
        '# id: ',
        '# description: ',
        '# accpentance_criteria: '
      ];

      const code = active_cell.value.text;
      const new_code = story_comments.join('\n') + '\n' + code;
      active_cell.value.text = new_code;

      console.log('Story created');
    } else {
      console.log('No active cell');
    }
  }
}

const yourPlugin = {
  id: 'story-buttons',
  autoStart: true,
  activate: (app) => {
    const your_button = new ButtonExtension();
    app.docRegistry.addWidgetExtension('Notebook', your_button);
  }
};

module.exports = yourPlugin;


