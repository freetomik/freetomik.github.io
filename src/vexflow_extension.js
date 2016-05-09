// Vex.Flow.Stave extensions
// taken from VexUI project by Andre Bakker and modified 
// https://github.com/andrebakker/VexUI

Vex.Flow.Stave.prototype.getModifierIndex = function(constructor){
  if(this.modifiers)
    for(var i = 0; i < this.modifiers.length; i++)
      if(this.modifiers[i] instanceof constructor)
        return i;
  return -1;
}

Vex.Flow.Stave.prototype.removeClef = function(){
  var clefs = this.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN, Vex.Flow.Clef.category);
  if(clefs.length === 0)
    return;
  if(this.getModifierIndex(Vex.Flow.Clef) !== -1) {
    this.modifiers.splice(this.getModifierIndex(Vex.Flow.Clef), 1);
    // set default stave clef
    this.clef = "treble";
  }
}

Vex.Flow.Stave.prototype.removeKeySignature = function(){
  var keySignatures = this.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN,
                                        Vex.Flow.KeySignature.category);
  if(keySignatures.length === 0)
    return;
  this.modifiers.splice(this.getModifierIndex(Vex.Flow.KeySignature), 1);
}

// Vex.Flow.StaveNote extensions
// inspiration from VexUI
Vex.Flow.StaveNote.prototype.clone = function(newProps) {
  var currentProps = {
    keys: this.keys,
    stem_direction: this.getStemDirection(),
    duration: this.duration,
    noteType: this.noteType
  };
  
  var mergedProps = mergeProperties(currentProps, newProps);
  mergedProps.duration = mergedProps.duration + mergedProps.noteType;
  
  var newNote = new Vex.Flow.StaveNote(mergedProps);
  
  //Setting the style as the same style as the note head
  newNote.setStyle(this.note_heads[0].style);
   
  if(this.modifierContext!=null && this.getDots()!=null)
    newNote.addDotToAll();
  
  newNote.beam = this.beam;
  
  //Clone modifiers
  for(var i = 0; i < this.modifiers.length; i++)
    if(this.modifiers[0] instanceof Vex.Flow.Accidental)
      newNote.addAccidental(this.modifiers[i].index, new Vex.Flow.Accidental(this.modifiers[i].type));

  return newNote;
};

Vex.Flow.StaveNote.prototype.getModifierIndex = function(constructor){
  if(this.modifiers)
    for(var i = 0; i < this.modifiers.length; i++)
      if(this.modifiers[i] instanceof constructor)
        return i;
  return -1;
}

Vex.Flow.StaveNote.prototype.removeAccidental = function(){
  var accidentals = this.getAccidentals();
  if(accidentals && accidentals.length === 0)
    return;
  this.modifiers.splice(this.getModifierIndex(Vex.Flow.Accidental), 1);
}

Vex.Flow.StaveNote.prototype.setAccidental = function(i, accidental){
  var accidentals = this.getAccidentals();
  if(accidentals && accidentals.length !== 0)
    this.removeAccidental();

  this.addAccidental(i, accidental);
}

// sets one dot to StaveNote if it doesn't have any
Vex.Flow.StaveNote.prototype.setDot = function(){
  if(!this.isDotted()) {
    console.log('setDot');
    this.addDotToAll();
  }
}

// removes one dot from StaveNote
Vex.Flow.StaveNote.prototype.removeDot = function(){
  if(this.isDotted()) {
    console.log('removeDot');
    this.dots = 0;
    this.modifiers.splice(this.getModifierIndex(Vex.Flow.Dot), 1);
  }
}