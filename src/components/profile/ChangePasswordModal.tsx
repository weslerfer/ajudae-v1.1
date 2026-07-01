import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';
import { GlassSurface } from '../ui/GlassSurface';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../api';
import { useToast } from '../ui/useToast';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Simple strength validation for demonstration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nova_senha !== formData.confirmar_senha) {
      toast({
        title: 'Senhas divergentes',
        description: 'A nova senha e a confirmação não coincidem.',
        variant: 'warning'
      });
      return;
    }

    if (!validatePassword(formData.nova_senha)) {
      toast({
        title: 'Senha fraca',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.updatePassword({
        senha_atual: formData.senha_atual,
        nova_senha: formData.nova_senha
      });
      
      toast({
        title: 'Senha Atualizada',
        description: 'Sua senha foi alterada com sucesso.',
        variant: 'success'
      });
      
      setFormData({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: err.message || 'Verifique se sua senha atual está correta.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Alterar Senha de Acesso</ModalTitle>
          <Typography variant="body" color="secondary" className="mt-2">
            Mantenha sua conta segura utilizando uma senha forte.
          </Typography>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <GlassSurface intensity="subtle" className="p-6 border-slate-800 space-y-4">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Senha Atual</label>
              <div className="relative">
                <Input
                  type={showPassword.atual ? "text" : "password"}
                  name="senha_atual"
                  value={formData.senha_atual}
                  onChange={handleChange}
                  icon={<KeyRound className="w-4 h-4 text-slate-400" />}
                  required
                />
                <button 
                  type="button" 
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-white z-20"
                  onClick={() => togglePasswordVisibility('atual')}
                >
                  {showPassword.atual ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Nova Senha</label>
              <div className="relative">
                <Input
                  type={showPassword.nova ? "text" : "password"}
                  name="nova_senha"
                  value={formData.nova_senha}
                  onChange={handleChange}
                  icon={<KeyRound className="w-4 h-4 text-slate-400" />}
                  required
                />
                <button 
                  type="button" 
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-white z-20"
                  onClick={() => togglePasswordVisibility('nova')}
                >
                  {showPassword.nova ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Repetir Nova Senha</label>
              <div className="relative">
                <Input
                  type={showPassword.confirmar ? "text" : "password"}
                  name="confirmar_senha"
                  value={formData.confirmar_senha}
                  onChange={handleChange}
                  icon={<KeyRound className="w-4 h-4 text-slate-400" />}
                  required
                />
                <button 
                  type="button" 
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-white z-20"
                  onClick={() => togglePasswordVisibility('confirmar')}
                >
                  {showPassword.confirmar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </GlassSurface>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              Alterar Senha
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
