import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateContactDto {
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() whatsapp?: string;
}
