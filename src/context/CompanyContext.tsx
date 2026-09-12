import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyConfig } from '../types';

const defaultConfig: CompanyConfig = {
  name: 'DK MEDICAL & GENERAL SUPPLIES',
  tagline: 'Quality Medical & General Supplies',
  phone: '0818894083',
  phoneTelLink: 'tel:0818894083',
  whatsapp: '0765113443',
  whatsappIntl: '27765113443',
  whatsappUrl: 'https://wa.me/27765113443',
  email: 'sales@dkmedical.co.za',
  emailMailto: 'mailto:sales@dkmedical.co.za',
  logoUrl: '/images/dk-medical-logo.svg',
  copyright: '© 2026 DK Medical & General Supplies. All Rights Reserved.'
};

const CompanyContext = createContext<CompanyConfig>(defaultConfig);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CompanyConfig>(defaultConfig);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setConfig(data);
        }
      })
      .catch(err => {
        console.warn('Using default company configuration:', err);
      });
  }, []);

  return (
    <CompanyContext.Provider value={config}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  return useContext(CompanyContext);
};
