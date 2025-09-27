// Define os parâmetros para cada tela da sua navegação principal (Stack)
export type RootStackParamList = {
  // Telas de Autenticação
  Login: undefined;
  Register: undefined;

  // Telas Pós-Login baseadas no Role
  Home: undefined;      // Para Aluno e Financeiro
  Admin: undefined;     // Para Admin
  Teacher: undefined;   // Para Professor
};