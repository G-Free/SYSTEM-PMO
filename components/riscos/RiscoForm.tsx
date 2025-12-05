
import React, { useState, useEffect } from 'react';
import { Risco, StatusRisco, ImpactoRisco, ProbabilidadeRisco } from '../../types';
import { usePmoStore } from '../../services/pmoService';

interface RiscoFormProps {
  store: ReturnType<typeof usePmoStore>;
  risco: Risco | null;
  onClose: () => void;
}

const RiscoForm: React.FC<RiscoFormProps> = ({ store, risco, onClose }) => {
  const { state, actions } = store;
  const [formData, setFormData] = useState({
    descricao: '',
    projetoId: '',
    impacto: ImpactoRisco.Baixo,
    probabilidade: ProbabilidadeRisco.Baixa,
    status: StatusRisco.Aberto,
    responsavelId: '',
    planoMitigacao: '',
  });

  // Validation State
  type FormErrors = { [key in keyof typeof formData]?: string };
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (risco) {
      setFormData({
        descricao: risco.descricao,
        projetoId: risco.projetoId,
        impacto: risco.impacto,
        probabilidade: risco.probabilidade,
        status: risco.status,
        responsavelId: risco.responsavelId,
        planoMitigacao: risco.planoMitigacao,
      });
    }
  }, [risco]);

  const validateForm = (data: typeof formData): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!data.descricao.trim()) newErrors.descricao = 'A descrição é obrigatória.';
    if (!data.projetoId) newErrors.projetoId = 'Selecione um projeto.';
    if (!data.responsavelId) newErrors.responsavelId = 'Selecione um responsável.';

    // Validação Condicional: Plano de Mitigação
    const isHighImpact = data.impacto === ImpactoRisco.Alto;
    const isInProgress = data.status === StatusRisco.EmAndamento;

    if ((isHighImpact || isInProgress) && !data.planoMitigacao.trim()) {
        newErrors.planoMitigacao = 'O plano de mitigação é obrigatório para riscos de Impacto Alto ou em Andamento.';
    }

    return newErrors;
  };

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

    if (risco) {
      actions.updateRisco({ ...risco, ...formData });
    } else {
      actions.addRisco(formData);
    }
    onClose();
  };

  const getInputClass = (fieldName: keyof FormErrors) => 
    `w-full bg-sga-dark p-2 rounded border ${errors[fieldName] ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-sga-blue text-white`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-sga-dark-light p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{risco ? 'Editar Risco' : 'Novo Risco'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-sga-gray mb-1">Descrição do Risco</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={3} className={getInputClass('descricao')}></textarea>
            {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="projetoId" className="block text-sm font-medium text-sga-gray mb-1">Projeto Associado</label>
              <select name="projetoId" value={formData.projetoId} onChange={handleChange} className={getInputClass('projetoId')}>
                <option value="">Selecione um projeto</option>
                {state.projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
               {errors.projetoId && <p className="text-red-500 text-xs mt-1">{errors.projetoId}</p>}
            </div>
            <div>
                <label htmlFor="responsavelId" className="block text-sm font-medium text-sga-gray mb-1">Responsável</label>
                <select name="responsavelId" value={formData.responsavelId} onChange={handleChange} className={getInputClass('responsavelId')}>
                <option value="">Selecione um responsável</option>
                {state.recursos.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
                 {errors.responsavelId && <p className="text-red-500 text-xs mt-1">{errors.responsavelId}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="impacto" className="block text-sm font-medium text-sga-gray mb-1">Impacto</label>
              <select name="impacto" value={formData.impacto} onChange={handleChange} className={getInputClass('impacto')}>
                {Object.values(ImpactoRisco).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="probabilidade" className="block text-sm font-medium text-sga-gray mb-1">Probabilidade</label>
              <select name="probabilidade" value={formData.probabilidade} onChange={handleChange} className={getInputClass('probabilidade')}>
                {Object.values(ProbabilidadeRisco).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-sga-gray mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={getInputClass('status')}>
                {Object.values(StatusRisco).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

           <div>
            <label htmlFor="planoMitigacao" className="block text-sm font-medium text-sga-gray mb-1">Plano de Mitigação</label>
            <textarea name="planoMitigacao" value={formData.planoMitigacao} onChange={handleChange} rows={3} className={getInputClass('planoMitigacao')}></textarea>
            {errors.planoMitigacao && <p className="text-red-500 text-xs mt-1">{errors.planoMitigacao}</p>}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
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

export default RiscoForm;
