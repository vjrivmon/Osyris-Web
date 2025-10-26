// Hooks existentes
export { useAuth } from './useAuth'
export { useToast } from './use-toast'
export { useIsMobile } from './use-mobile'
export { useAuthStatic } from './useAuthStatic'
export { useSectionContent } from './useSectionContent'

// Hooks nuevos para familia
export { useFamiliaData, useFamiliaStats, useHijosConDocumentosCriticos } from './useFamiliaData'
export {
  useDashboardData,
  useAlertasUrgentes,
  useActividadesPendientes,
  useQuickStats
} from './useDashboardData'

// Hook de calendario familiar
export { useCalendarioFamilia } from './useCalendarioFamilia'

// Hook de galería familiar
export { useGaleriaFamilia, useGaleriaStats } from './useGaleriaFamilia'

// Hook de documentos familiares
export { useDocumentosFamilia } from './useDocumentosFamilia'

// Hook de perfil familiar
export { usePerfilFamilia } from './usePerfilFamilia'

// Hooks de admin - educandos
export { useEducandos } from './useEducandos'
export { useVinculacion } from './useVinculacion'