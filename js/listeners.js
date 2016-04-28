$("#control-panel")[0].addEventListener('click', editor.draw.staves);
$("#editor-tabs")[0].addEventListener('click', editor.draw.staves);

// editor.canvas.addEventListener('click', editor.select.measure);
// editor.canvas.addEventListener('click', editor.select.note);
// editor.canvas.addEventListener('click', editor.add.note);
// editor.canvas.addEventListener('mousemove', redraw);

function redraw(event) {
  //redraw on mousemove only in note mode when adding new note
  // if(editor.mode === 'note' && editor.getRadioValue('tools') == 'add') {
    // get mouse position
    editor.mousePos = editor.select.getMousePos(editor.canvas, event);
    // save previous cursor note for latter comparison
    editor.lastCursorNote = editor.selected.insertNote;
    // get new note below mouse cursor
    editor.selected.insertNote = editor.getInsertNote();
    // redraw only when cursor note changed pitch
    // (mouse changed y position between staff lines/spaces)
    if(editor.lastCursorNote !== editor.selected.insertNote)
      editor.draw.staves();
  // }
}

jQuery.fn.highlightNote = function () {
  Vex.forEach(this.find("*"), function(child) {
    child.setAttribute("fill", "red");
    child.setAttribute("stroke", "red");
  });
  return this;
}

jQuery.fn.unHighlightNote = function () {
  Vex.forEach(this.find("*"), function(child) {
    child.setAttribute("fill", "black");
    child.setAttribute("stroke", "black");
  });
  return this;
}

editor.parse.all();
editor.draw.staves();