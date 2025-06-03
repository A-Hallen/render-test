// Defines a simple, lightweight service for searching static page data.

export interface SearchablePageItem {
  id: string;
  title: string;
  description?: string;
  route: string;
  keywords?: string[];
}

// Static list of searchable pages, derived from App.tsx routes
const searchablePages: SearchablePageItem[] = [
  {
    id: 'page-dashboard',
    title: 'Dashboard',
    description: 'Panel principal de control',
    route: '/',
    keywords: ['dashboard', 'panel', 'principal', 'inicio']
  },
  {
    id: 'page-analysis',
    title: 'Análisis',
    description: 'Herramientas de análisis de datos',
    route: '/analysis',
    keywords: ['analisis', 'datos', 'estadisticas']
  },
  {
    id: 'page-ai-chat',
    title: 'Asistente IA',
    description: 'Chat con asistente de inteligencia artificial',
    route: '/ai-chat',
    keywords: ['asistente', 'ia', 'chat', 'inteligencia', 'artificial']
  },
  {
    id: 'page-reports',
    title: 'Reportes',
    description: 'Visualización de reportes generados',
    route: '/reports',
    keywords: ['reportes', 'informes']
  },
  {
    id: 'page-loans',
    title: 'Préstamos',
    description: 'Gestión y análisis de préstamos',
    route: '/loans',
    keywords: ['prestamos', 'creditos']
  },
  {
    id: 'page-members',
    title: 'Socios',
    description: 'Gestión y análisis de socios',
    route: '/members',
    keywords: ['socios', 'miembros', 'clientes']
  },
  {
    id: 'page-deposits',
    title: 'Depósitos',
    description: 'Gestión y análisis de depósitos',
    route: '/deposits',
    keywords: ['depositos', 'ahorros']
  },
  {
    id: 'page-visualizacion-3d',
    title: 'Visualización 3D',
    description: 'Visualización de datos en 3D',
    route: '/visualizacion-3d',
    keywords: ['visualizacion', '3d', 'grafico']
  },
  {
    id: 'page-sincronizacion',
    title: 'Sincronización',
    description: 'Sincronización de datos con sistemas externos',
    route: '/sincronizacion',
    keywords: ['sincronizacion', 'datos', 'sistemas', 'externos']
  },
  {
    id: 'page-indicadores-contables',
    title: 'Indicadores Contables',
    description: 'Métricas y análisis contables',
    route: '/indicadores-contables',
    keywords: ['indicadores', 'contables', 'metricas', 'analisis']
  },
  {
    id: 'page-profile',
    title: 'Perfil de Usuario',
    description: 'Ajustes de perfil de usuario',
    route: '/profile',
    keywords: ['configuracion', 'perfil', 'usuario', 'ajustes', 'settings']
  },
  {
    id: 'page-settings',
    title: 'Configuración General',
    description: 'Ajustes generales del sistema',
    route: '/settings',
    keywords: ['configuracion', 'general', 'sistema', 'ajustes', 'settings']
  }
];

class PageSearchService {
  private pages: SearchablePageItem[] = searchablePages;

  public search(query: string): SearchablePageItem[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    return this.pages.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = page.description?.toLowerCase().includes(normalizedQuery);
      const keywordMatch = page.keywords?.some(keyword => keyword.toLowerCase().includes(normalizedQuery));
      
      return titleMatch || descriptionMatch || keywordMatch;
    });
  }

  public getAllPages(): SearchablePageItem[] {
    return [...this.pages];
  }
}

export const pageSearchService = new PageSearchService();
