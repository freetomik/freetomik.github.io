editor.select = {
  getMousePos: function(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  },
  measure: function(){},
  note: function(evt){
  //   var noteSelected = false;
  //   var toolValue = editor.getRadioValue('tools');

  //   if(toolValue == 'select' ){
  //     var noteVoice = 'v1';
    
  //     if(editor.measures[editor.selected.measure.selection - 1].hasOwnProperty(noteVoice)){
  //       // loop through notes
  //       for(n=0; n<editor.measures[editor.selected.measure.selection - 1][noteVoice].length; n++){
  //         if(editor.mousePos.x >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x
  //         && editor.mousePos.x <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x + 10 
  //         && editor.mousePos.y >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y - 5
  //         && editor.mousePos.y + 5 <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y + 10
  //         ){
  //           editor.selected.note.selection = n;
  //           editor.selected.note.x = editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x - 10;
  //           editor.selected.note.y = editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y - 15;
  //           editor.selected.note.width = 30;
  //           editor.selected.note.height = 30;
  //           var selectedNote = true;

  //           // Set the value of the dotted checkbox accordingly
  //           var selectedMeasure = editor.selected.measure.selection - 1;
  //           var checkboxValue = $('#dotted-checkbox').is(":checked");
  //           var isSelectedNoteDotted = editor.measures[selectedMeasure][noteVoice][editor.selected.note.selection].dotted;

  //           if(isSelectedNoteDotted == true){
  //             $('#dotted-checkbox').prop('checked', true);
  //           }else{
  //             $('#dotted-checkbox').prop('checked', false);
  //           }

  //           break;
  //         }else{
  //           var selectedNote = false;
  //           editor.selected.note.selection = null;
  //         }
  //       }
  //     }
  //     if(selectedNote == true){
  //       editor.selected.note.voice = 'v1';
  //       // break;
  //     }
  //   }
  }
}
