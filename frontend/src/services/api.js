// ATENÇÃO: Substitua 'SEU_IP_AQUI' pelo endereço de IP da sua máquina!
const BASE_URL = 'http://10.90.1.17:3000/api';

// Função para o registo de utilizadores
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  } catch (error) {
    console.error('Erro no registo:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

// Função para o login de utilizadores
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  } catch (error) {
    console.error('Erro no login:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

export const getMyTasks = async () => {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'GET',
      headers: headers,
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    return []; // Retorna um array vazio em caso de erro de rede
  }
};

export const getMyStudents = async () => {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${BASE_URL}/tasks/students`, {
      method: 'GET',
      headers: headers,
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao obter alunos:', error);
    return [];
  }
};

// Criar uma nova tarefa
export const createTask = async (taskData) => {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(taskData),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return { message: 'Erro de rede' };
  }
};

// Obter a lista de todos os utilizadores
export const getAllUsers = async () => {
  try {
    const headers = await createAuthHeaders();
    console.log('[FRONTEND] A enviar pedido para /api/admin/users com o token:', headers.Authorization); // <-- LOG 1

    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: headers,
    });

    const data = await response.json();
    console.log('[FRONTEND] Resposta recebida do backend:', data); // <-- LOG 2
    return data;

  } catch (error) {
    console.error('[FRONTEND] Erro de rede ao obter utilizadores:', error); // <-- LOG DE ERRO
    return [];
  }
};


export const assignTeacher = async (studentId, teacherId) => {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${BASE_URL}/admin/assign-teacher`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ studentId, teacherId }),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao associar professor:', error);
    return { message: 'Erro de rede' };
  }
};