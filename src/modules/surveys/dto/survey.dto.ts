import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class SurveyAnswerDto { @IsString() section!: string; @IsString() question!: string; @IsOptional() @IsString() answer?: string; }
export class CreateSurveyDto { @IsString() leadId!: string; @IsOptional() @IsString() companyId?: string; @IsOptional() @IsString() notes?: string; @IsOptional() @IsArray() @ValidateNested({each:true}) @Type(() => SurveyAnswerDto) answers?: SurveyAnswerDto[]; }
export class UpdateSurveyDto { @IsOptional() @IsString() companyId?: string; @IsOptional() @IsString() notes?: string; @IsOptional() @IsArray() @ValidateNested({each:true}) @Type(() => SurveyAnswerDto) answers?: SurveyAnswerDto[]; }
export class DiagnosisDto { @IsString() diagnosis!: string; @IsOptional() @IsString() technicalNotes?: string; @IsOptional() estimatedHours?: number; }
