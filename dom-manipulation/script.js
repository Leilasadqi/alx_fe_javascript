let quotes = [];
let selectedCategory = 'all'; // Default to 'all' categories

// Simulate server URL
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Use a mock API endpoint

// Fetch quotes from the server
async function fetchQuotesFromServer() {
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
async function postQuotesToServer(quotes) {
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

// Function to synchronize quotes with the server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length) {
    handleSync(serverQuotes);
    notifyUser('Quotes synced with server!');
  }
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

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load last selected filter from local storage
function loadSelectedFilter() {
  const storedCategory = localStorage.getItem('selectedCategory');
  if (storedCategory) {
    selectedCategory = storedCategory;
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes();
  }
}

// Save last selected filter to local storage
function saveSelectedFilter(category) {
  localStorage.setItem('selectedCategory', category);
}

// Populate the category dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Function to display quotes based on filter
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

// Function to show a random quote
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

// Function to add a new quote
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

// Function to create and display the form for adding new quotes
function createAddQuoteForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuote">Add Quote</button>
    <button id="exportQuotes">Export Quotes</button>
    <input type="file" id="importFile" accept=".json" />
  `;
  
  // Add event listeners
  document.getElementById('addQuote').addEventListener('click', addQuote);
  document.getElementById('exportQuotes').addEventListener('click', exportToJson);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
}

// Function to export quotes to a JSON file
function exportToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes = [...importedQuotes];
    saveQuotes();
    populateCategories();
    showRandomQuote(); // Show a new random quote
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to handle category filter change
function handleCategoryFilterChange() {
  selectedCategory = document.getElementById('categoryFilter').value;
  filterQuotes();
}

// Initialize the application
function initializeApp() {
  loadQuotes();
  populateCategories();
  loadSelectedFilter();
  createAddQuoteForm();
  
  // Add event listener for category filter change
  document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilterChange);

  filterQuotes(); // Display quotes based on the current filter
  startPeriodicSync(); // Start syncing data with the server
}

// Start periodic synchronization
function startPeriodicSync() {
  // Sync every 5 minutes (300000 milliseconds)
  setInterval(syncQuotes, 300000);
}

initializeApp();
