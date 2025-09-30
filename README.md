# PokeApi
Una aplicación web moderna que consume la **PokéAPI** para mostrar información de Pokémon con filtros avanzados y búsqueda en tiempo real.

---

## 🚀 Características

- **Tabla completa** de Pokémon con imagen, nombre, tipo, peso, altura e ID  
- **Búsqueda en tiempo real** por nombre de Pokémon  
- **Filtros avanzados** por tipo y generación  
- **Paginación** con navegación intuitiva  
- **Diseño responsive** para todos los dispositivos  
- **Modal de detalles** con información expandida  
- **Contador dinámico** de resultados  
- **Carga optimizada** con spinner de Pokébola  

---

## 🔌 Conexión a la API

La aplicación se conecta a la **PokéAPI**:  
`https://pokeapi.co/api/v2/`

### Endpoints utilizados
- `GET /pokemon?limit={count}` → Lista todos los Pokémon  
- `GET /pokemon/{id|name}` → Detalles específicos de un Pokémon  
- `GET /type/{type}` → Información de tipos (para filtros)  

---

## 🛠️ Funcionalidades Principales

### 1. Carga Inicial
```javascript
loadAllPokemon()

// Obtiene el count total de Pokémon desde la API
// Carga todos los datos en una sola petición
// Muestra spinner de carga durante el proceso
// Ordena Pokémon por ID numérico
```

### 2. Sistema de Filtros
```javascript
applyFilters()

// Búsqueda por nombre con debounce de 500ms
// Filtro por tipo: 18 tipos disponibles
// Filtro por generación: 9 generaciones (Kanto → Paldea)
```

### 3. Paginación
```javascript
displayPokemonPage()

// Muestra 20 Pokémon por página
// Navegación con botones anterior/siguiente
// Cálculo automático de páginas totales
```

### 4. Modal de Detalles
```javascript
showPokemonDetails(pokemon)

// Muestra arte oficial del Pokémon
// Estadísticas completas (HP, Ataque, Defensa, etc.)
// Información detallada de tipos y características
```

### 5. Gestión de Estado
```javascript
// Variables globales principales
let allPokemon = [];        // Todos los Pokémon cargados
let filteredPokemon = [];   // Pokémon filtrados actualmente
let currentPage = 1;        // Página actual
const pokemonCache = {};    // Cache para evitar peticiones duplicadas
```

---

## 📁 Estructura de Archivos
```text
pokemon-app/
├── index.html          # Estructura principal
├── style.css           # Estilos y diseño responsive
├── script.js           # Lógica de la aplicación
└── README.md           # Este archivo
```

---

## 🎨 Diseño y UX

- Interfaz moderna con gradientes y efectos visuales  
- Feedback visual inmediato en todas las acciones  
- Responsive design para móviles, tablets y desktop  
- Loading states con spinner de Pokébola personalizado  
- Manejo de errores con mensajes informativos  

---

## 🔧 Optimizaciones Implementadas

- **Cache de peticiones** → evita llamadas duplicadas a la API  
- **Debounce en búsqueda** → reduce peticiones innecesarias  
- **Paginación del lado cliente** → mejora rendimiento con grandes datasets  
- **Lazy loading** → carga progresiva de imágenes  
- **Manejo de errores** → *graceful degradation* en fallos de red  

---

## 📱 Compatibilidad

✅ Chrome, Firefox, Safari, Edge  
✅ Dispositivos móviles (iOS/Android)  
✅ Tablets y pantallas táctiles  
✅ Navegadores modernos (ES6+)  

---

## 📌 Nota

Esta es una aplicación de demostración para mostrar habilidades en:  

- Consumo de APIs REST  
- JavaScript moderno  
- Desarrollo frontend  
- Optimización de rendimiento  

---