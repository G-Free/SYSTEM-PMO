import React, { useState, useEffect, useMemo } from 'react';
import { Recurso, StatusTarefa } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface RecursoFormProps {
  store: ReturnType<typeof usePmoStore>;
  recurso: Recurso | null;
  onClose: () => void;
}

const RecursoForm: React.FC<RecursoFormProps> = ({ store, recurso, onClose }) => {
  const { state, actions } = store;
  
  const initialState = {
    nome: '',
    funcao: '',
  };

  const [formData, setFormData] = useState(initialState);
  type FormErrors = { [key in keyof typeof initialState]?: string };
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const workload = useMemo(() => {
    if (!recurso) {
        return null;
    }
    const resourceTasks = state.tarefas.filter(t => t.responsavelId === recurso.id);
    const inProgressTasks = resourceTasks.filter(t => t.status === StatusTarefa.EmAndamento).length;
    const overdueTasks = resourceTasks.filter(t => new Date(t.dataVencimento) < new Date() && t.status !== StatusTarefa.Concluida).length;
    return { inProgressTasks, overdueTasks };
  }, [recurso, state.tarefas]);

  const validateForm = (data: typeof formData): FormErrors => {
      const newErrors: FormErrors = {};
      if (!data.nome.trim()) newErrors.nome = "O nome é obrigatório.";
      if (!data.funcao.trim()) newErrors.funcao = "A função é obrigatória.";
      return newErrors;
  }

  useEffect(() => {
    if (recurso) {
      setFormData({
        nome: recurso.nome,
        funcao: recurso.funcao,
      });
    }
  }, [recurso]);

  useEffect(() => {
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);
      setIsFormValid(Object.keys(validationErrors).length === 0);
  }, [formData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (recurso) {
      actions.updateRecurso({ ...recurso, ...formData });
    } else {
      actions.addRecurso(formData);
    }
    onClose();
  };

  const getInputClass = (fieldName: keyof FormErrors) => 
    `w-full bg-sga-dark p-2 rounded border ${errors[fieldName] ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-sga-blue text-white`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">{recurso ? 'Editar Recurso' : 'Novo Recurso'}</h2>
            {recurso && workload && (
                <div className="mt-2 flex items-center space-x-6 bg-sga-dark p-3 rounded-lg border border-gray-700">
                    <p className="text-sm font-semibold text-sga-gray flex-shrink-0">Carga de Trabalho:</p>
                    <div className="flex items-baseline space-x-2" title="Tarefas em andamento">
                        <span className="text-lg font-bold text-yellow-400">{workload.inProgressTasks}</span>
                        <span className="text-xs text-yellow-400/80">Em Andamento</span>
                    </div>
                    <div className="flex items-baseline space-x-2" title="Tarefas atrasadas">
                        <span className="text-lg font-bold text-red-500">{workload.overdueTasks}</span>
                        <span className="text-xs text-red-500/80">Atrasadas</span>
                    </div>
                </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-sga-gray mb-1">Nome</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={getInputClass('nome')}/>
             {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>
          <div>
            <label htmlFor="funcao" className="block text-sm font-medium text-sga-gray mb-1">Função</label>
            <input type="text" name="funcao" value={formData.funcao} onChange={handleChange} className={getInputClass('funcao')}/>
             {errors.funcao && <p className="text-red-500 text-xs mt-1">{errors.funcao}</p>}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition">Cancelar</button>
            <button type="submit" disabled={!isFormValid} className="bg-sga-blue text-white px-4 py-2 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-opacity-80">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecursoForm;