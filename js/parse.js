/*
performs transformation from scoreJson to vfStaves[] and vfStaveNotes[]
prepares vfStaves[] and vfStaveNotes[] for editor.draw.score() function
*/
editor.parse = {
  all: function() {
    console.log('parse');
    // clear global arrays
    vfStaves = [];
    vfStaveNotes = [];
    xmlAttributes = [];

    var vfStave;
    // loop over all <measures>(MusicXML measures) and make Vex.Flow.Staves from them
    for(var i = 0; i < scoreJson["score-partwise"].part[0].measure.length; i++) {
      vfStave = editor.parse.measure(scoreJson["score-partwise"].part[0].measure[i], i);

      vfStave = editor.parse.attributes(vfStave, i);

      // push measure to global array, draw() will read from it
      vfStaves.push(vfStave);
    }
  },

  measure: function(measure, index) {
    // one Vex.Flow.Stave corresponds to one <measure>
    var vfStave = new Vex.Flow.Stave(0, 0, editor.staveWidth);

    // push attributes for measure to global array of attributes for measures
    if(measure['attributes'])
      xmlAttributes.push(measure['attributes']);
    else
      xmlAttributes.push({});

    var vfStaveNote, vfStaveNotesPerMeasure = [];
    if(measure.note) {
      // loop over all notes in measure
      for(var i = 0; i < measure.note.length; i++) {
        vfStaveNote = editor.parse.note(measure.note[i], index, i);
        vfStaveNotesPerMeasure.push(vfStaveNote);
      }
      vfStaveNotes.push(vfStaveNotesPerMeasure);
      // width of measure directly proportional to number of notes
      vfStave.setWidth(vfStaveNotesPerMeasure.length * editor.noteWidth);
    }
    else    // measure doesn't have notes
      vfStaveNotes.push([]);

    if(measure['@width']) {
      // in MusicXML measure width unit is one tenth of interline space
      vfStave.setWidth(measure['@width'] * (vfStave.getSpacingBetweenLines() / 10));
    }

    return vfStave;
  },

  attributes: function(vfStave, measureIndex) {
    // setting attributes for measure
    if(! $.isEmptyObject(xmlAttributes[measureIndex])) {
      attributes = xmlAttributes[measureIndex];

      if(attributes.clef) {
        if($.isArray(attributes.clef)) {
          console.warn("Multiple clefs for measure currently not supported.");
          var clef = attributes.clef[0];
        }
        else
          var clef = attributes.clef;

        var xmlClefType = clef.sign + '/' + clef.line;
        var vfClefType = editor.table.CLEF_TYPE_DICT[xmlClefType];
        vfStave.setClef(vfClefType);  
        vfStave.setWidth(vfStave.getWidth() + 80);
        editor.currentClef = vfClefType;
      }

      if(attributes.key) {
        if(attributes.key.hasOwnProperty('fifths')) {
          var fifths = +attributes.key.fifths;
          if(fifths == 0)
            keySpec = 'C';
          else if(fifths > 0)
            keySpec = editor.table.SHARP_MAJOR_KEY_SIGNATURES[fifths - 1];
          else
            keySpec = editor.table.FLAT_MAJOR_KEY_SIGNATURES[-fifths - 1];
          // var keySig = new Vex.Flow.KeySignature(keySpec);
          // keySig.addToStave(vfStave);
          vfStave.setKeySignature(keySpec);
          vfStave.setWidth(vfStave.getWidth() + (Math.abs(fifths) * 30));
          editor.currentKeySig = keySpec;
        }
      }

      if(attributes.time) {
        if($.isArray(attributes.time)) {
          console.warn("Multiple pairs of beats and beat-type elements in time signature not supported.");
          var time = attributes.time[0];
        }
        else
          var time = attributes.time;

        vfStave.setTimeSignature(time.beats + '/' + time['beat-type']);
        vfStave.setWidth(vfStave.getWidth() + 100);
      }
    }
    return vfStave;
  },

  note: function(note, measureIndex, noteIndex) {
    var rest = '', step = '', oct = '', dot = '', vfAcc = '';
    // get MusicXML divisions from attributes for current measure
    var divisions = 1;
    for(var i = 0; i <= measureIndex; i++) {
      if(xmlAttributes[i].divisions !== undefined)
        divisions = xmlAttributes[i].divisions;
    }

    // get note length from divisions and duration
    var staveNoteDuration =
      editor.NoteTool.getStaveNoteTypeFromDuration(note.duration, divisions);
      // to get also dots, add third argument to function - true
      // but currently dots calculating algorithm doesn't work correctly
      // and dot is taken from <dot/> element

    // console.log(step+'/'+oct+', '+'divisions:'+divisions
    //   +', '+'duration:'+note.duration+' -> '+staveNoteDuration);

    // rest is empty element in MusicXML, to json it is converted as {rest: null}
    if(note.hasOwnProperty('rest')) {
      rest = 'r';
      // key = editor.table.DEFAULT_REST_PITCH;
      step = 'b';
      oct = '4';
      // whole measure rest
      if(note.rest && note.rest['@measure'] === 'yes')
        staveNoteDuration = 'w';
    }
    else if(note.pitch) {
      // key = note.pitch.step.toLowerCase() + '/' + note.pitch.octave;
      step = note.pitch.step.toLowerCase();
      oct = note.pitch.octave;
      // since this project is yet not interested in how note sounds,
      // alter element is not needed; accidental is read from accidental element
    }

    if(note.accidental) {
      // accidental element can have attributes
      var mXmlAcc = (typeof note.accidental === 'string')
                      ? note.accidental
                      : note.accidental['#text'];
      vfAcc = editor.table.ACCIDENTAL_DICT[mXmlAcc];
    }

    var vfStaveNote = new Vex.Flow.StaveNote({
      keys: [step+vfAcc+'/'+oct],
      duration: staveNoteDuration+rest
    });

    // console.log(vfStaveNote.getKeys().toString()+' '+staveNoteDuration);

    // set id for note DOM element in svg
    vfStaveNote.setId('m' + measureIndex + 'n' + noteIndex);

    // set accidental
    if(vfAcc !== '')
      vfStaveNote.addAccidental(0, new Vex.Flow.Accidental(vfAcc));

    // // set dots with dots calculated from duration and divisions
    // var dotsArray = staveNoteDuration.match(/d/g);
    // // how many dots, format of vf duration: 'hdd' - half note with 2 dots
    // if(dotsArray) {
    //   dots = dotsArray.length;
    //   for(var i = 0; i < dots; i++) {
    //     vfStaveNote.addDotToAll();
    //   }
    // }

    // currently support for only one dot
    // to support more dots, xml2json.js needs to be changed -
    // (or use this improved one: https://github.com/henrikingo/xml2json)
    // - currently it is eating up more dots:
    // e.g. from <dot/><dot/><dot/> it makes only one {dot: null}
    if(note.hasOwnProperty('dot')) {
      vfStaveNote.addDotToAll();
      // console.log('dot');
    }

    return vfStaveNote;
  }
}