import { Request, Response } from 'express';
import { OficinaService } from './oficinas.service';

class OficinasController {
    private oficinaService: OficinaService;

    constructor() {
        this.oficinaService = new OficinaService();
    }

    async obtenerOficinas(req: Request, res: Response): Promise<void> {
        try {
            const oficinas = await this.oficinaService.obtenerTodas();
            res.json(oficinas);
        } catch (error) {
            console.error('Error al obtener las oficinas', error);
            res.status(500).json({ error: 'Error al obtener las oficinas' });
        }
    }
}

export { OficinasController };
