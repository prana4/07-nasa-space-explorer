
// NOTE: You do not need to edit this file.

// NASA's APOD API only has images from June 16, 1995 onwards
const earliestDate = '1995-06-16';

// Get today's date in YYYY-MM-DD format (required by date inputs)
const today = new Date().toISOString().split('T')[0];

function setupDateInputs(startInput, endInput) {
  // Restrict date selection range from NASA's first image to today
  startInput.min = earliestDate;
  startInput.max = today;
  endInput.min = earliestDate;
  endInput.max = today;

// Default: Show the most recent 3 days of space images
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 2); // Changed from -8 to -2
startInput.value = lastWeek.toISOString().split('T')[0];
endInput.value = today;

// Automatically adjust end date to show exactly 3 days of images
startInput.addEventListener('change', () => {
  const startDate = new Date(startInput.value);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 2); // 3 days total
  
  // Make sure we don't go past today
  const todayDate = new Date(today);
  if (endDate > todayDate) {
    endInput.value = today;
  } else {
    endInput.value = endDate.toISOString().split('T')[0];
  }
});
}
