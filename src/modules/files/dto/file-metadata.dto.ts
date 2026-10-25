import { IsOptional, IsUUID } from 'class-validator';

export class FileMetadataDto {
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsUUID() surveyId?: string;
  @IsOptional() @IsUUID() proposalId?: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() requirementId?: string;
}
