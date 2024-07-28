// Array of quote objects
let quotes = [];

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
  const selectedFilter = localStorage.getItem('selectedFilter');
  if (selectedFilter) {
    document.getElementById('categoryFilter').value = selectedFilter;
    filterQuotes();
  }
}

// Save last selected filter to local storage
function saveSelectedFilter(filter) {
  localStorage.setItem('selectedFilter', filter);
}

// Populate the category dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Function to display quotes based on filter
function filterQuotes() {
  const filter = document.getElementById('categoryFilter').value;
  saveSelectedFilter(filter);
  
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (filter === 'all') {
    showAllQuotes();
  } else {
    const filteredQuotes = quotes.filter(q => q.category === filter);
    quoteDisplay.innerHTML = filteredQuotes.map(q => `<p>${q.text}</p><p><em>${q.category}</em></p>`).join('');
  }
}

// Function to show all quotes
function showAllQuotes() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = quotes.map(q => `<p>${q.text}</p><p><em>${q.category}</em></p>`).join('');
}

// Function to display a random quote
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

// Initialize the application
function initializeApp() {
  loadQuotes();
  populateCategories();
  loadSelectedFilter();
  createAddQuoteForm();
  filterQuotes(); // Display quotes based on the current filter
}

initializeApp();
