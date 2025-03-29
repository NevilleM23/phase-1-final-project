let apiPokemon = []
let customPokemon = JSON.parse(localStorage.getItem('customPokemon')) || []
let favourites = JSON.parse(localStorage.getItem('favourite')) || []

const pokemonContainer = document.getElementById('pokemon-container')
const addForm = document.getElementById('add-pokemon-form')
const searchInput = document.getElementById('search')

document.addEventListener('DOMContentLoaded', async() =>{
    await loadPokemon()
    renderPokemon()
    setUpEventListeners()
})  

asyn