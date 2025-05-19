import { Model, ModelStatic, WhereOptions } from 'sequelize';

export abstract class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async obtenerTodos(): Promise<T[]> {
        return this.model.findAll();
    }

    async obtenerPorId(id: string): Promise<T | null> {
        return this.model.findByPk(id);
    }

    async crear(data: Partial<T>): Promise<T> {
        return this.model.create(data as any);
    }

    async actualizar(id: string, data: Partial<T>): Promise<T | null> {
        const entity = await this.obtenerPorId(id);
        if (!entity) {
            return null;
        }
        return entity.update(data as any);
    }

    async eliminar(id: string): Promise<boolean> {
        const whereCondition: WhereOptions = { id }; // Usamos WhereOptions para tipar correctamente
        const result = await this.model.destroy({ where: whereCondition });
        return result > 0;
    }
}