const { pool } = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, teacher_id FROM users WHERE id != ?', [req.user.id]);
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'Usuário apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao apagar usuário.' });
    }
};

exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, id]
        );
        res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao editar usuário.' });
    }
};

exports.getStudentsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const [students] = await pool.query('SELECT id, name, email FROM users WHERE teacher_id = ? AND role = "ALUNO"', [teacherId]);
        res.json(students);
    } catch (error) {
        console.error('Erro ao buscar alunos do professor:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.assignTeacherToStudent = async (req, res) => {
    const { studentId, teacherId } = req.body;
    try {
        const teacherToAssign = teacherId || null;
        await pool.query('UPDATE users SET teacher_id = ? WHERE id = ?', [teacherToAssign, studentId]);
        res.status(200).json({ message: 'Professor vinculado ao aluno com sucesso!' });
    } catch (error) {
        console.error('Erro ao vincular professor:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};