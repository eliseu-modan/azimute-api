import { IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LeadStatus } from '@prisma/client';
export class UpdateLeadDto {
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() contactId?: string | null;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() stageId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsInt() @Min(0) score?: number;
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) estimatedValue?: number | null;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() lastContactAt?: string;
  @IsOptional() @IsDateString() nextContactAt?: string;
}
