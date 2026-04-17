export interface ShapeItem {
  name: string;
  emoji: string;
  description: string;
  examples: string;
}

export const SHAPES: ShapeItem[] = [
  { name: 'Circle', emoji: '⭕', description: 'Round like the sun!', examples: '🌕 ⚽ 🍪' },
  { name: 'Square', emoji: '⬛', description: 'Four equal sides!', examples: '📦 🧊 🎲' },
  { name: 'Triangle', emoji: '🔺', description: 'Three pointy sides!', examples: '🍕 ⛰️ 🎄' },
  { name: 'Rectangle', emoji: '🚪', description: 'Like a door or book!', examples: '📱 📚 🧱' },
  { name: 'Star', emoji: '⭐', description: 'Twinkle twinkle!', examples: '🌟 ⭐ 💫' },
  { name: 'Heart', emoji: '❤️', description: 'Full of love!', examples: '💕 🫀 💝' },
];
