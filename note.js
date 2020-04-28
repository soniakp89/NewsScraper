var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  // `title`
  title: String,
  body: String
});

var Note = mongoose.model("Note", NoteSchema);

// Export  Note model
module.exports = Note;