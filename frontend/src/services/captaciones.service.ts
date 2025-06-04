import { CaptacionResponse } from 'shared';

const API_URL = '/api/captaciones';

export async function getCaptacionesVista(codigoOficina: string = 'CNS'): Promise<CaptacionResponse> {
  const url = `${API_URL}/vista?oficina=${encodeURIComponent(codigoOficina)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener captaciones a la vista');
  return await res.json();
}

export async function getCaptacionesPlazo(codigoOficina: string = 'CNS'): Promise<CaptacionResponse> {
  const url = `${API_URL}/plazo?oficina=${encodeURIComponent(codigoOficina)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener captaciones a plazo');
  return await res.json();
}
