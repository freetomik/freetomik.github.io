/*
module for note/measure addition...
*/
editor.add = {
  // inserts new measure filled with whole rest AFTER selected measure
  measure: function(){
    // get and parse id of selected measure (id='m13')
    var measureIndex = +editor.mySelect.measure.id.split('m')[1];

    // create new Vex.Flow.Stave, positions will be set in draw function
    var vfNewStave = new Vex.Flow.Stave(0, 0, editor.staveWidth);
    // add measure to global array of Vex.Flow Staves
    // splice adds before, but we need to insert after - reason for measureIndex + 1
    // splice also takes higher index than biggest as biggest
    vfStaves.splice(measureIndex + 1, 0, vfNewStave);
    // add empty attributes for measure
    xmlAttributes.splice(measureIndex + 1, 0, {});
    // fill measure with whole rest
    var wholeRest = new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "wr" });
    vfStaveNotes.splice(measureIndex + 1, 0, [wholeRest]);

    // add new measure to scoreJson
    var newMeasure = {
      '@number': measureIndex + 2,
      note: [
        {
          '@measure' : 'yes',
          rest: null,
          duration: 16  // TODO get duration from divisions in current attributes
        }
      ]
    };
    // insert new measure to json
    scoreJson["score-partwise"].part[0].measure.splice(measureIndex + 1, 0, newMeasure);
    
    // shift numbering for all following measures in part
    for(var m = measureIndex + 1; m < scoreJson["score-partwise"].part[0].measure.length; m++) {
      scoreJson["score-partwise"].part[0].measure[m]["@number"] = m + 1;
    }
  },
  note: function(){
          
    // var thisNoteOrRest = editor.getRadioValue('note-or-rest');  //"" or "r"
    // var thisNoteValue = editor.getRadioValue('note-value');     //w ,h ,q ,8 ,16
    // // var thisNoteOrChord = editor.getRadioValue('note-or-chord');
    // // var toolValue = editor.getRadioValue('tools');

    // // find the mouse position and insert the correct note
    // // if(editor.selected.measure.doubleClick === true && toolValue == 'add'){
    // // if(toolValue == 'add'){

    //   var insertNote = editor.getInsertNote();

    //   var selectedNoteVoice = 'v1';
    //   var selectedMeasure = editor.selected.measure.selection - 1;

    //   var checkboxValue = $('#dotted-checkbox').is(":checked");

    //   if(editor.measures[selectedMeasure].hasOwnProperty(selectedNoteVoice)){
    //     editor.measures[selectedMeasure][selectedNoteVoice].push(
    //       { 
    //         keys: [insertNote], 
    //         duration: thisNoteValue + thisNoteOrRest,
    //         dotted: checkboxValue,
    //       }
    //     );
    //   }else{
    //     editor.measures[selectedMeasure][selectedNoteVoice] = [];
    //     editor.measures[selectedMeasure][selectedNoteVoice].push(
    //       { 
    //         keys: [insertNote], 
    //         duration: thisNoteValue + thisNoteOrRest,
    //         dotted: checkboxValue,
    //       }
    //     );
    //   }
    // // }
  },
  clef: function(){
    // var dropdownValue = editor.clefDropdown.value;
    // editor.measures[editor.selected.measure.selection - 1].clef = dropdownValue;
  },
  keySignature: function(){ 
    // editor.measures[editor.selected.measure.selection - 1].keySig = editor.keySignature.value;
  },
  timeSignature: function(){
    // var top = $('#timeSigTop').val();
    // var bottom = $('#timeSigBottom').val();
    // var selectedMeasure = editor.selected.measure.selection - 1;

    // editor.measures[selectedMeasure].timeSigTop = top;
    // editor.measures[selectedMeasure].timeSigBottom = bottom;
    // editor.measures[selectedMeasure].showTimeSig = true;
  },
  accidental: function(){
    var accidental = editor.getRadioValue('note-accidental');

    var mnId = editor.mySelect.note.id;
    var measureIndex = mnId.split('n')[0].split('m')[1];
    var noteIndex = mnId.split('n')[1];
    var vfStaveNote = vfStaveNotes[measureIndex][noteIndex];

    if(!vfStaveNote.isRest()) {
      vfStaveNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
      // no support for chords currently

      // TODO add accidental to json also
      // ...
    }
  }, 
  dot: function(){
    // var selectedMeasure = editor.selected.measure.selection - 1;
    // var selectedNoteVoice = 'v1';
    // var checkboxValue = $('#dotted-checkbox').is(":checked");
    // // var isSelectedNoteDotted = editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

    // editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted = checkboxValue;
  }
}
