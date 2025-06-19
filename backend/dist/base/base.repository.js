"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async obtenerTodos() {
        return this.model.findAll();
    }
    async obtenerPorId(id) {
        return this.model.findByPk(id);
    }
    async crear(data) {
        return this.model.create(data);
    }
    async actualizar(id, data) {
        const entity = await this.obtenerPorId(id);
        if (!entity) {
            return null;
        }
        return entity.update(data);
    }
    async eliminar(id) {
        const whereCondition = { id }; // Usamos WhereOptions para tipar correctamente
        const result = await this.model.destroy({ where: whereCondition });
        return result > 0;
    }
}
exports.BaseRepository = BaseRepository;
