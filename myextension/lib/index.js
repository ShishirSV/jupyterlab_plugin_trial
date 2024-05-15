const story_comments = require('./config').story_comments;
const story_details = require('./config').story_details;
const story_pattern = require('./config').story_pattern;
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
const { checkCellIsStory, checkPreApproval } = require('./helper');
const axios = require('axios');
const { DOMUtils } = require('@jupyterlab/apputils');
const userRoles = require('./users');

class ButtonExtension {
  constructor(app) {
    this.app = app;
    this.username = this.extractUsernameFromURL(); // Retrieve the username from JupyterHub's environment variables
    this.userRole = userRoles[this.username]; // Retrieve the user role from JupyterHub's environment variables
    // this.initializeUserInfo();
  }

  // async initializeUserInfo() {
  //   try {
  //     const response = await axios.get('/hub/api/user', { withCredentials: true });
  //     this.username = response.data.name;
  //     this.userRole = response.data.admin ? 'admin' : 'user';  // Adjust role logic as needed
  //   } catch (error) {
  //     console.error('Error fetching user info:', error);
  //   }
  // }

  // Function to extract the username from the URL
  extractUsernameFromURL() {
    // const currentUrl = DOMUtils.fullPath(window.location);
    // console.log(currentUrl);

    const pathParts = window.location.pathname.split('/');
    console.log(pathParts);
    const userIndex = pathParts.indexOf('user');
    return userIndex !== -1 && userIndex + 1 < pathParts.length ? pathParts[userIndex + 1] : '';
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

    let add_details = new ToolbarButton({
      label: 'Add Details',
      onClick: () => this.addStoryDetails(panel, context)
    });
    panel.toolbar.insertItem(12, 'add_details', add_details);

    if (this.userRole === 'admin') {
      let approve_story = new ToolbarButton({
        label: 'Approve',
        onClick: () => this.approveStory(panel, context)
      });
      panel.toolbar.insertItem(13, 'approve_story', approve_story);
    }
    return [story_creation, to_csv, add_details, approve_story];
  }

  async saveToCSV(context) {
    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    console.log(activeCell);

    // Save the cell content to a CSV file
    const cellContent = activeCell.model.sharedModel.getSource();
    console.log(cellContent);
    const blob = new Blob([cellContent], {type: 'text/csv;charset=utf-8'});
    saveAs(blob, 'data.csv');

    await context.save();
    console.log('Notebook saved');
  }

  async addStoryDetails(panel, context) {
    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    
    // Get the cell content
    const cellContent = activeCell.model.sharedModel.getSource();
    const cellArray = cellContent.split('\n');
    // console.log(cellArray); // Debug log: inspect cell content
    // console.log(story_comments); // Debug log: inspect story comments

    // Check if the cell is a story cell
    if (checkCellIsStory(cellArray)) {
      console.log('Story cell');
      const newCellContent = cellArray.concat(story_details).join('\n');
      activeCell.model.sharedModel.setSource(newCellContent);
    } else {
      console.log('Not a valid story cell');
    }
  }

  async approveStory(panel, context) {
    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    
    // Get the cell content
    const cellContent = activeCell.model.sharedModel.getSource();
    const cellArray = cellContent.split('\n');

    // Check cell for approval
    if (checkPreApproval(cellArray)) {
      const newCellContent = cellArray.concat(['# Approved']).join('\n');
      activeCell.model.sharedModel.setSource(newCellContent);
      console.log('Approved');
    } else {
      console.log('Not approved');
    }
  }

  async addStory(panel, context) {
    console.log(this.username);
    // Inserting new cell below
    this.app.commands.execute('notebook:insert-cell-below');

    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    console.log(activeCell);
    console.log(activeCell.editor);
    
    const story_text = story_comments.join('\n');
    activeCell.model.sharedModel.setSource(story_text);

    // Saving the file
    await context.save();
  }
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


