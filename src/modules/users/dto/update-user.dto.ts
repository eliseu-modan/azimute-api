import { IsEmail, IsIn, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RecordStatus } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsIn(['ADMIN','USER']) role?: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
}
