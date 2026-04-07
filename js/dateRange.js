
// NOTE: You do not need to edit this file.

// NASA's APOD API only has images from June 16, 1995 onwards
const earliestDate = '1995-06-16';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format using local time
const today = formatLocalDate(new Date());

function setupDateInputs(startInput, endInput) {
  // Restrict date selection range from NASA's first image to today
  startInput.min = earliestDate;
  startInput.max = today;
  endInput.min = earliestDate;
  endInput.max = today;

  // Default: Show the most recent 3 days of space images
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 2);
  startInput.value = formatLocalDate(lastWeek);
  endInput.value = today;

  // Automatically adjust end date to show exactly 3 days of images
  startInput.addEventListener('change', () => {
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2); // 3 days total
    const todayDate = new Date();

    if (endDate > todayDate) {
      endInput.value = today;
    } else {
      endInput.value = formatLocalDate(endDate);
    }
  });
}
