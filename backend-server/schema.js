// Schema for the stories collection in the database
const story_schema = {
    bsonType: "object",
    title: "stories",
    required: ["id"],
    properties: {
      id: { bsonType: "string", minLength: 1 },
      description: { bsonType: ["string", "null"] },
      acceptance_criteria: { bsonType: ["string", "null"] },
      workflow: { bsonType: ["string", "null"] },
      exception_workflow: { bsonType: ["string", "null"] },
      something_else: { bsonType: ["string", "null"] },
      status: { bsonType: ["string", "null"]}
    }
};

module.exports = {
    story_schema
};