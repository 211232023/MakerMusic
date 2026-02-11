import { Platform } from 'react-native';
import { BASE_API_URL } from '../config/config';

const BASE_URL = BASE_API_URL;

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

//Novas Funções de rexuperação de senha
export async function forgotPassword(email) {
  try {
    const response = await fetch(`${BASE_URL}/users/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    return await response.json();

  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    return { message: "Erro de conexão com o servidor" };
  }
}

export async function resetPassword({ token, newPassword }) {
  try {
    const response = await fetch(`${BASE_URL}/users/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });

    return await response.json();

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return { message: "Erro de conexão com o servidor" };
  }
}

export async function updatePassword({ email, newPassword }) {
  try {
    // Nota: Esta rota está sendo substituída pelo fluxo de token/resetPassword
    const response = await fetch(`${BASE_URL}/update-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });

    return await response.json();

  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return { message: "Erro de conexão com o servidor" };
  }
}

export const getMyTasks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'GET',
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    return [];
  }
};

export const getMyStudents = async (token) => { // AGORA ACEITA O TOKEN
  try {
    const response = await fetch(`${BASE_URL}/users/my-students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // USA O TOKEN PASSADO
      },
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

export const getStudentPerformance = async (studentId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/tasks/performance/${studentId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar desempenho do aluno:', error);
    return { total: 0, completed: 0, tasks: [] };
  }
};

export const getChatHistory = async (otherUserId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/history/${otherUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    return [];
  }
};

export const sendMessage = async (receiverId, messageText, token, extraData = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ receiverId, messageText, ...extraData }),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

export const uploadChatFile = async (file, token) => {
  try {
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      formData.append('file', blob, file.name || 'upload');
    } else {
      // No Mobile (Android/iOS)
      let fileUri = file.uri;
      
      // Correção para Android: garantir que o URI comece com file:// se necessário
      if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = 'file://' + fileUri;
      }

      let fileType = file.type;
      const extension = file.name ? file.name.split('.').pop().toLowerCase() : '';
      const mimeMap = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
        'mp4': 'video/mp4', 'mov': 'video/quicktime', 'm4v': 'video/x-m4v', '3gp': 'video/3gpp',
        'mp3': 'audio/mpeg', 'm4a': 'audio/mp4', 'wav': 'audio/wav', 'ogg': 'audio/ogg',
        'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      if (mimeMap[extension]) {
        fileType = mimeMap[extension];
      } else if (!fileType || fileType === 'video' || fileType === 'audio' || fileType === 'image') {
        fileType = fileType ? `${fileType}/any` : 'application/octet-stream';
      }

      // No React Native, o objeto para upload de arquivo deve ter esta estrutura
      formData.append('file', {
        uri: fileUri,
        name: file.name || `upload_${Date.now()}`,
        type: fileType,
      });
    }

    const response = await fetch(`${BASE_URL}/chat/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Importante: NÃO definir 'Content-Type' manualmente ao usar FormData no React Native
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        message: errorData.message || `Erro no servidor: ${response.status}`,
        status: response.status 
      };
    }

    return response.json();
  } catch (error) {
    console.error('Erro no upload do arquivo:', error);
    return { message: 'Erro ao conectar ao servidor para upload.' };
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

export const getAllStudentsFinance = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/finance/students`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar todos os alunos para o financeiro:', error);
    return [];
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

// EXPORTANDO A FUNÇÃO QUE ESTAVA FALTANDO
export const updatePaymentStatus = async (paymentId, status, token) => {
  try {
    const response = await fetch(`${BASE_URL}/finance/${paymentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

//Nova função para o admin
export const registerUserByAdmin = async (userData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  } catch (error) {
    console.error('Erro no registo por Admin:', error);
    return { message: 'Não foi possível ligar ao servidor.' };
  }
};

// Funções para buscar estatísticas (Resumo Rápido)
export const getStudentStats = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/student/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      console.error('Erro na resposta:', response.status);
      return { tasks: 0, classes: 0, progress: 0 };
    }
    const data = await response.json();
    console.log('[API] getStudentStats retornou:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas do aluno:', error);
    return { tasks: 0, classes: 0, progress: 0 };
  }
};

export const getTeacherStats = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/users/teacher/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      console.error('Erro na resposta:', response.status);
      return { students: 0, classesToday: 0, tasks: 0 };
    }
    const data = await response.json();
    console.log('[API] getTeacherStats retornou:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas do professor:', error);
    return { students: 0, classesToday: 0, tasks: 0 };
  }
};

export const getFinanceStats = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/finance/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  } catch (error) {
    console.error('Erro ao buscar estatísticas financeiras:', error);
    return { paid: 0, pending: 0, overdue: 0 };
  }
};