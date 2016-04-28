editor.draw = {
  staves: function(){
    console.log('draw');

    var noteValue = editor.getRadioValue('note-value');
    // var selectOrAdd = editor.getRadioValue('tools');

    // editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
    editor.ctx.clear();
    canvasWidth = document.getElementById('canvas-wrapper').clientWidth;
    $('#notation-canvas').attr('width', canvasWidth);

    // collect number count for each measure
    // var notesPerMeasureLengths = [];
    // for(var i in vfStaves) {
    //   var measure = vfStaves[i];
    //   if(measure.note)
    //     notesPerMeasureLengths.push(measure.note.length);
    //   else
    //     notesPerMeasureLengths.push(1);
    // }

    // find maximum number of notes in measure
    // notesPerMeasureLengths.sort(function(a,b){return b-a;});
    // var maxLength = notesPerMeasureLengths[0];
    // var noteWidth = 40;
    // calculate minimal width for measure, depends on how many notes measure has
    // var minWidth = noteWidth * maxLength;
    var minWidth = editor.noteWidth * 4;

    var attributes = {};
    // var count = 0;
    var staveX = 10, staveY = 0;

    // loop over all measures
    for(var m in vfStaves) {
      var stave = vfStaves[m];

      // find line break points
      // for(var br=6; br>=0; br--){
      //   if(canvasWidth / br >= minWidth){
      //     var staveWidth = canvasWidth / br - 10;
      //     break;
      //   }
      // }

      staveWidth = stave.getWidth();

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
        stave.setWidth(stave.getWidth() /*+ 80 + numOfAcc * 20*/);

      }

      // draw stave
      stave.draw();

      // create svg <rect> element exactly overlapping stave for stave selection and highlight
      editor.ctx.rect(staveX,
                      staveY,
                      staveWidth,
                      editor.staveHeight,
                      {
                        'class': 'measureRect',
                        'id': 'm'+m,
                        'fill': 'transparent'
                      }
                    );

      // set start x position for next measure
      staveX = staveX + staveWidth;

      // mouse events listeners on <rect> for selecting measures
      if(editor.mode === 'measure') {
        $('svg .measureRect').each(function () {
          // to avoid multiple handler attach
          if($(this).data('handlers-added'))
            return true;

          $(this).data('handlers-added', true);

          $(this).on('click', function() {
            $(this).css({'fill': 'blue', 'opacity': '0.4'});
            console.log($(this).attr('id'));
            // if it is not second click on already selected measure
            if(editor.mySelect.measure.id !== $(this).attr('id')) {
              editor.mySelect.measure.previousId = editor.mySelect.measure.id;
              editor.mySelect.measure.id = $(this).attr('id');
              editor.selected.measure.selection = +editor.mySelect.measure.id[1] + 1;
              var prevId = editor.mySelect.measure.previousId;
              $('svg .measureRect#'+prevId).css({'fill': 'transparent'});
              $('svg .measureRect#'+editor.mySelect.measure.id)
                .css({'fill': 'blue', 'opacity': '0.4'});
            }
          });
          // TODO: doesn't highlight only measure after start, fix it
          $(this).on('mouseenter', function() {
            if(editor.mySelect.measure.id !== $(this).attr('id'))
              $(this).css({'fill': 'blue', 'opacity': '0.1'}); 
            // console.log('mouseenter on measure['+$(this).attr('id')+']');
          });
          $(this).on('mouseleave', function() {
            if(editor.mySelect.measure.id !== $(this).attr('id'))
              $(this).css({'fill': 'transparent'}); 
              // console.log('mouseleave from measure['+$(this).attr('id')+']');
          });
        });
        // highlight selected measure
        $('svg .measureRect#'+editor.mySelect.measure.id)
          .css({'fill': 'blue', 'opacity': '0.4'});
      }

      // find time signature in Attributes for current Measure
      var beats = 4, beat_type = 4;
      for(var a = 0; a <= m; a++) {
        // finds attributes of closest previous measure or current measure
        if(! $.isEmptyObject(xmlAttributes[a]) && attributes.time) {
          beats = xmlAttributes[a].time.beat;
          beat_type = xmlAttributes[a].time['beat-type'];
        }
      }

      var voice = new Vex.Flow.Voice({
          num_beats: beats,
          beat_value: beat_type,
          resolution: Vex.Flow.RESOLUTION
        });

      voice.setStrict(false);    //TODO: let it be strict for check notes duration in measure

      // draw the cursor note
      // if(i == editor.selected.measure.selection - 1 && selectOrAdd == 'add'){
      //     vfStaveNotes[m].notes.push(new Vex.Flow.StaveNote(
      //     {
      //       keys: [editor.selected.insertNote],
      //       duration: noteValue,
      //     }
      //   )); 
      // }

      voice.addTickables(vfStaveNotes[m]);


      // This is only helper function to justify and draw a 4/4 voice
      // Vex.Flow.Formatter.FormatAndDraw(editor.ctx, stave, vfStaveNotes[m]);

      // format and justify the notes to 80% of staveWidth
      new Vex.Flow.Formatter().joinVoices([voice]).format([voice], staveWidth * 0.8);
                                         // also exists method formatToStave()...

      // render voice
      voice.draw(editor.ctx, stave);

      //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
      // TODO: generate fraction for beam groups dynamically according to time signature
      var beams = new Vex.Flow.Beam.generateBeams(vfStaveNotes[m], {
        groups: [new Vex.Flow.Fraction(3, 8)]
      });

      // if(editor.frameCount % 30 == 0){
      //   console.log(editor.notes); 
      // }
      
      beams.forEach(function(beam) {
        beam.setContext(editor.ctx).draw();
      });

      // adding event listeners to note objects
      for(n in vfStaveNotes[m]){

          // adding listeners for interactivity: (from vexflow stavenote_tests.js line 463)
          // item is svg group: <g id="vf-m1n3" class="vf-stavenote">
          var item = vfStaveNotes[m][n].getElem();

          item.addEventListener("mouseover", function() {
            // if editor is in mode for working with notes
            if(editor.mode === 'note') {
              // we don't want to change colour of already selected note
              if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
                // change colour for each note parts - stem, head, dot, accidenal...
                Vex.forEach($(this).find("*"), function(child) {
                  child.setAttribute("fill", "green");
                  child.setAttribute("stroke", "green");
                });
              }
            }
          }, false);

          item.addEventListener("mouseout", function() {
            if(editor.mode === 'note') {
              if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
                Vex.forEach($(this).find("*"), function(child) {
                  child.setAttribute("fill", "black");
                  child.setAttribute("stroke", "black");
                });
              }
            }
          }, false);

          item.addEventListener("click", function() {
            if(editor.mode === 'note') {
              // if it is not second click on already selected note
              if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
                Vex.forEach($(this).find("*"), function(child) {
                  child.setAttribute("fill", "red");
                  child.setAttribute("stroke", "red");
                });
                // save currently selected id to previous
                editor.mySelect.measure.previousId = editor.mySelect.measure.id;
                editor.mySelect.note.previousId = editor.mySelect.note.id;
                // format of id: id='vf-m13n10' - eleventh note in fourteenth measure(indexing from 0)
                var mnId = $(this).attr('id');
                // save id of newly selected note
                editor.mySelect.measure.id = mnId.split('n')[0].split('m')[1];  // '13'
                // editor.mySelect.note.id = mnId.slice(5);
                editor.mySelect.note.id = mnId.split('-')[1];   // 'm13n10'
                // for backward compatibility, will be removed soon
                editor.selected.note.selection = +editor.mySelect.note.id[3];
                // unhighlight previous selected note
                $('svg #vf-'+editor.mySelect.note.previousId).unHighlightNote();
                console.log(editor.mySelect.note);
              }
            }
          }, false);

        }
      }
      // highlight selected note
      if(editor.mode === 'note')
        $('svg #vf-'+editor.mySelect.note.id).highlightNote();

    // count++;
    // $('#notation-canvas > svg').attr({'viewBox': '0 0 800 1056'});

  }
}