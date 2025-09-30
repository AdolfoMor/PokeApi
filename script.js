// Configuración inicial
const apiBaseUrl = 'https://pokeapi.co/api/v2';

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
    
    // Configurar eventos
    searchBtn.addEventListener('click', function() {
        console.log('Botón buscar clickeado');
        
    });
    
    clearBtn.addEventListener('click', function() {
        console.log('Botón limpiar clickeado');
        clearFilters();
    });
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            console.log('Enter presionado en búsqueda');
            
        }
    });
    
    typeFilter.addEventListener('change', function() {
        console.log('Filtro de tipo cambiado:', this.value);
        
    });
    
    generationFilter.addEventListener('change', function() {
        console.log('Filtro de generación cambiado:', this.value);
        
    });
});

// Función para limpiar filtros
function clearFilters() {
    searchInput.value = '';
    typeFilter.value = '';
    generationFilter.value = '';
    console.log('Filtros limpiados');
    
    
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