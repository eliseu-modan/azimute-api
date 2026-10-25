import { IsIn } from 'class-validator';
export class UpdateUserRoleDto { @IsIn(['ADMIN','USER']) role!: string; }
