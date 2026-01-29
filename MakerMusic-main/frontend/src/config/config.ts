// frontend/src/config/config.ts

// A URL base para o backend.
// No Expo, a variável de ambiente EXPO_PUBLIC_API_URL é injetada no build.
// Se não estiver definida (ex: em testes locais), usa um fallback.
const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// A URL base para acessar os arquivos estáticos (uploads).
// Usamos a mesma URL base, mas sem o sufixo '/api'.
const BASE_FILES_URL = BASE_API_URL.replace('/api', '');

export { BASE_API_URL, BASE_FILES_URL };