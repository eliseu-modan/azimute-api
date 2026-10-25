import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePipelineStageDto {
  @IsString() name!: string;
  @IsInt() @Min(0) order!: number;
  @IsOptional() @IsString() color?: string;
}
