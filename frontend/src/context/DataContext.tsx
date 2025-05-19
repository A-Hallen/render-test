import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
  loading: boolean;
  error: string | null;
  fetchData: (endpoint: string) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for demo purposes
  const mockApiData = {
    'financial-indicators': {
      liquidez: 16.8,
      solvencia: 18.5,
      morosidad: 3.2,
      rentabilidad: 1.7,
      eficiencia: 82.3,
    },
    'loan-portfolio': {
      total: 4850000,
      byType: {
        consumo: 3152500,
        microCredito: 1212500,
        vivienda: 485000,
      },
      byStatus: {
        vigente: 4694950,
        vencido: 155050,
      },
    },
    'deposits': {
      total: 7250000,
      byType: {
        ahorrosVista: 2537500,
        plazoFijo: 4712500,
      },
    },
    'members': {
      total: 12450,
      active: 10583,
      inactive: 1867,
      newThisMonth: 124,
    },
  };
  
  const fetchData = async (endpoint: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    return new Promise((resolve, reject) => {
      // Simulate API request
      setTimeout(() => {
        const data = mockApiData[endpoint as keyof typeof mockApiData];
        
        if (data) {
          setLoading(false);
          resolve(data);
        } else {
          setLoading(false);
          setError(`Error al obtener datos de ${endpoint}`);
          reject(new Error(`Endpoint ${endpoint} no encontrado`));
        }
      }, 800);
    });
  };
  
  return (
    <DataContext.Provider value={{ loading, error, fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};