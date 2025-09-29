// ATENÇÃO: Substitua 'SEU_IP_AQUI' pelo endereço de IP da sua máquina!
const BASE_URL = 'http://10.90.1.104:3000/api';

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
export const createTask = async (taskData, token) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData) // ex: { studentId: '1', title: 'Estudar...', dueDate: '2025-10-10' }
    });
    return response.json();
};

// Obter a lista de todos os utilizadores
export const getAllUsers = async (token) => {
    const response = await fetch(`${BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};


export const assignTeacherToStudent = async (studentId, teacherId, token) => {
    const response = await fetch(`${BASE_URL}/admin/assign-teacher`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, teacherId })
    });
    return response.json();
};

export const getStudentsByTeacher = async (teacherId, token) => {
    const response = await fetch(`${BASE_URL}/admin/teacher/${teacherId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};

export const getTasksByStudent = async (studentId, token) => {
    const response = await fetch(`${BASE_URL}/tasks/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};

export const deleteUser = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao deletar utilizador:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

// Aluno marca uma tarefa como concluída
export const updateTaskStatus = async (taskId, completed, token) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

export const getChatHistory = async (otherUserId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/${otherUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    return [];
  }
};

// Envia uma nova mensagem de chat
export const sendMessage = async (receiverId, messageText, token) => {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ receiverId, messageText }),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

export const getMyTeacher = async (token) => {
  const response = await fetch(`${BASE_URL}/users/my-teacher`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};