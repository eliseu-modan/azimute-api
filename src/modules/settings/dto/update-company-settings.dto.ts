import { IsObject } from 'class-validator';
export class UpdateCompanySettingsDto { @IsObject() company!: Record<string, unknown>; }
