export function showToast(type, message) {
  if (message) {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { type, message },
    }));
  }
}
