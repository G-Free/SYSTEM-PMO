import React, { useState, useEffect } from 'react';
import { Projeto, StatusProjeto } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface ProjetoFormProps {
  store: ReturnType<typeof usePmoStore>;
  projeto: Projeto | null;
  onClose: () => void;
}

const ProjetoForm: React.FC<ProjetoFormProps> = ({ store, projeto, onClose }) => {
  const { state, actions } = store;

  const initialState = {
    nome: '',
    descricao: '',
    gerenteId: '',
    status: StatusProjeto.Planejado,
    orcamento: '',
    gastoAtual: '',
    beneficioPrevisto: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFimPrevista: '',
  };

  const [formData, setFormData] = useState(initialState);
  
  type FormErrors = { [key in keyof typeof initialState]?: string };
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (projeto) {
      setFormData({
        nome: projeto.nome,
        descricao: projeto.descricao,
        gerenteId: projeto.gerenteId,
        status: projeto.status,
        orcamento: String(projeto.orcamento),
        gastoAtual: String(projeto.gastoAtual),
        beneficioPrevisto: String(projeto.beneficioPrevisto),
        dataInicio: new Date(projeto.dataInicio).toISOString().split('T')[0],
        dataFimPrevista: new Date(projeto.dataFimPrevista).toISOString().split('T')[0],
      });
    }
  }, [projeto]);

  const validateForm = (currentData: typeof formData): FormErrors => {
    const newErrors: FormErrors = {};
    if (!currentData.nome.trim()) newErrors.nome = 'O nome do projeto é obrigatório.';
    if (!currentData.descricao.trim()) newErrors.descricao = 'A descrição é obrigatória.';
    if (!currentData.gerenteId) newErrors.gerenteId = 'Selecione um gerente.';
    if (isNaN(parseFloat(currentData.orcamento)) || parseFloat(currentData.orcamento) < 0) newErrors.orcamento = 'Orçamento deve ser um número positivo.';
    if (!currentData.dataInicio) newErrors.dataInicio = 'Data de início é obrigatória.';
    if (!currentData.dataFimPrevista) newErrors.dataFimPrevista = 'Data de fim prevista é obrigatória.';
    else if (new Date(currentData.dataFimPrevista) < new Date(currentData.dataInicio)) newErrors.dataFimPrevista = 'Data de fim deve ser posterior à data de início.';
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
    
    const projectData = {
        ...formData,
        orcamento: parseFloat(formData.orcamento) || 0,
        gastoAtual: parseFloat(formData.gastoAtual) || (projeto ? projeto.gastoAtual : 0),
        beneficioPrevisto: parseFloat(formData.beneficioPrevisto) || 0,
        dataInicio: new Date(formData.dataInicio),
        dataFimPrevista: new Date(formData.dataFimPrevista),
    };

    if (projeto) {
      actions.updateProjeto({ ...projeto, ...projectData });
    } else {
      actions.addProjeto(projectData);
    }
    onClose();
  };
  
  const getInputClass = (fieldName: keyof FormErrors) => 
    `w-full bg-sga-dark p-2 rounded border ${errors[fieldName] ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-sga-blue text-white`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-6">{projeto ? 'Editar Projeto' : 'Novo Projeto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-sga-gray mb-1">Nome do Projeto</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={getInputClass('nome')}/>
                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>
                 <div>
                    <label htmlFor="gerenteId" className="block text-sm font-medium text-sga-gray mb-1">Gerente</label>
                    <select name="gerenteId" value={formData.gerenteId} onChange={handleChange} className={getInputClass('gerenteId')}>
                        <option value="">Selecione um gerente</option>
                        {state.recursos.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                    </select>
                    {errors.gerenteId && <p className="text-red-500 text-xs mt-1">{errors.gerenteId}</p>}
                </div>
             </div>
              <div className="mt-4">
                <label htmlFor="descricao" className="block text-sm font-medium text-sga-gray mb-1">Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={4} className={getInputClass('descricao')}></textarea>
                {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
             </div>
          </fieldset>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-white mb-2">Financeiro</legend>
                 <div>
                    <label htmlFor="orcamento" className="block text-sm font-medium text-sga-gray mb-1">Orçamento (AOA)</label>
                    <input type="number" name="orcamento" value={formData.orcamento} onChange={handleChange} placeholder="ex: 500000" className={getInputClass('orcamento')}/>
                    {errors.orcamento && <p className="text-red-500 text-xs mt-1">{errors.orcamento}</p>}
                </div>
                <div>
                    <label htmlFor="gastoAtual" className="block text-sm font-medium text-sga-gray mb-1">Gasto Atual (AOA)</label>
                    <input type="number" name="gastoAtual" value={formData.gastoAtual} onChange={handleChange} placeholder="ex: 125000" className={getInputClass('gastoAtual')}/>
                </div>
                <div>
                    <label htmlFor="beneficioPrevisto" className="block text-sm font-medium text-sga-gray mb-1">Benefício Previsto (AOA)</label>
                    <input type="number" name="beneficioPrevisto" value={formData.beneficioPrevisto} onChange={handleChange} placeholder="ex: 750000" className={getInputClass('beneficioPrevisto')}/>
                </div>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-white mb-2">Prazos e Status</legend>
                <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-sga-gray mb-1">Data de Início</label>
                    <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={getInputClass('dataInicio')}/>
                    {errors.dataInicio && <p className="text-red-500 text-xs mt-1">{errors.dataInicio}</p>}
                </div>
                <div>
                    <label htmlFor="dataFimPrevista" className="block text-sm font-medium text-sga-gray mb-1">Data de Fim Prevista</label>
                    <input type="date" name="dataFimPrevista" value={formData.dataFimPrevista} onChange={handleChange} className={getInputClass('dataFimPrevista')}/>
                    {errors.dataFimPrevista && <p className="text-red-500 text-xs mt-1">{errors.dataFimPrevista}</p>}
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-sga-gray mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={getInputClass('status')}>
                        {Object.values(StatusProjeto).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </fieldset>
           </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition">Cancelar</button>
            <button 
              type="submit" 
              disabled={!isFormValid}
              className="bg-sga-blue text-white px-4 py-2 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-opacity-80"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjetoForm;