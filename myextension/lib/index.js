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
const { checkCellIsStory, checkPreApproval, getCellContentData } = require('./helper');
const { DOMUtils } = require('@jupyterlab/apputils');
const userRoles = require('./users');
const { Widget } = require("@lumino/widgets");
const TOP_AREA_CSS_CLASS = 'jp-TopAreaText';

class ButtonExtension {
  constructor(app) {
    this.app = app;
    this.username = this.extractUsernameFromURL(); // Retrieve the username from JupyterHub's environment variables
    this.userRole = userRoles[this.username]; // Retrieve the user role from JupyterHub's environment variables
  }


  // Function to extract the username from the URL
  extractUsernameFromURL() {
    const pathParts = window.location.pathname.split('/');
    console.log(pathParts);
    const userIndex = pathParts.indexOf('user');
    return userIndex !== -1 && userIndex + 1 < pathParts.length ? pathParts[userIndex + 1] : 'admin';
  }

  createNew(panel, context) {
    let position = 10;
    // Create story button
    if (this.userRole === 'admin' || this.userRole === 'bu') {
      let story_creation = new ToolbarButton({
          label: 'Create Story',
          onClick: () => this.addStory(panel, context)
      });
      panel.toolbar.insertItem(position++, 'story_creation', story_creation);
    }

    // Save to CSV button
    if (true) {
      let to_csv = new ToolbarButton({
        label: 'Save to CSV',
        onClick: () => this.saveToCSV(context)
      });
      panel.toolbar.insertItem(position++, 'to_csv', to_csv);
    }

    // Add details button
    if (this.userRole === 'admin' || this.userRole === 'ds') {
      let add_details = new ToolbarButton({
        label: 'Add Details',
        onClick: () => this.addStoryDetails(panel, context)
      });
      panel.toolbar.insertItem(position++, 'add_details', add_details);
    }

    // Approve story button
    if (this.userRole === 'admin' || this.userRole === 'bu') {
      let approve_story = new ToolbarButton({
        label: 'Approve',
        onClick: () => this.approveStory(panel, context)
      });
      panel.toolbar.insertItem(position++, 'approve_story', approve_story);
    }

    // Metrices button
    if (true) {
      let get_metrics = new ToolbarButton({
        label: 'Get Metrics',
        onClick: () => this.getMetrics()
      });
      panel.toolbar.insertItem(position++, 'get_metrics', get_metrics);
    }
    // return [story_creation, to_csv, add_details, approve_story];
  }

  async getMetrics() {
    try {
      const response = await fetch('http://localhost:3000/getCounts');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const { totalRecordsCount, approvedRecordsCount, nonNullDescriptionCount } = data;
  
      alert(`
        Total Records: ${totalRecordsCount}
        Approved Records: ${approvedRecordsCount}
        Records with Description: ${nonNullDescriptionCount}
      `);
  
    } catch (error) {
      console.error('Error fetching metrics:', error);
      alert('Error fetching metrics. Please try again later.');
    }
  }

  async saveToCSV(context) {
    // Get the active cell
    const notebookWidget = this.app.shell.currentWidget;
    const activeCell = notebookWidget.content.activeCell;
    console.log(activeCell);


    // Check for write access
    const notebookPath = notebookWidget.context.path;

    try {
        const response = await fetch(`/api/contents/${notebookPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Write access checked');
        const notebookContent = await response.json();
        console.log(notebookContent);
        if (!notebookContent.writable) {
            console.log('User does not have write access to the notebook. Operation aborted.');
            return;
        }
    } catch (error) {
        console.error('Error checking write access:', error);
        return;
    }


    // Save the cell content to a CSV file
    const cellContent = activeCell.model.sharedModel.getSource();
    console.log(cellContent);
    const cellData = getCellContentData(cellContent);
    // const blob = new Blob([cellContent], {type: 'text/csv;charset=utf-8'});
    // saveAs(blob, 'data.csv');
    console.log(cellData);
    const id = cellData['id'] ? (cellData['id'].trim() !== '' ? cellData['id'] : null) : null;
    const description = cellData['description'] ? (cellData['description'].trim() !== '' ? cellData['description'] : null) : null;
    const acceptance_criteria = cellData['acceptance_criteria'] ? (cellData['acceptance_criteria'].trim() !== '' ? cellData['acceptance_criteria'] : null) : null;
    const workflow = cellData['workflow'] ? (cellData['workflow'].trim() !== '' ? cellData['workflow'] : null) : null;
    const exception_workflow = cellData['exception_workflow'] ? (cellData['exception_workflow'].trim() !== '' ? cellData['exception_workflow'] : null) : null;
    const something_else = cellData['something_else'] ? (cellData['something_else'].trim() !== '' ? cellData['something_else'] : null) : null;
    const status = cellData['status'] ? (cellData['status'].trim() !== '' ? cellData['status'] : null) : null;
    
    // Save the cell content to the backend server
    const url = 'http://localhost:3000/saveCellContent';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, description, acceptance_criteria, workflow, exception_workflow, something_else, status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Error saving cell content:', error);

    } finally { 
      console.log('Cell content saved');
    }

    await context.save();
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

    // Adding a widget
    const node = document.createElement('div');
    node.textContent = 'Wisentel';
    const widget = new Widget({node});
    widget.id = DOMUtils.createDomID();
    widget.addClass(TOP_AREA_CSS_CLASS);
    app.shell.add(widget, 'top', {rank: 1000});
  }
};

module.exports = yourPlugin;


