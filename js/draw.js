editor.draw = {
  // clears svg and draws all measures (whole score) again
  score: function() {
    console.log('draw');

    var noteValue = editor.getRadioValue('note-value');

    editor.ctx.clear();
    canvasWidth = document.getElementById('canvas-wrapper').clientWidth;
    $('#notation-canvas').attr('width', canvasWidth);

    // var minWidth = noteWidth * maxLength;
    var minWidth = editor.noteWidth * 4;

    var attributes = {};
    // var count = 0;
    var staveX = 10, staveY = 0;

    // loop over all measures
    for(var m in vfStaves) {
      // string to integer
      m = +m;

      var stave = vfStaves[m];

      var staveWidth = stave.getWidth();

      // calculate newline
      var staveEnd = staveX + staveWidth;
      if(staveEnd > canvasWidth) {
        staveX = 10;
        staveY = staveY + editor.staveHeight;
        newLine = true;
      }
      else {
        newLine = false;
      }

      // set height of canvas
      if((staveY + editor.staveHeight) > $('#notation-canvas').attr('height'))
        $('#notation-canvas').attr('height', staveY + editor.staveHeight);

      // if one measure is wider than canvas(e.g. in Chant.xml), extend canvas
      if(staveWidth > $('#notation-canvas').attr('width'))
        $('#notation-canvas').attr('width', staveWidth);

      // set position and width of stave 
      stave.setX(staveX);
      stave.setY(staveY);
      // if measure doesn't have its own width(set as attribute in xml)
      // if(stave.getWidth() == editor.staveWidth)
      //   stave.setWidth(staveWidth);
      // else
        // staveWidth = stave.getWidth();

      // set rendering context for stave
      stave.setContext(editor.ctx);

      // clef and key signature must be rendered on every first measure on new line
      if(newLine == true) {
        stave.setClef(editor.currentClef);
        stave.setKeySignature(editor.currentKeySig);
        // number of accidentals in key signature
        var numOfAcc = editor.table.SHARP_MAJOR_KEY_SIGNATURES.indexOf(editor.currentKeySig) + 1;
        if(!numOfAcc)
          numOfAcc = editor.table.FLAT_MAJOR_KEY_SIGNATURES.indexOf(editor.currentKeySig) + 1;

        // not good solution, it would grow after each draw call
        // stave.setWidth(stave.getWidth() + 80 + numOfAcc * 20);

      }
      // TODO implement removeClef() and removeSignature() for Vex.Flow.Stave
      // // remove clef and key signature when not newline
      // else {
      //   // don't remove items for the very first stave
      //   if(m != 0) {
      //     stave.removeClef();
      //     stave.removeKeySignature();
      //   }
      // }


      editor.draw.measure(m);

      // set start x position for next measure
      staveX = staveX + staveWidth;

      // adding event listeners to note objects
      for(n in vfStaveNotes[m]){
          // adding listeners for interactivity: (from vexflow stavenote_tests.js line 463)
          // item is svg group: <g id="vf-m1n3" class="vf-stavenote">
          var item = vfStaveNotes[m][n].getElem();
          attachListenersToNote(item);
      }

    } // loop over measures

    // mouse events listeners on <rect> for selecting measures
    if(editor.mode === 'measure') {
      $('svg .measureRect').each(function() {
        attachListenersToMeasureRect($(this));
      });
      // highlight selected measure
      $('svg .measureRect#'+editor.mySelect.measure.id)
        .css({'fill': 'blue', 'opacity': '0.4'});
    }
    // highlight selected note
    else if(editor.mode === 'note')
      $('svg #vf-'+editor.mySelect.note.id).highlightNote();

    // count++;
    // $('#notation-canvas > svg').attr({'viewBox': '0 0 800 1056'});

  },




  // removes particular measure(stave) from svg and draws it again
  measure: function(index) {
    // $('#vf-mg'+index).empty();
    $('#vf-m'+index).remove();

    var stave = vfStaves[index];

    // svg measure group
    editor.ctx.openGroup("measure", "m"+index, {pointerBBox: true});
      // draw stave
      stave.draw();

      // create svg <rect> element exactly overlapping stave for stave selection and highlight
      editor.ctx.rect(stave.getX(),
                      stave.y,
                      stave.getWidth(),
                      editor.staveHeight,
                      {
                        'class': 'measureRect',
                        'id': 'm'+index,
                        'fill': 'transparent'
                      }
                    );

      // find time signature in Attributes for current Measure
      var beats = 4, beat_type = 4;
      for(var a = 0; a <= index; a++) {
        // finds attributes of closest previous measure or current measure
        if(! $.isEmptyObject(xmlAttributes[a]) && attributes.time) {
          beats = xmlAttributes[a].time.beats;
          beat_type = xmlAttributes[a].time['beat-type'];
        }
      }

      var voice = new Vex.Flow.Voice({
          num_beats: beats,
          beat_value: beat_type,
          resolution: Vex.Flow.RESOLUTION
        });

      voice.setStrict(false);    //TODO: let it be strict for check notes duration in measure

      // TODO
      // draw the cursor note
      // if(i == editor.selected.measure.selection - 1 && selectOrAdd == 'add'){
      //     vfStaveNotes[m].notes.push(new Vex.Flow.StaveNote(
      //     {
      //       keys: [editor.selected.insertNote],
      //       duration: noteValue,
      //     }
      //   )); 
      // }

      voice.addTickables(vfStaveNotes[index]);

      //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
      // TODO: generate fraction for beam groups dynamically according to time signature
      var beams = new Vex.Flow.Beam.generateBeams(vfStaveNotes[index], {
        groups: [new Vex.Flow.Fraction(3, 8)]
      });

      // format and justify the notes to 80% of staveWidth
      new Vex.Flow.Formatter().joinVoices([voice]).format([voice], stave.getWidth() * 0.8);
     // also exists method formatToStave()...

      // render voice
      voice.draw(editor.ctx, stave);

      beams.forEach(function(beam) {
        beam.setContext(editor.ctx).draw();
      });

      // if last note is behind width of stave, extend stave
      // var lastNoteX = vfStaveNotes[m][vfStaveNotes[m].length - 1].getNoteHeadEndX();
      // if((lastNoteX - stave.getX()) > staveWidth) {
      //   console.log('stave['+m+'] extended, lastNoteX: '+lastNoteX+'staveWidth: '+staveWidth);
      //   stave.setWidth(lastNoteX + 10);
      //   stave.draw();
      // }
      // TODO rather create function calculateStaveWidth(stave())

    // svg measure group
    editor.ctx.closeGroup();

  }

}