function switchToNoteMode() {
  if(editor.mode !== 'note') {
    editor.mode = 'note';
    editor.svgElem.addEventListener('mousemove', redrawMeasureWithCursorNote, false);
    editor.draw.score();
  }
}

function switchToMeasureMode() {
  if(editor.mode !== 'measure') {
    editor.mode = 'measure';
    editor.svgElem.removeEventListener('mousemove', redrawMeasureWithCursorNote, false);
    editor.draw.score();
  }
}

// draws note, which is to be added, below mouse cursor when it is
// moving in column of selected note(only rest currenly)
function redrawMeasureWithCursorNote(event) {
  // get mouse position
  editor.mousePos.current = getMousePos(editor.svgElem, event);

  // get selected measure and note
  var vfStaveNote = getSelectedNote();
  var vfStave = getSelectedMeasure();

  // currently support only for replacing rest with a new note
  // building chords feature will be added soon
  if(!vfStaveNote.isRest()) return;

  // get column of selected note on stave
  var bb = vfStave.getBoundingBox();
  var begin = vfStaveNote.getNoteHeadBeginX() - 5;
  bb.setX(begin);
  bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
  // bb.setW(20);
  // bb.draw(editor.ctx);

  // mouse cursor is within note column
  if(isCursorInBoundingBox(bb, editor.mousePos.current) ) {
    // save mouse position
    editor.mousePos.previous = editor.mousePos.current;
    // get new note below mouse cursor
    editor.selected.cursorNoteKey = getCursorNoteKey();

    editor.svgElem.addEventListener('click', editor.add.note, false); 

    // redraw only when cursor note changed pitch
    // (mouse changed y position between staff lines/spaces)
    if(editor.lastCursorNote !== editor.selected.cursorNoteKey) {
      // console.log(editor.selected.cursorNoteKey);
      editor.draw.selectedMeasure(true);

    }
    // save previous cursor note for latter comparison
    editor.lastCursorNote = editor.selected.cursorNoteKey;
  }
  // mouse cursor is NOT within note column
  else {

    editor.svgElem.removeEventListener('click', editor.add.note, false); 

    // mouse cursor just left note column(previous position was inside n.c.)
    if(isCursorInBoundingBox(bb, editor.mousePos.previous) ) {
      // redraw measure to erase cursor note
      editor.draw.selectedMeasure(false);
      editor.mousePos.previous = editor.mousePos.current;
      editor.lastCursorNote = '';
    }
  }

}

function getMousePos(canvas, evt) {
var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getRadioValue(name) {
  var radios = document.getElementsByName(name);
  for(var i = 0; i < radios.length; i++)
    if(radios[i].checked)
      return radios[i].value;
}

/*
TODO: documentary comment...
*/
// TODO rewrite with use of vfStave.getLineForY(editor.mousePos.current.y)
function getCursorNoteKey() {
  // find the mouse position and return the correct note for that position.
  var y = gl_VfStaves[editor.selected.measure.id.split('m')[1]].y;
  // var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  for(var i = 5; i >= 0; i--){
    for(var l = 0; l < notesArray.length; l++){
      var noteOffset = (count * 35) - (l * 5 - 17);
      if(editor.mousePos.current.y >= y + noteOffset && editor.mousePos.current.y <= 5 + y + noteOffset){
        var cursorNoteKey = notesArray[l] + (i+1);
        var found = true;
        break;
      }
      if(found == true){
        break;
      }
    }
    count++;
  }
  return cursorNoteKey;
}

function getSelectedNoteIndex() {
  var mnId = editor.selected.note.id;
  return +mnId.split('n')[1];
}

function getSelectedMeasureIndex() {
  var mnId = editor.selected.note.id;
  return +mnId.split('n')[0].split('m')[1];
}

function getSelectedNote() {
  var mnId = editor.selected.note.id;
  var measureIndex = mnId.split('n')[0].split('m')[1];
  var noteIndex = mnId.split('n')[1];
  return gl_VfStaveNotes[measureIndex][noteIndex];
}

function getSelectedMeasure() {
  var mnId = editor.selected.note.id;
  var measureIndex = mnId.split('n')[0].split('m')[1];
  return gl_VfStaves[measureIndex];
}

// get current attribute for measure
function getCurAttrForMeasure(measureIndex, attrname) {
  for(var i = measureIndex; i >= 0; i--)
    if(gl_StaveAttributes[i][attrname])
      return gl_StaveAttributes[i][attrname];
}

// highlights properties of selected note on control panel
function highlightSelectedNoteProperties() {
  var vfStaveNote = getSelectedNote();
  if(vfStaveNote.getAccidentals())
    var accOfSelNote = vfStaveNote.getAccidentals()[0].type;
  // uncheck already checked radio button
  $("input:radio[name='note-accidental']:checked").prop("checked", false);
  // set radio button for accidental of selected note
  if(accOfSelNote)
    $("input:radio[name='note-accidental'][value='"+accOfSelNote+"']").prop("checked", true);
  // set radio button for duration of selected note
  var durOfSelNote = vfStaveNote.getDuration();
  $("input:radio[name='note-value'][value='"+durOfSelNote+"']").prop("checked", true);
  // set dotted checkbox
  $("#dotted-checkbox").prop("checked", vfStaveNote.isDotted());
}

// highlights properties of selected measure on control panel
function highlightSelectedMeasureProperties() {
  var measureIndex = getSelectedMeasureIndex();
  var clef = gl_StaveAttributes[measureIndex].vfClef;
  if(!clef) clef = getCurAttrForMeasure(measureIndex, 'vfClef');
  if(clef) clefDropdown.selectOption(clef);
  var keySig = gl_StaveAttributes[measureIndex].vfKeySpec;
  if(!keySig) keySig = getCurAttrForMeasure(measureIndex, 'vfKeySpec');
  if(keySig) keySigDropdown.selectOption(keySig);
  var timeSig = gl_StaveAttributes[measureIndex].vfTimeSpec;
  if(!timeSig) timeSig = getCurAttrForMeasure(measureIndex, 'vfTimeSpec');
  if(timeSig) {
    timeSigTop.selectOption(timeSig.split('/')[0]);
    timeSigBottom.selectOption(timeSig.split('/')[1]);
  }
}

function isCursorInBoundingBox(bBox, cursorPos) {
  return cursorPos.x > bBox.getX() && cursorPos.x < bBox.getX() + bBox.getW() &&
         cursorPos.y > bBox.getY() && cursorPos.y < bBox.getY() + bBox.getH();
}

/**
 * @param obj1 The first object
 * @param obj2 The second object
 * @returns A new object representing the merged objects. If both objects passed as param have the same prop, then obj2 property is returned.
 */
// author Andre Bakker, VexUI: https://github.com/andrebakker/VexUI
function mergeProperties(obj1, obj2){
  var merged = {};
    for (var attrname in obj1) { merged[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { merged[attrname] = obj2[attrname]; }
    return merged;
}

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
function mergePropertiesInPlace(source, destination) {
  for (var property in source)
    destination[property] = source[property];
}