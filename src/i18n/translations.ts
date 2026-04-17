export type Language = 'en' | 'es';

export interface Translations {
  // ── Navigation / common ───────────────────────────────────────────────────
  back: string;
  cancel: string;
  save: string;
  delete: string;
  backToMenu: string;

  // ── Home ─────────────────────────────────────────────────────────────────
  whoLearning: string;
  addKid: string;
  tapToStart: string;

  // ── Module select ─────────────────────────────────────────────────────────
  whatToLearn: string;
  gameTime: string;
  quickQuizzes: string;
  colorHopTitle: string;
  colorHopSub: string;
  quiz: string; // appended: "Letters Quiz" / "Prueba de Letras"

  // ── Module names ──────────────────────────────────────────────────────────
  moduleTitles: {
    letters: string;
    numbers: string;
    colors: string;
    shapes: string;
  };

  // ── Module emoji titles (with emoji prefix) ───────────────────────────────
  moduleTitlesEmoji: {
    letters: string;
    numbers: string;
    colors: string;
    shapes: string;
  };

  // ── Learning screen ───────────────────────────────────────────────────────
  next: string;
  finish: string;
  countLabel: string; // "Count" / "Cuenta"

  // ── Quiz screen ───────────────────────────────────────────────────────────
  quizPrompts: {
    letters: string;
    numbers: string;
    colors: string;
    shapes: string;
  };

  // ── Color hop game ────────────────────────────────────────────────────────
  jumpOn: (colorName: string) => string;
  tapToJump: string;
  feedbackYes: string;
  feedbackNo: string;
  youWin: string;
  gameOver: string;
  winMessage: (score: number) => string;
  loseMessage: (score: number) => string;
  playAgain: string;

  // ── Celebration overlay ───────────────────────────────────────────────────
  greatJob: string;
  youDidIt: string;

  // ── Learning card ─────────────────────────────────────────────────────────
  tapMe: string;

  // ── Module card ───────────────────────────────────────────────────────────
  completedBadge: string;

  // ── Profile setup ─────────────────────────────────────────────────────────
  editProfile: string;
  newKid: string;
  yourName: string;
  nameLabel: string;
  enterName: string;
  pickColor: string;
  saveChanges: string;
  letsGo: string;
  oops: string;
  nameRequired: string;
  nameTooLong: string;

  // ── Parent dashboard ──────────────────────────────────────────────────────
  parentsLabel: string;
  parentDashboard: string;
  kidsLabel: string;
  noProfiles: string;
  addFirstKid: string;
  addAnotherKid: string;
  changePinLabel: string;
  changePinTitle: string;
  newPinLabel: string;
  confirmPinLabel: string;
  pinMustBe4: string;
  pinsNoMatch: string;
  pinUpdatedTitle: string;
  pinUpdatedMsg: string;
  deleteProfileTitle: string;
  deleteProfileMsg: (name: string) => string;

  // ── PIN screen ────────────────────────────────────────────────────────────
  parentArea: string;
  createPinTitle: string;
  createPinSubtitle: string;
  confirmPinTitle: string;
  confirmPinSubtitle: string;
  pinCreatedMsg: string;
  enterPin: string;
  tooManyTries: string;
  wrongPin: (triesLeft: number) => string;

  // ── Learning content ──────────────────────────────────────────────────────
  colorNames: Record<string, string>;
  numberWords: Record<string, string>;
  shapeNames: Record<string, string>;
  shapeDescriptions: Record<string, string>;
  letterWords: Record<string, string>;
  letterEmojis: Record<string, string>;
}

// ── English ───────────────────────────────────────────────────────────────────

const en: Translations = {
  back: '← Back',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  backToMenu: '← Back to Menu',

  whoLearning: "Who's learning today?",
  addKid: 'Add Kid',
  tapToStart: 'Tap "Add Kid" to get started!',

  whatToLearn: 'What do you want\nto learn?',
  gameTime: '🎮 Game Time!',
  quickQuizzes: 'Quick Quizzes',
  colorHopTitle: 'Color Hop',
  colorHopSub: 'Jump on the right color!',
  quiz: 'Quiz',

  moduleTitles: {
    letters: 'Letters',
    numbers: 'Numbers',
    colors: 'Colors',
    shapes: 'Shapes',
  },
  moduleTitlesEmoji: {
    letters: '🔤 Letters',
    numbers: '🔢 Numbers',
    colors: '🎨 Colors',
    shapes: '🔷 Shapes',
  },

  next: 'Next ▶',
  finish: 'Finish! 🎉',
  countLabel: 'Count',

  quizPrompts: {
    letters: 'What letter does this start with?',
    numbers: 'How many are there?',
    colors: 'What color is this?',
    shapes: 'What shape is this?',
  },

  jumpOn: (name) => `${name}! Jump on it!`,
  tapToJump: 'Tap to jump!',
  feedbackYes: '🎉 Yes!',
  feedbackNo: '❌ Oops!',
  youWin: 'You Win!',
  gameOver: 'Game Over!',
  winMessage: (score) => `Amazing! All ${score} colors!`,
  loseMessage: (score) => `You got ${score} point${score !== 1 ? 's' : ''}!`,
  playAgain: 'Play Again!',

  greatJob: 'Great Job!',
  youDidIt: '🎉 You did it! 🎉',

  tapMe: '👆 Tap me!',
  completedBadge: '⭐ Done!',

  editProfile: 'Edit Profile',
  newKid: 'New Kid!',
  yourName: 'Your Name',
  nameLabel: 'Name',
  enterName: 'Enter name...',
  pickColor: 'Pick a Color',
  saveChanges: 'Save Changes ✅',
  letsGo: "Let's Go! 🚀",
  oops: 'Oops!',
  nameRequired: 'Please enter a name for this kid.',
  nameTooLong: 'Name must be 20 characters or less.',

  parentsLabel: 'Parents',
  parentDashboard: '👪 Parent Dashboard',
  kidsLabel: '← Kids',
  noProfiles: 'No profiles yet!',
  addFirstKid: '+ Add First Kid',
  addAnotherKid: '+ Add Another Kid',
  changePinLabel: '🔑 Change PIN',
  changePinTitle: 'Change PIN',
  newPinLabel: 'New PIN',
  confirmPinLabel: 'Confirm PIN',
  pinMustBe4: 'PIN must be exactly 4 digits.',
  pinsNoMatch: 'PINs do not match. Try again.',
  pinUpdatedTitle: 'PIN Updated',
  pinUpdatedMsg: 'Your new PIN has been saved.',
  deleteProfileTitle: 'Delete Profile',
  deleteProfileMsg: (name) =>
    `Are you sure you want to delete ${name}'s profile? All their progress will be lost.`,

  parentArea: 'Parent Area',
  createPinTitle: 'Create Your PIN',
  createPinSubtitle: 'Choose a 4-digit PIN to protect the Parent Area',
  confirmPinTitle: 'Confirm Your PIN',
  confirmPinSubtitle: 'Enter the same PIN again',
  pinCreatedMsg: '🔐 PIN created!',
  enterPin: 'Enter PIN to continue',
  tooManyTries: 'Too many tries! Come back later.',
  wrongPin: (n) => `Wrong PIN! ${n} ${n === 1 ? 'try' : 'tries'} left.`,

  letterWords: {
    A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
    F: 'Fish', G: 'Grapes', H: 'House', I: 'Ice Cream', J: 'Jellyfish',
    K: 'Kite', L: 'Lion', M: 'Moon', N: 'Nest', O: 'Orange',
    P: 'Penguin', Q: 'Queen', R: 'Rainbow', S: 'Sun', T: 'Tiger',
    U: 'Umbrella', V: 'Violin', W: 'Whale', X: 'Xylophone', Y: 'Yak', Z: 'Zebra',
  },
  letterEmojis: {
    A: '🍎', B: '⚽', C: '🐱', D: '🐶', E: '🐘',
    F: '🐟', G: '🍇', H: '🏠', I: '🍦', J: '🪼',
    K: '🪁', L: '🦁', M: '🌙', N: '🪺', O: '🍊',
    P: '🐧', Q: '👸', R: '🌈', S: '☀️', T: '🐯',
    U: '☂️', V: '🎻', W: '🐋', X: '🎵', Y: '🐃', Z: '🦓',
  },
  colorNames: {
    Red: 'Red',
    Blue: 'Blue',
    Yellow: 'Yellow',
    Green: 'Green',
    Orange: 'Orange',
    Purple: 'Purple',
    Pink: 'Pink',
    White: 'White',
  },
  numberWords: {
    One: 'One',
    Two: 'Two',
    Three: 'Three',
    Four: 'Four',
    Five: 'Five',
    Six: 'Six',
    Seven: 'Seven',
    Eight: 'Eight',
    Nine: 'Nine',
    Ten: 'Ten',
  },
  shapeNames: {
    Circle: 'Circle',
    Square: 'Square',
    Triangle: 'Triangle',
    Rectangle: 'Rectangle',
    Star: 'Star',
    Heart: 'Heart',
  },
  shapeDescriptions: {
    Circle: 'Round like the sun!',
    Square: 'Four equal sides!',
    Triangle: 'Three pointy sides!',
    Rectangle: 'Like a door or book!',
    Star: 'Twinkle twinkle!',
    Heart: 'Full of love!',
  },
};

// ── Spanish ───────────────────────────────────────────────────────────────────

const es: Translations = {
  back: '← Atrás',
  cancel: 'Cancelar',
  save: 'Guardar',
  delete: 'Eliminar',
  backToMenu: '← Volver al Menú',

  whoLearning: '¿Quién aprende hoy?',
  addKid: 'Agregar Niño',
  tapToStart: '¡Toca "Agregar Niño" para comenzar!',

  whatToLearn: '¿Qué quieres\naprender?',
  gameTime: '🎮 ¡Hora de Jugar!',
  quickQuizzes: 'Pruebas Rápidas',
  colorHopTitle: 'Salto de Colores',
  colorHopSub: '¡Salta sobre el color correcto!',
  quiz: 'Prueba',

  moduleTitles: {
    letters: 'Letras',
    numbers: 'Números',
    colors: 'Colores',
    shapes: 'Formas',
  },
  moduleTitlesEmoji: {
    letters: '🔤 Letras',
    numbers: '🔢 Números',
    colors: '🎨 Colores',
    shapes: '🔷 Formas',
  },

  next: 'Siguiente ▶',
  finish: '¡Terminar! 🎉',
  countLabel: 'Cuenta',

  quizPrompts: {
    letters: '¿Con qué letra empieza esto?',
    numbers: '¿Cuántos hay?',
    colors: '¿De qué color es esto?',
    shapes: '¿Qué forma es esta?',
  },

  jumpOn: (name) => `¡${name}! ¡Salta!`,
  tapToJump: '¡Toca para saltar!',
  feedbackYes: '🎉 ¡Sí!',
  feedbackNo: '❌ ¡Uy!',
  youWin: '¡Ganaste!',
  gameOver: '¡Juego Terminado!',
  winMessage: (score) => `¡Increíble! ¡Los ${score} colores!`,
  loseMessage: (score) => `¡Conseguiste ${score} punto${score !== 1 ? 's' : ''}!`,
  playAgain: '¡Jugar de Nuevo!',

  greatJob: '¡Buen Trabajo!',
  youDidIt: '🎉 ¡Lo lograste! 🎉',

  tapMe: '👆 ¡Tócame!',
  completedBadge: '⭐ ¡Listo!',

  editProfile: 'Editar Perfil',
  newKid: '¡Nuevo Niño!',
  yourName: 'Tu Nombre',
  nameLabel: 'Nombre',
  enterName: 'Escribe el nombre...',
  pickColor: 'Elige un Color',
  saveChanges: 'Guardar Cambios ✅',
  letsGo: '¡Vamos! 🚀',
  oops: '¡Ups!',
  nameRequired: 'Por favor escribe un nombre para este niño.',
  nameTooLong: 'El nombre debe tener 20 caracteres o menos.',

  parentsLabel: 'Padres',
  parentDashboard: '👪 Panel de Padres',
  kidsLabel: '← Niños',
  noProfiles: '¡Sin perfiles aún!',
  addFirstKid: '+ Agregar Primer Niño',
  addAnotherKid: '+ Agregar Otro Niño',
  changePinLabel: '🔑 Cambiar PIN',
  changePinTitle: 'Cambiar PIN',
  newPinLabel: 'PIN Nuevo',
  confirmPinLabel: 'Confirmar PIN',
  pinMustBe4: 'El PIN debe tener exactamente 4 dígitos.',
  pinsNoMatch: 'Los PINs no coinciden. Inténtalo de nuevo.',
  pinUpdatedTitle: 'PIN Actualizado',
  pinUpdatedMsg: 'Tu nuevo PIN ha sido guardado.',
  deleteProfileTitle: 'Eliminar Perfil',
  deleteProfileMsg: (name) =>
    `¿Seguro que quieres eliminar el perfil de ${name}? Se perderá todo su progreso.`,

  parentArea: 'Área de Padres',
  createPinTitle: 'Crea tu PIN',
  createPinSubtitle: 'Elige un PIN de 4 dígitos para proteger el Área de Padres',
  confirmPinTitle: 'Confirma tu PIN',
  confirmPinSubtitle: 'Ingresa el mismo PIN de nuevo',
  pinCreatedMsg: '🔐 ¡PIN creado!',
  enterPin: 'Escribe el PIN para continuar',
  tooManyTries: '¡Demasiados intentos! Vuelve más tarde.',
  wrongPin: (n) =>
    `¡PIN incorrecto! ${n === 1 ? 'Queda 1 intento' : `Quedan ${n} intentos`}.`,

  letterWords: {
    A: 'Árbol', B: 'Ballena', C: 'Casa', D: 'Delfín', E: 'Elefante',
    F: 'Fresa', G: 'Gato', H: 'Helado', I: 'Iguana', J: 'Jirafa',
    K: 'Koala', L: 'Luna', M: 'Mariposa', N: 'Naranja', O: 'Oso',
    P: 'Perro', Q: 'Queso', R: 'Ratón', S: 'Sol', T: 'Tortuga',
    U: 'Uva', V: 'Vaca', W: 'Wafle', X: 'Xilófono', Y: 'Yogur', Z: 'Zorro',
  },
  letterEmojis: {
    A: '🌳', B: '🐋', C: '🏠', D: '🐬', E: '🐘',
    F: '🍓', G: '🐱', H: '🍦', I: '🦎', J: '🦒',
    K: '🐨', L: '🌙', M: '🦋', N: '🍊', O: '🐻',
    P: '🐶', Q: '🧀', R: '🐭', S: '☀️', T: '🐢',
    U: '🍇', V: '🐄', W: '🧇', X: '🎵', Y: '🥛', Z: '🦊',
  },
  colorNames: {
    Red: 'Rojo',
    Blue: 'Azul',
    Yellow: 'Amarillo',
    Green: 'Verde',
    Orange: 'Naranja',
    Purple: 'Morado',
    Pink: 'Rosa',
    White: 'Blanco',
  },
  numberWords: {
    One: 'Uno',
    Two: 'Dos',
    Three: 'Tres',
    Four: 'Cuatro',
    Five: 'Cinco',
    Six: 'Seis',
    Seven: 'Siete',
    Eight: 'Ocho',
    Nine: 'Nueve',
    Ten: 'Diez',
  },
  shapeNames: {
    Circle: 'Círculo',
    Square: 'Cuadrado',
    Triangle: 'Triángulo',
    Rectangle: 'Rectángulo',
    Star: 'Estrella',
    Heart: 'Corazón',
  },
  shapeDescriptions: {
    Circle: '¡Redondo como el sol!',
    Square: '¡Cuatro lados iguales!',
    Triangle: '¡Tres lados puntiagudos!',
    Rectangle: '¡Como una puerta o un libro!',
    Star: '¡Brilla que brilla!',
    Heart: '¡Lleno de amor!',
  },
};

export const translations: Record<Language, Translations> = { en, es };
