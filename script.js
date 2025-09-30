// Configuración inicial
const apiBaseUrl = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 1030;

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
let searchTimeout = null;

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const typeFilter = document.getElementById('typeFilter');
const generationFilter = document.getElementById('generationFilter');
const loadingOverlay = document.getElementById('loadingOverlay');
const pokemonTableBody = document.getElementById('pokemonTableBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const pokemonModal = document.getElementById('pokemonModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');
const resultsCount = document.getElementById('resultsCount');
const typeTranslations = {
    'normal': 'Normal',
    'fire': 'Fuego',
    'water': 'Agua',
    'electric': 'Eléctrico',
    'grass': 'Planta',
    'ice': 'Hielo',
    'fighting': 'Lucha',
    'poison': 'Veneno',
    'ground': 'Tierra',
    'flying': 'Volador',
    'psychic': 'Psíquico',
    'bug': 'Bicho',
    'rock': 'Roca',
    'ghost': 'Fantasma',
    'dragon': 'Dragón',
    'dark': 'Siniestro',
    'steel': 'Acero',
    'fairy': 'Hada'
};


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
    
    searchInput.addEventListener('input', function() {
        // Mostrar indicador de búsqueda
        showSearchIndicator();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            applyFilters();
            hideSearchIndicator();
        }, 500);
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

    // Modal events
    closeModal.addEventListener('click', closePokemonModal);
    window.addEventListener('click', function(event) {
        if (event.target === pokemonModal) {
            closePokemonModal();
        }
    });
    
}

// Cargar tipos en el filtro
function loadTypeFilter() {
    pokemonTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = typeTranslations[type]; // ← Usar traducción
        typeFilter.appendChild(option);
    });
    console.log('Filtro de tipos cargado en español');
}

async function loadAllPokemon() {
    try {
        loadingOverlay.style.display = 'flex';
        
        // Obtener el total de Pokémon
        const countResponse = await fetch(`${apiBaseUrl}/pokemon?limit=1`);
        const countData = await countResponse.json();
        const totalCount = countData.count;
        
        // Cargar todos los Pokémon de una vez
        const response = await fetch(`${apiBaseUrl}/pokemon?limit=${totalCount}`);
        const data = await response.json();
        
        // Cargar detalles (esto puede tomar unos segundos)
        const pokemonDetails = await Promise.all(
            data.results.map(pokemon => fetchPokemonDetails(pokemon.url))
        );
        
        allPokemon = pokemonDetails.sort((a, b) => a.id - b.id);
        filteredPokemon = [...allPokemon];
        
        displayPokemonPage();
        updateResultsCounter();
        loadingOverlay.style.display = 'none';
        
        console.log(`Carga completada: ${allPokemon.length} Pokémon`);
        
    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.style.display = 'none';
        showStatusMessage('Error al cargar los Pokémon', 'error');
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
        row.className = 'pokemon-row';

        // Hacer la fila clickeable
        row.addEventListener('click', () => showPokemonDetails(pokemon));

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
            typeSpan.textContent = typeTranslations[typeInfo.type.name];
            typeSpan.className = `type-badge ${typeInfo.type.name}`;
            typeSpan.title = `Tipo ${typeTranslations[typeInfo.type.name]}`;
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

function updateResultsCounter() {
    const total = filteredPokemon.length;
    const showing = Math.min(total, itemsPerPage);
    
    if (total === 0) {
        resultsCount.textContent = '0 Pokémon';
    } else if (total <= itemsPerPage) {
        resultsCount.textContent = `${total} Pokémon`;
    } else {
        const start = ((currentPage - 1) * itemsPerPage) + 1;
        const end = Math.min(currentPage * itemsPerPage, total);
        resultsCount.textContent = `Mostrando ${start}-${end} de ${total} Pokémon`;
    }
}
// Mostrar detalles del Pokémon en modal
async function showPokemonDetails(pokemon) {
    try {
        // Mostrar contenido de carga en el modal
        modalBody.innerHTML = `
            <div class="modal-pokemon">
                <div class="modal-header">
                    <div class="skeleton skeleton-text" style="width: 100px; margin: 0 auto 10px;"></div>
                    <div class="skeleton skeleton-text" style="width: 150px; margin: 0 auto 20px; height: 2rem;"></div>
                </div>
                <div class="modal-pokemon-image skeleton"></div>
                <div class="modal-types">
                    <div class="skeleton skeleton-text" style="width: 80px; height: 30px;"></div>
                    <div class="skeleton skeleton-text" style="width: 80px; height: 30px;"></div>
                </div>
                <div class="modal-stats">
                    ${Array(6).fill('<div class="stat-item"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>').join('')}
                </div>
            </div>
        `;
        
        pokemonModal.style.display = 'block';
        
        // Obtener datos adicionales si es necesario
        const pokemonData = await fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
        
        // Mostrar datos reales
        modalBody.innerHTML = `
            <div class="modal-pokemon">
                <div class="modal-header">
                    <div class="modal-pokemon-id">#${pokemonData.id.toString().padStart(3, '0')}</div>
                    <h2 class="modal-pokemon-name">${pokemonData.name}</h2>
                </div>
                <div class="modal-pokemon-image">
                    <img src="${pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}" alt="${pokemonData.name}">
                </div>
                <div class="modal-types">
                    ${pokemonData.types.map(type => 
                        `<span class="type-badge ${type.type.name}">${typeTranslations[type.type.name]}</span>`
                    ).join('')}
                </div>
                <div class="modal-stats">
                    <div class="stat-item">
                        <div class="stat-label">Altura</div>
                        <div class="stat-value">${pokemonData.height / 10} m</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Peso</div>
                        <div class="stat-value">${pokemonData.weight / 10} kg</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Experiencia Base</div>
                        <div class="stat-value">${pokemonData.base_experience || 'N/A'}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">HP</div>
                        <div class="stat-value">${pokemonData.stats[0].base_stat}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Ataque</div>
                        <div class="stat-value">${pokemonData.stats[1].base_stat}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Defensa</div>
                        <div class="stat-value">${pokemonData.stats[2].base_stat}</div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar detalles del Pokémon:', error);
        modalBody.innerHTML = `
            <div class="modal-pokemon">
                <div style="text-align: center; color: white; padding: 40px;">
                    <h3>Error al cargar los detalles</h3>
                    <p>Intenta nuevamente</p>
                </div>
            </div>
        `;
    }
}

// Cerrar modal
function closePokemonModal() {
    pokemonModal.style.display = 'none';
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
    updateResultsCounter(); 
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
    displayPokemonPage();
    showStatusMessage('Filtros limpiados - Mostrando todos los Pokémon', 'success');
    console.log('Filtros limpiados - Mostrando todos los Pokémon');
    updateResultsCounter();
}

// Mostrar indicador de búsqueda en tiempo real
function showSearchIndicator() {
    let indicator = document.querySelector('.search-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'search-indicator';
        document.querySelector('.search-section').appendChild(indicator);
    }
    indicator.textContent = 'Buscando...';
    indicator.style.display = 'block';
}

function hideSearchIndicator() {
    const indicator = document.querySelector('.search-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
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

updateResultsCounter();
 
updateResultsCounter();

updateResultsCounter();

updateResultsCounter();