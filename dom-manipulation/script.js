let quotes = [];
let selectedCategory = 'all'; // Default to 'all' categories

// Simulate server URL
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Use a mock API endpoint

// Fetch quotes from the server
async function fetchFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    return data.map(item => ({
      text: item.title, // Adjust based on the server data structure
      category: 'general' // Default category, adjust as needed
    }));
  } catch (error) {
    console.error('Error fetching data from server:', error);
    return [];
  }
}

// Post quotes to the server
async function postToServer(quotes) {
  try {
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
  } catch (error) {
    console.error('Error posting data to server:', error);
  }
}

// Periodically sync data with the server
function startPeriodicSync() {
  setInterval(async () => {
    const serverQuotes = await fetchFromServer();
    if (serverQuotes.length) {
      handleSync(serverQuotes);
    }
  }, 60000); // Sync every 60 seconds
}

// Handle syncing data and resolve conflicts
function handleSync(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
  quotes = mergedQuotes;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Merge local and server quotes with simple conflict resolution
function mergeQuotes(localQuotes, serverQuotes) {
  const serverQuoteMap = new Map(serverQuotes.map(q => [q.text, q]));
  const localQuoteMap = new Map(localQuotes.map(q => [q.text, q]));

  // Keep server data if there is a conflict
  const merged = [...serverQuoteMap.values(), ...localQuoteMap.values()].filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.text === value.text
    ))
  );

  return merged;
}

// Notify users of data updates or conflicts
function notifyUser(message) {
  const notification = document.getElementById('notification');
  if (!notification) {
    const newNotification = document.createElement('div');
    newNotification.id = 'notification';
    newNotification.style.position = 'fixed';
    newNotification.style.bottom = '10px';
    newNotification.style.right = '10px';
    newNotification.style.backgroundColor = 'yellow';
    newNotification.style.padding = '10px';
    newNotification.style.border = '1px solid black';
    document.body.appendChild(newNotification);
  }

  document.getElementById('notification').textContent = message;
}

// Function to manually resolve conflicts (optional)
function resolveConflict() {
  // Implement a user interface for manual conflict resolution if desired
  // For simplicity, this example just notifies the user
  notifyUser('Manual conflict resolution needed. Check the quote list for discrepancies.');
}

// Array of quote objects
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadSelectedFilter() {
  const storedCategory = localStorage.getItem('selectedCategory');
  if (storedCategory) {
    selectedCategory = storedCategory;
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes();
  }
}

function saveSelectedFilter(category) {
  localStorage.setItem('selectedCategory', category);
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterQuotes() {
  saveSelectedFilter(selectedCategory);
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  let filteredQuotes;
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  
  quoteDisplay.innerHTML = filteredQuotes.map(q => `<p>${q.text}</p><p><em>${q.category}</em></p>`).join('');
}

function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = 'No quotes available.';
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
}

function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('New quote added successfully!');
    filterQuotes(); // Update quotes display based on current filter
  } else {
    alert('Please enter both quote text and category.');
  }
}

function createAddQuoteForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="
