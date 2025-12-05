
import React, { useState, useEffect, useMemo } from 'react';
import { Tarefa, StatusTarefa } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface TarefaFormProps {
  store: ReturnType<typeof usePmoStore>;
  tarefa: Tarefa | null;
  onClose: () => void;
}

const TarefaForm: React.FC<TarefaFormProps> = ({ store, tarefa, onClose }) => {
  const { state, actions } = store;

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const initialState = {
    nome: '',
    descricao: '',
    responsavelId: '',
    projetoId: '',
    status: StatusTarefa.AFazer,
    dataInicio: getTodayString(),
    dataVencimento: '',
    dependencias: [] as string[],
    progresso: 0,
  };
  
  const [formData, setFormData] = useState(initialState);
  type FormErrors = { [key in keyof typeof initialState]?: string };
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);


  const workloadMap = useMemo(() => {
    return state.recursos.reduce((acc, recurso) => {
        acc[recurso.id] = state.tarefas.filter(
            t => t.responsavelId === recurso.id && t.status !== StatusTarefa.Concluida
        ).length;
        return acc;
    }, {} as Record<string, number>);
  }, [state.recursos, state.tarefas]);

  useEffect(() => {
    if (tarefa) {
      setFormData({
        ...tarefa,
        dataInicio: new Date(tarefa.dataInicio).toISOString().split('T')[0],
        dataVencimento: new Date(tarefa.dataVencimento).toISOString().split('T')[0],
        progresso: tarefa.progresso || 0,
      });
    }
  }, [tarefa]);

  const validateForm = (data: typeof formData): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.nome.trim()) newErrors.nome = 'O nome da tarefa é obrigatório.';
    if (!data.projetoId) newErrors.projetoId = 'Selecione um projeto.';
    if (!data.responsavelId) newErrors.responsavelId = 'Selecione um responsável.';
    if (!data.dataInicio) newErrors.dataInicio = 'Data de início é obrigatória.';
    if (!data.dataVencimento) newErrors.dataVencimento = 'Data de vencimento é obrigatória.';
    else if (new Date(data.dataVencimento) < new Date(data.dataInicio)) {
        newErrors.dataVencimento = 'Data de vencimento deve ser posterior à data de início.';
    }
    return newErrors;
  }

   useEffect(() => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setIsFormValid(Object.keys(validationErrors).length === 0);
  }, [formData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const taskData = {
        ...formData,
        progresso: Number(formData.progresso),
        dataInicio: new Date(formData.dataInicio),
        dataVencimento: new Date(formData.dataVencimento),
    };

    if (tarefa) {
      actions.updateTarefa({ ...tarefa, ...taskData });
    } else {
      actions.addTarefa(taskData);
    }
    onClose();
  };
  
  const getInputClass = (fieldName: keyof FormErrors) => 
    `w-full bg-sga-dark p-2 rounded border ${errors[fieldName] ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-sga-blue text-white`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-sga-gray mb-1">Nome da Tarefa</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={getInputClass('nome')}/>
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-sga-gray mb-1">Descrição</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={3} className="w-full bg-sga-dark p-2 rounded border border-gray-600 text-white"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="projetoId" className="block text-sm font-medium text-sga-gray mb-1">Projeto</label>
                <select name="projetoId" value={formData.projetoId} onChange={handleChange} className={getInputClass('projetoId')}>
                    <option value="">Selecione o Projeto</option>
                    {state.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                {errors.projetoId && <p className="text-red-500 text-xs mt-1">{errors.projetoId}</p>}
            </div>
            <div>
                <label htmlFor="responsavelId" className="block text-sm font-medium text-sga-gray mb-1">Responsável</label>
                <select name="responsavelId" value={formData.responsavelId} onChange={handleChange} className={getInputClass('responsavelId')}>
                    <option value="">Selecione o Responsável</option>
                    {state.recursos.map(r => {
                        const taskCount = workloadMap[r.id] || 0;
                        const taskText = taskCount === 1 ? 'tarefa ativa' : 'tarefas ativas';
                        return (
                            <option key={r.id} value={r.id}>
                                {r.nome} ({taskCount} {taskText})
                            </option>
                        )
                    })}
                </select>
                {errors.responsavelId && <p className="text-red-500 text-xs mt-1">{errors.responsavelId}</p>}
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label htmlFor="dataInicio" className="block text-sm font-medium text-sga-gray mb-1">Data de Início</label>
                <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={getInputClass('dataInicio')}/>
                {errors.dataInicio && <p className="text-red-500 text-xs mt-1">{errors.dataInicio}</p>}
             </div>
             <div>
                <label htmlFor="dataVencimento" className="block text-sm font-medium text-sga-gray mb-1">Data de Vencimento</label>
                <input type="date" name="dataVencimento" value={formData.dataVencimento} onChange={handleChange} className={getInputClass('dataVencimento')}/>
                {errors.dataVencimento && <p className="text-red-500 text-xs mt-1">{errors.dataVencimento}</p>}
             </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-sga-gray mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={getInputClass('status')}>
                    {Object.values(StatusTarefa).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>

          <div>
             <label htmlFor="progresso" className="block text-sm font-medium text-sga-gray mb-1">Progresso: {formData.progresso}%</label>
             <div className="flex items-center space-x-2">
                 <input 
                    type="range" 
                    name="progresso" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={formData.progresso} 
                    onChange={handleChange} 
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
             </div>
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

export default TarefaForm;