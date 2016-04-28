/*
module for note/measure addition...
*/
editor.add = {
  measure: function(){
    var staveLn = editor.measures.length;
    var selectedMeasure = editor.selected.measure.selection;

    //first added measure at initialization
    if(selectedMeasure == null && staveLn < 1) {
      editor.measures.push({
        timeSigTop: 4,
        timeSigBottom: 4,
        showTimeSig: true,
        clef: 'treble',
      });
    }
    //no measure selected, new will be added to the end
    else if(selectedMeasure == null && staveLn >= 1) {
      editor.measures.push({
        timeSigTop: null,
        timeSigBottom: null,
        showTimeSig: false,
        clef: null,
      });
    }
    //some measure selected, new will be added after selected one
    else {
      editor.measures.splice(selectedMeasure, 0, {
        timeSigTop: null,
        timeSigBottom: null,
        showTimeSig: false,
        clef: null,
      });
    }

    var numOfMeasures = scoreJson["score-partwise"].part[0].measure.length;
    var newMeasure = {
      '@number': numOfMeasures + 1,
    };
    // TODO: fill newly created measure with whole rest
    
    scoreJson["score-partwise"].part[0].measure.push(newMeasure);
  },
  note: function(){
          
    var thisNoteOrRest = editor.getRadioValue('note-or-rest');  //"" or "r"
    var thisNoteValue = editor.getRadioValue('note-value');     //w ,h ,q ,8 ,16
    // var thisNoteOrChord = editor.getRadioValue('note-or-chord');
    // var toolValue = editor.getRadioValue('tools');

    // find the mouse position and insert the correct note
    // if(editor.selected.measure.doubleClick === true && toolValue == 'add'){
    // if(toolValue == 'add'){

      var insertNote = editor.getInsertNote();

      var selectedNoteVoice = 'v1';
      var selectedMeasure = editor.selected.measure.selection - 1;

      var checkboxValue = $('#dotted-checkbox').is(":checked");

      if(editor.measures[selectedMeasure].hasOwnProperty(selectedNoteVoice)){
        editor.measures[selectedMeasure][selectedNoteVoice].push(
          { 
            keys: [insertNote], 
            duration: thisNoteValue + thisNoteOrRest,
            dotted: checkboxValue,
          }
        );
      }else{
        editor.measures[selectedMeasure][selectedNoteVoice] = [];
        editor.measures[selectedMeasure][selectedNoteVoice].push(
          { 
            keys: [insertNote], 
            duration: thisNoteValue + thisNoteOrRest,
            dotted: checkboxValue,
          }
        );
      }
    // }
  },
  clef: function(){
    var dropdownValue = editor.clefDropdown.value;
    editor.measures[editor.selected.measure.selection - 1].clef = dropdownValue;
  },
  keySignature: function(){ 
    editor.measures[editor.selected.measure.selection - 1].keySig = editor.keySignature.value;
  },
  timeSignature: function(){
    var top = $('#timeSigTop').val();
    var bottom = $('#timeSigBottom').val();
    var selectedMeasure = editor.selected.measure.selection - 1;

    editor.measures[selectedMeasure].timeSigTop = top;
    editor.measures[selectedMeasure].timeSigBottom = bottom;
    editor.measures[selectedMeasure].showTimeSig = true;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v1';
    var accidental = editor.getRadioValue('note-accidental');
    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = accidental;
  }, 
  dot: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v1';
    var checkboxValue = $('#dotted-checkbox').is(":checked");
    // var isSelectedNoteDotted = editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted = checkboxValue;
  }
}
