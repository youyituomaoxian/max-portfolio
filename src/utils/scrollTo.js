/**
 * Smooth scroll to element by id
 * @param {string} id - Target element id
 */
export function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
