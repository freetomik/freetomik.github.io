editor.delete = {
  measure: function(){
    if(editor.measures.length > 1) {   //protection from removing last remaining measure
      //TODO: editor.selected.measure can be null/undefined
      // splice the selected measure
      console.log('delete:'+editor.selected.measure.selection);
      editor.measures.splice(editor.selected.measure.selection - 1, 1);

      // reset the selected measure to the measure after the measure that was just deleted
      // editor.selected.measure.selection = editor.selected.measure.selection + 1;
      // reset all measure numbers
      for(i=0; i<editor.measures.length; i++){
        editor.measures[i].measure = i + 1;
      }
    }
  },
  // deletes note by replacing it with a rest of the same duration
  note: function(){
    // get and parse id of selected note (id='m13n10')
    var mnId = editor.mySelect.note.id;
    var measureId = mnId.split('n')[0].split('m')[1];
    var noteId = mnId.split('n')[1];
    var vfStaveNote = vfStaveNotes[measureId][noteId];
    // if note is already a rest, do nothing
    if(vfStaveNote.isRest())
      return;
    // get notes duration properties
    var duration = vfStaveNote.getDuration();
    // create new Vex.Flow.StaveNote for rest
    var vfRest = new Vex.Flow.StaveNote({
      keys: [ editor.table.DEFAULT_REST_PITCH ],
      duration: duration + 'r'
    });
    // set id for note DOM element in svg
    vfRest.setId(mnId);
    // set dots for a rest, however, currently supports only one dot(see parse.js line 140)
    if(vfStaveNote.isDotted()) {
      var dots = vfStaveNote.getDots().length;
      for(var i = 0; i < dots; i++)
        vfRest.addDotToAll();
    }
    // replace deleted note with a rest
    vfStaveNotes[measureId].splice(noteId, 1, vfRest);
    // delete pitch property from json
    delete scoreJson["score-partwise"].part[0].measure[measureId].note[noteId].pitch;
    // create empty rest property
    scoreJson["score-partwise"].part[0].measure[measureId].note[noteId]['rest'] = null;
    // I assume, that property order does not matter
    // also, currently I don't delete some non-rest elements, like stem, lyric, notations (e.g.slur)
  },
  clef: function(){
    editor.measures[editor.selected.measure.selection - 1].clef = null;
  },
  timeSignature: function(){
    editor.measures[editor.selected.measure.selection - 1].showTimeSig = false;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v1';
    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = null;
  }
}
