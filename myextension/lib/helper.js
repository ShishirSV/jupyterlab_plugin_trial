const story_comments = require('./config').story_comments;
const story_details = require('./config').story_details;

function checkCellIsStory(cell_content) {
    if (cell_content.length < story_comments.length) {
        return false;
    }

    for (let i = 0; i < 3; i++) {
        const required_comment = story_comments[i];
        const cell_comment = cell_content[i];

        if (!cell_comment.startsWith(required_comment)) {
            return false;
        }
    }

    return true;
}

function checkPreApproval(cell_content) {
    if (cell_content.length < story_comments.length + story_details.length) {
        return false;
    }
    const required_comments = story_comments.concat(story_details);

    for (let i = 0; i < 6; i++) {
        const required_comment = required_comments[i];
        const cell_comment = cell_content[i];

        if (!cell_comment.startsWith(required_comment)) {
            return false;
        }
    }

    return true;
}

function getCellContentData(cell_content) {
    const cell_array = cell_content.split('\n');    
    const cell_data = {
        'id': null,
        'description': null,
        'acceptance_criteria': null,
        'workflow': null,
        'exception_workflow': null,
        'something_else': null,
        'status': null
    };
    // Iterate over the cell content to extract the data
    for(let i = 0; i < cell_array.length - 1; i++) {
        const cell_line = cell_array[i];
        const cell_line_data = cell_line.split(':');
        const cell_line_key = cell_line_data[0].trim().replace(/^#\s*/, '');
        const cell_line_value = cell_line_data[1].trim();
        cell_data[cell_line_key] = cell_line_value;
    }

    // Check if the cell is approved
    if (cell_array[cell_array.length - 1] === '# Approved') {
        cell_data['status'] = 'Approved';
    }

    return cell_data;
}

module.exports = {
    checkCellIsStory,
    checkPreApproval,
    getCellContentData
};