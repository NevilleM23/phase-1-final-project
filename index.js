let apiPokemon = []
let customPokemon = JSON.parse(localStorage.getItem('customPokemon')) || []
let favourites = JSON.parse(localStorage.getItem('favouritea')) || []

//elements
const pokemonContainer = document.getElementById('pokemon-container')
const addForm = document.getElementById('pokemon-form')
const searchInput = document.getElementById('search')
const typeFilters = document.getElementById('type-filters')
const addModal = document.getElementById('add-modal')
const detailModal = document.getElementById('detail-modal')
const addButton = document.getElementById('add-pokemon-btn')
const showAllButton = document.getElementById('show-all')
const showFavouritesButton = document.getElementById('show-favourites')
const favouriteCount = document.getElementById('favourite-count')

//initalizes app
document.addEventListener('DOMContentLoaded', async() =>{
    await loadPokemon()
    renderTypeFilters()
    updateFavouriteCount()
    setupEventListeners()
})  

//Functions from app
async function loadPokemon() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=25')
    const data = await response.json()

    apiPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        return res.json();
      })
    );
} renderPokemon(getAllPokemon) 

function getAllPokemon(){
    return [...apiPokemon,...customPokemon]
}  

function renderPokemon(pokemonList) {
    pokemonContainer.innerHTML = pokemonList.map(pokemon => `
      <div class="pokemon-card" data-id="${pokemon.id}">
        <button class="favourite-btn ${favourites.includes(pokemon.id) ? 'active' : ''}" 
                data-id="${pokemon.id}">
          ${favourites.includes(pokemon.id) ? '★' : '☆'}
        </button>
        <img src="${pokemon.sprites?.front_default || 'custom.png'}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <div class="pokemon-types">
          ${pokemon.types?.map(type => `
            <span class="pokemon-type type-${type.type.name}">${type.type.name}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
  } 


  function renderTypeFilters() {
    const allTypes = [...new Set(
      getAllPokemon().flatMap(p => p.types?.map(t => t.type.name) || [])
    )];
    
    typeFilters.innerHTML = allTypes.map(type => `
      <button class="type-btn type-${type}" data-type="${type}">
        ${type}
      </button>
    `).join('');
  } 

  function showPokemonDetail(pokemon) {
    const detailContent = document.getElementById('pokemon-detail');
    
    detailContent.innerHTML = `
      <img src="${pokemon.sprites?.front_default || 'custom.png'}" alt="${pokemon.name}">
      <h2>${pokemon.name}</h2>
      <div class="detail-types">
        ${pokemon.types?.map(type => `
          <span class="pokemon-type type-${type.type.name}">${type.type.name}</span>
        `).join('')}
      </div>
      <div class="stats">
        ${pokemon.stats?.map(stat => `
          <div class="stat-row">
            <span class="stat-name">${stat.stat.name}:</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stat.base_stat}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    detailModal.style.display = 'block';
  } 


  function toggleFavourite(pokemonId) {
    favourites = favourites.includes(pokemonId)
      ? favourites.filter(id => id !== pokemonId)
      : [...favourites, pokemonId];
    
    localStorage.setItem('favourites', JSON.stringify(favourites));
    updateFavouriteCount();
    renderPokemon(getAllPokemon());
  }
  
  function updateFavouriteCount() {
    favouriteCount.textContent = `(${favourites.length})`;
  }

  
//event listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = getAllPokemon().filter(p => 
        p.name.toLowerCase().includes(term)
      );
      renderPokemon(filtered);
    });
    
    // Type Filters
    typeFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('type-btn')) {
        const type = e.target.dataset.type;
        const filtered = getAllPokemon().filter(p => 
          p.types?.some(t => t.type.name === type)
        );
        renderPokemon(filtered);
      }
    });
    
    // Favorites View
    showFavouritesButton.addEventListener('click', () => {
      const favPokemon = getAllPokemon().filter(p => favourites.includes(p.id));
      renderPokemon(favPokemon);
      showAllButton.classList.remove('active-view');
      showFavouritesButton.classList.add('active-view');
    }); 

    // All Pokémon View
    showAllButton.addEventListener('click', () => {
        renderPokemon(getAllPokemon());
        showFavouritesButton.classList.remove('active-view');
        showAllButton.classList.add('active-view');
    });
    
    // Add Pokémon Modal
    addButton.addEventListener('click', () => {
        addModal.style.display = 'block';
    });
    
    // Close Modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
        addModal.style.display = 'none';
        detailModal.style.display = 'none';
        });
    });
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addModal) addModal.style.display = 'none';
        if (e.target === detailModal) detailModal.style.display = 'none';
    });
    
    // Form Submission
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();

 
        const newPokemon = {
            id: Date.now(),
            name: document.getElementById('name').value,
            types: [{ type: { name: document.getElementById('type').value } }],
            stats: [
              { base_stat: parseInt(document.getElementById('hp').value), stat: { name: 'hp' } },
              { base_stat: parseInt(document.getElementById('attack').value), stat: { name: 'attack' } },
            ],
            sprites: { front_default: document.getElementById('pokemon-image').value || 'custom.png' }
          };
          
          customPokemon.push(newPokemon);
          localStorage.setItem('customPokemon', JSON.stringify(customPokemon));
          renderPokemon(getAllPokemon());
          renderTypeFilters();
          addModal.style.display = 'none';
          addForm.reset();
        });
        
        // Card Clicks (event delegation)
        pokemonContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.pokemon-card');
          const favouriteBtn = e.target.closest('.favourite-btn');

          if (favouriteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const pokemonId = parseInt(favouriteBtn.dataset.id);
            toggleFavourite(pokemonId);
          } else if (card) {
            const pokemonId = parseInt(card.dataset.id);
            const pokemon = getAllPokemon().find(p => p.id === pokemonId);
            showPokemonDetail(pokemon);
          }
        });
      }
