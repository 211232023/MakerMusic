const BASE_URL = 'http://192.168.0.158:3000/api';

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
    return [];
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

export const createTask = async (taskData, token) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData) 
    });
    return response.json();
};

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

export const getMySchedules = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/schedules/my-schedules`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return [];
  }
};

export const getSchedulesForTeacherByDay = async (dayOfWeek, token) => {
    try {
        const response = await fetch(`${BASE_URL}/schedules/teacher/day/${dayOfWeek}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    } catch (error) {
        console.error('Erro ao buscar horários do professor:', error);
        return [];
    }
};

export const markAttendance = async (attendanceData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(attendanceData)
        });
        return response.json();
    } catch (error) {
        console.error('Erro ao marcar presença:', error);
        return { message: 'Não foi possível ligar ao servidor.' };
    }
};

export const createSchedule = async (scheduleData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(scheduleData)
        });
        return response.json();
    } catch (error) {
        console.error('Erro ao criar horário:', error);
        return { message: 'Não foi possível ligar ao servidor.' };
    }
};

export const createOrUpdatePayment = async (paymentData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/finance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

export const getMyPayments = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/finance/my-payments`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return [];
  }
};