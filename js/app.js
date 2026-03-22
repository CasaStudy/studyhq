// ===== APP INIT =====

document.addEventListener('DOMContentLoaded', () => {

  // Restore saved form values
  if (saved) restoreFormValues(saved);

  // Initialise UI components
  initScDays();
  renderPats();
  renderHolidays();
  renderEvs();
  renderCal();

  // Register service worker for PWA offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

});
