let apiPokemon = []
let customPokemon = JSON.parse(localStorage.getItem('customPokemon')) || []
let favourites = JSON.parse(localStorage.getItem('favourite')) || []

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
    renderTypeFilets()
    updateFavouriteCount()
    setUpEventListeners()
})  

//Functions from app
async function loadPokemon() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=25')
    const data = await response.json

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
