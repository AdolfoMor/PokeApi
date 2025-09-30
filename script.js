// Configuración inicial
const apiBaseUrl = 'https://pokeapi.co/api/v2';

// Mapeo de generaciones por rangos de IDs
const generationRanges = {
    '1': { start: 1, end: 151, name: 'Kanto' },
    '2': { start: 152, end: 251, name: 'Johto' },
    '3': { start: 252, end: 386, name: 'Hoenn' },
    '4': { start: 387, end: 493, name: 'Sinnoh' },
    '5': { start: 494, end: 649, name: 'Teselia' },
    '6': { start: 650, end: 721, name: 'Kalos' },
    '7': { start: 722, end: 809, name: 'Alola' },
    '8': { start: 810, end: 898, name: 'Galar' },
    '9': { start: 899, end: 1025, name: 'Paldea' }
};

// Tipos de Pokémon
const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Variables globales
let allPokemon = [];
let filteredPokemon = [];
const pokemonCache = {};

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');
const loadingMessage = document.getElementById('loadingMessage');
const pokemonTableBody = document.getElementById('pokemonTableBody');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pokédex inicializada');
    
    // Cargar tipos en el filtro
    loadTypeFilter();
    loadAllPokemon();

    // Configurar eventos
    searchBtn.addEventListener('click', applyFilters);
    clearBtn.addEventListener('click', clearFilters);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });

    typeFilter.addEventListener('change', applyFilters);
    generationFilter.addEventListener('change', applyFilters);
});

// Cargar tipos en el filtro
function loadTypeFilter() {
    pokemonTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeFilter.appendChild(option);
    });
    console.log('Filtro de tipos cargado');
}

async function loadAllPokemon() {
    try {
        showLoading('Cargando Pokémon...');
        
        // Obtener la lista de Pokémon 
        const response = await fetch(`${apiBaseUrl}/pokemon?limit=50`);
        const data = await response.json();
        
        console.log(`Obtenidos ${data.results.length} Pokémon`);
        
        // Obtener detalles de cada Pokémon
        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon, index) => {
                // Usar caché para evitar peticiones duplicadas
                if (pokemonCache[pokemon.name]) {
                    return pokemonCache[pokemon.name];
                }
                
                const pokemonResponse = await fetch(pokemon.url);
                const pokemonData = await pokemonResponse.json();
                
                // Almacenar en caché
                pokemonCache[pokemon.name] = pokemonData;
                
                return pokemonData;
            })
        );
        
        allPokemon = pokemonDetails;
        filteredPokemon = [...allPokemon];
        
        // Mostrar Pokémon en la tabla
        displayPokemon(filteredPokemon);
        
        hideLoading();
        console.log('Pokémon cargados y mostrados en tabla');
        
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        showLoading('Error al cargar los datos. Intenta recargar la página.');
    }
}

// Mostrar Pokémon en la tabla
function displayPokemon(pokemonList) {
    pokemonTableBody.innerHTML = '';
    
    if (pokemonList.length === 0) {
        pokemonTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron Pokémon</td></tr>';
        return;
    }
    
    pokemonList.forEach(pokemon => {
        const row = document.createElement('tr');
        
        // Imagen
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = pokemon.sprites.front_default || 'https://via.placeholder.com/80x80?text=?';
        img.alt = pokemon.name;
        img.className = 'pokemon-img';
        imgCell.appendChild(img);
        
        // Nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = pokemon.name;
        nameCell.className = 'pokemon-name';
        
        // Tipos
        const typeCell = document.createElement('td');
        pokemon.types.forEach(typeInfo => {
            const typeSpan = document.createElement('span');
            typeSpan.textContent = typeInfo.type.name;
            typeSpan.className = `type-badge ${typeInfo.type.name}`;
            typeCell.appendChild(typeSpan);
        });
        
        // Peso
        const weightCell = document.createElement('td');
        weightCell.textContent = `${pokemon.weight / 10} kg`;
        
        // Altura
        const heightCell = document.createElement('td');
        heightCell.textContent = `${pokemon.height / 10} m`;
        
        // ID
        const idCell = document.createElement('td');
        idCell.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        // Añadir celdas a la fila
        row.appendChild(imgCell);
        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(weightCell);
        row.appendChild(heightCell);
        row.appendChild(idCell);
        
        // Añadir fila a la tabla
        pokemonTableBody.appendChild(row);
    });
    
    console.log(`Mostrados ${pokemonList.length} Pokémon en la tabla`);
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value;
    const selectedGeneration = generationFilter.value;
    
    console.log('Aplicando filtros:', { searchTerm, selectedType, selectedGeneration });
    
    filteredPokemon = allPokemon.filter(pokemon => {
        // Filtrar por búsqueda de nombre
        if (searchTerm && !pokemon.name.includes(searchTerm)) {
            return false;
        }
        
        // Filtrar por tipo
        if (selectedType) {
            const hasType = pokemon.types.some(typeInfo => 
                typeInfo.type.name === selectedType
            );
            if (!hasType) {
                return false;
            }
        }
        
        // Filtrar por generación
        if (selectedGeneration) {
            const range = generationRanges[selectedGeneration];
            if (pokemon.id < range.start || pokemon.id > range.end) {
                return false;
            }
        }
        
        return true;
    });
    
    displayPokemon(filteredPokemon);
    console.log(`Filtros aplicados: ${filteredPokemon.length} Pokémon mostrados`);
}

// Función para limpiar filtros
function clearFilters() {
    searchInput.value = '';
    typeFilter.value = '';
    generationFilter.value = '';
    filteredPokemon = [...allPokemon];
    displayPokemon(filteredPokemon);
    console.log('Filtros limpiados - Mostrando todos los Pokémon');
}

// Función para mostrar mensaje de carga
function showLoading(message) {
    loadingMessage.textContent = message;
    loadingMessage.style.display = 'block';
}

// Función para ocultar mensaje de carga
function hideLoading() {
    loadingMessage.style.display = 'none';
}