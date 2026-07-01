import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building2, UserCircle2, Landmark, Banknote, ShieldAlert } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';
import { GlassSurface } from '../ui/GlassSurface';
import { Grid } from '../ui/Grid';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserProfile } from '../../types';
import { api } from '../../api';
import { useToast } from '../ui/useToast';

export interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_completo: user.nome_completo || '',
    email: user.email || '',
    telefone: user.telefone || '',
    cidade: user.cidade || '',
    estado: user.estado || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Update Profile (Contact/Location)
      const profileResponse = await api.updateProfile({
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone,
        cidade: formData.cidade,
        estado: formData.estado
      });
      
      
      // Merge updated user data
      const updatedUser = { ...user, ...formData };
      onUpdate(updatedUser);
      
      toast({
        title: 'Perfil Atualizado',
        description: 'Seus dados foram atualizados com sucesso.',
        variant: 'success'
      });
      
      onClose();
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err.message || 'Ocorreu um erro ao tentar salvar as alterações.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <ModalHeader>
          <ModalTitle>Editar Perfil</ModalTitle>
          <Typography variant="body" color="secondary" className="mt-2">
            Atualize suas informações pessoais, de contato e localização.
          </Typography>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <GlassSurface intensity="subtle" className="p-6 border-slate-800">
            <Typography variant="h4" className="mb-4">Dados Pessoais</Typography>
            <Grid cols={2} gap="md">
              <Input
                label="Nome Completo"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                icon={<UserCircle2 className="w-4 h-4 text-slate-400" />}
                required
              />
              <div className="relative">
                <Input
                  label="CPF"
                  value={user.cpf}
                  disabled
                  readOnly
                  icon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
                  className="opacity-70 bg-slate-900"
                />
                <Typography variant="caption" color="secondary" className="text-[10px] absolute -bottom-4 right-0 text-amber-500/70">
                  O CPF não pode ser alterado
                </Typography>
              </div>
            </Grid>
          </GlassSurface>

          <GlassSurface intensity="subtle" className="p-6 border-slate-800">
            <Typography variant="h4" className="mb-4">Contato e Localização</Typography>
            <Grid cols={2} gap="md">
              <Input
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
              <Input
                label="Telefone Celular"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                icon={<Phone className="w-4 h-4 text-slate-400" />}
                placeholder="(00) 00000-0000"
              />
              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                icon={<Building2 className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                icon={<MapPin className="w-4 h-4 text-slate-400" />}
                placeholder="Ex: SP"
                maxLength={2}
              />
            </Grid>
          </GlassSurface>



          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
