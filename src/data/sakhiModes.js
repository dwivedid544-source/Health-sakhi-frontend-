/** AI Sakhi conversation modes */

export const SAKHI_MODES = [
  { id: 'women', label: 'Women Support', emoji: '🌸', greeting: 'I am here for your heart and body, Sakhi.' },
  { id: 'family', label: 'Family Support', emoji: '🏠', greeting: 'Let us understand your home together.' },
  { id: 'teen', label: 'Teen Support', emoji: '🧒', greeting: 'Every feeling at this age matters.' },
  { id: 'elder', label: 'Elder Support', emoji: '🤝', greeting: 'Caring for elders is sacred — you matter too.' },
  { id: 'marriage', label: 'Marriage Support', emoji: '💑', greeting: 'Partnership stress is real. You are not alone.' }
];

export const getModeById = (id) => SAKHI_MODES.find((m) => m.id === id) || SAKHI_MODES[0];
