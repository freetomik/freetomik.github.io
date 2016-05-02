editor.edit = {
  // changes selected notes pitch
  notePitch: function(interval){
    // get and parse id of selected note (id='m13n10')
    var mnId = editor.mySelect.note.id;
    var measureIndex = mnId.split('n')[0].split('m')[1];
    var noteIndex = mnId.split('n')[1];
    var vfStaveNote = vfStaveNotes[measureIndex][noteIndex];
    // if note is rest, do nothing
    if(vfStaveNote.isRest())
      return;
    // get notes duration
    var duration = vfStaveNote.getDuration();
    // get notes pitch; currently no chord support
    var key = vfStaveNote.getKeys()[0];   // e.g. 'g##/4'
    // transpose note
    var newKey = editor.NoteTool.transposeNote(key, interval);
    // create new Vex.Flow.StaveNote
    var vfNote = new Vex.Flow.StaveNote({
      keys: [ newKey ],
      duration: duration
    });
    // set id for note DOM element in svg
    vfNote.setId(mnId);
    // set dots for a rest, however, currently supports only one dot(see parse.js line 140)
    if(vfStaveNote.isDotted()) {
      var dots = vfStaveNote.getDots().length;
      for(var i = 0; i < dots; i++)
        vfNote.addDotToAll();
    }
    // replace old note with a transposed one
    vfStaveNotes[measureIndex].splice(noteIndex, 1, vfNote);
    // change pitch property in json
    scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
      .step = newKey[0].toUpperCase();
    scoreJson["score-partwise"].part[0].measure[measureIndex].note[noteIndex].pitch
      .octave = newKey[newKey.length - 1];
  },

  noteDuration: function() {}
}