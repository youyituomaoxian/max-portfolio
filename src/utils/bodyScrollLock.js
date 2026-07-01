let lockCount = 0;

export function lockBodyScroll() {
  if (lockCount++ === 0) {
    document.body.style.overflow = 'hidden';
  }
}

export function unlockBodyScroll() {
  if (--lockCount <= 0) {
    lockCount = 0;
    document.body.style.overflow = '';
  }
}
