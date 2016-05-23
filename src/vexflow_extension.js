/*
Vex.Flow.Stave extensions
author:
  Tomas Hudziec, 2016
inspiration from:
  https://github.com/andrebakker/VexUI/blob/master/src/VexFlowExtension.js
  by Andre Bakker, MIT license
*/

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

Vex.Flow.Stave.prototype.removeTimeSignature = function(){
  var timeSignatures = this.getModifiers(Vex.Flow.StaveModifier.Position.BEGIN,
                                        Vex.Flow.TimeSignature.category);
  if(timeSignatures.length === 0)
    return;
  this.modifiers.splice(this.getModifierIndex(Vex.Flow.TimeSignature), 1);
}

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
    this.addDotToAll();
  }
}

// removes one dot from StaveNote
Vex.Flow.StaveNote.prototype.removeDot = function(){
  if(this.isDotted()) {
    this.dots = 0;
    this.modifiers.splice(this.getModifierIndex(Vex.Flow.Dot), 1);
  }
}