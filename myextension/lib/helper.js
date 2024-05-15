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

module.exports = {
    checkCellIsStory,
    checkPreApproval
};