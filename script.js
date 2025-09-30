// Configuración inicial
const apiBaseUrl = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 150;

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
let currentPage = 1;
const itemsPerPage = 20;

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');
const loadingMessage = document.getElementById('loadingMessage');
const pokemonTableBody = document.getElementById('pokemonTableBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pokédex inicializada');
    
    // Cargar tipos en el filtro
    loadTypeFilter();

    //Cargar Pokémon
    loadAllPokemon();

    // Configurar eventos
    setupEventListeners();
});

// Configurar todos los event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', applyFilters);
    clearBtn.addEventListener('click', clearFilters);
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });
    
    typeFilter.addEventListener('change', function() {
        currentPage = 1;
        applyFilters();
    });
    
    generationFilter.addEventListener('change', function() {
        currentPage = 1;
        applyFilters();
    });
    
    prevBtn.addEventListener('click', goToPreviousPage);
    nextBtn.addEventListener('click', goToNextPage);
}

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
        const response = await fetch(`${apiBaseUrl}/pokemon?limit=${POKEMON_LIMIT}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        console.log(`Obtenidos ${data.results.length} Pokémon`);

        showLoading(`Cargando detalles de Pokémon... (0/${data.results.length})`);
        
        // Obtener detalles de cada Pokémon
        const pokemonDetails = [];
        for (let i = 0; i < data.results.length; i++) {
            const pokemon = data.results[i];
            
            // Actualizar progreso cada 10 Pokémon
            if (i % 10 === 0) {
                showLoading(`Cargando detalles de Pokémon... (${i}/${data.results.length})`);
            }
            
            try {
                const pokemonData = await fetchPokemonDetails(pokemon.url);
                pokemonDetails.push(pokemonData);
            } catch (error) {
                console.warn(`Error cargando ${pokemon.name}:`, error);
                // Continuar con los siguientes Pokémon
            }
        }
        
        allPokemon = pokemonDetails.sort((a, b) => a.id - b.id);
        filteredPokemon = [...allPokemon];
        
        // Mostrar Pokémon en la tabla
        displayPokemon(filteredPokemon);
        
        hideLoading();

        showStatusMessage(`¡Listo! Se cargaron ${allPokemon.length} Pokémon`, 'success');
        console.log('Pokémon cargados y mostrados en tabla');
        
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        showLoading('Error al cargar los datos. Intenta recargar la página.');
        showStatusMessage('Error al cargar los Pokémon. Verifica tu conexión.', 'error');
    }
}

async function fetchPokemonDetails(url) {
    const pokemonName = url.split('/').filter(Boolean).pop();
    
    // Verificar caché
    if (pokemonCache[pokemonName]) {
        return pokemonCache[pokemonName];
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const pokemonData = await response.json();
    
    // Almacenar en caché
    pokemonCache[pokemonName] = pokemonData;
    
    return pokemonData;
}

// Mostrar página actual de Pokémon
function displayPokemonPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pokemonToShow = filteredPokemon.slice(startIndex, endIndex);
    
    displayPokemon(pokemonToShow);
    updatePaginationControls();
    updateResultsCount();
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
        img.title = `#${pokemon.id.toString().padStart(3, '0')} ${pokemon.name}`;
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
            typeSpan.title = `Tipo ${typeInfo.type.name}`;
            typeCell.appendChild(typeSpan);
        });
        
        // Peso
        const weightCell = document.createElement('td');
        weightCell.textContent = `${pokemon.weight / 10} kg`;
        weightCell.title = `Peso: ${pokemon.weight / 10} kg`;
        
        // Altura
        const heightCell = document.createElement('td');
        heightCell.textContent = `${pokemon.height / 10} m`;
        heightCell.title = `Altura: ${pokemon.height / 10} m`;
        
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

// Actualizar controles de paginación
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    
    // Actualizar información de página
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    
    // Actualizar estado de botones
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Ocultar controles si no hay páginas
    document.querySelector('.pagination-controls').style.display = 
        totalPages <= 1 ? 'none' : 'flex';
}

// Actualizar contador de resultados
function updateResultsCount() {
    let countElement = document.querySelector('.results-count');
    
    if (!countElement) {
        countElement = document.createElement('div');
        countElement.className = 'results-count';
        document.querySelector('.table-container').insertBefore(
            countElement, 
            document.querySelector('#pokemonTable')
        );
    }
    
    const total = filteredPokemon.length;
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, total);
    const end = Math.min(currentPage * itemsPerPage, total);
    
    if (total === 0) {
        countElement.textContent = 'No se encontraron Pokémon';
    } else if (total <= itemsPerPage) {
        countElement.textContent = `Mostrando ${total} Pokémon`;
    } else {
        countElement.textContent = `Mostrando ${start}-${end} de ${total} Pokémon`;
    }
}

// Navegación de páginas
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPokemonPage();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPokemonPage();
    }
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
    
    // Resetear a primera página después de filtrar
    currentPage = 1;
    displayPokemonPage();
    
    console.log(`Filtros aplicados: ${filteredPokemon.length} Pokémon encontrados`);
    
    // Mostrar mensaje si no hay resultados
    if (filteredPokemon.length === 0) {
        showStatusMessage('No se encontraron Pokémon con los criterios de búsqueda', 'error');
    }
}

// Función para limpiar filtros
function clearFilters() {
    searchInput.value = '';
    typeFilter.value = '';
    generationFilter.value = '';
    currentPage = 1;
    filteredPokemon = [...allPokemon];
    displayPokemon(filteredPokemon);
    showStatusMessage('Filtros limpiados - Mostrando todos los Pokémon', 'success');
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

// Mostrar mensaje de estado temporal
function showStatusMessage(message, type = 'info') {
    // Remover mensajes anteriores
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `status-message status-${type}`;
    messageElement.textContent = message;
    
    // Insertar después de los controles
    document.querySelector('.controls').after(messageElement);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageElement.parentElement) {
            messageElement.remove();
        }
    }, 5000);
}