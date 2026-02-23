import { useState, useEffect } from 'react';

const TEMPLATE_STORAGE_KEY = 'whatsapp-message-template';

const DEFAULT_TEMPLATE = `Oi *Boa tarde!*
Aqui é o Luciano, crio sites profissionais e sistemas inteligentes 24h/7 para Clínicas.

Notei que a *{clinicName}* ainda não tem um site profissional.
Hoje, _pacientes_ escolhem clínicas com presença online, com um site bem feito *atrai, agenda e fideliza clientes* sem você precisar ficar no *WhatsApp o dia todo.*

Posso te mostrar em *15* minutos como transformar a sua clínica em referência local.
Que horário funciona melhor hoje?`;

export const useMessageTemplate = () => {
  const [template, setTemplate] = useState<string>(() => {
    const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return saved || DEFAULT_TEMPLATE;
  });

  const saveTemplate = (newTemplate: string) => {
    setTemplate(newTemplate);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, newTemplate);
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, DEFAULT_TEMPLATE);
  };

  const generateMessage = (clinicName: string) => {
    return template.replace(/\{clinicName\}/g, clinicName);
  };

  return {
    template,
    saveTemplate,
    resetTemplate,
    generateMessage,
  };
};
