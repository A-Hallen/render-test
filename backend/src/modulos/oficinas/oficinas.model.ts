import { Model } from "sequelize";

export class Oficina extends Model {
    nombre!: string;
    codigo!: string;
}