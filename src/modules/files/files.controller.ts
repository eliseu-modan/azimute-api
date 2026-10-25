import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { FileMetadataDto } from './dto/file-metadata.dto';
const allowed = new Set(['.pdf','.jpg','.jpeg','.png','.docx','.xlsx','.zip']);
@Controller('files') @UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private prisma: PrismaService) {}
  @Post() @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: any, @Body() body: FileMetadataDto, @CurrentUser() user: AuthUser) {
    if (!file) throw new BadRequestException('file is required');
    const extension = extname(file.originalname).toLowerCase();
    if (!allowed.has(extension)) throw new BadRequestException('Unsupported file type');
    const bytes = file.buffer as Buffer;
    const valid = extension === '.pdf' ? bytes.subarray(0,5).toString() === '%PDF-' : extension === '.png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : ['.jpg','.jpeg'].includes(extension) ? bytes[0] === 0xff && bytes[1] === 0xd8 : bytes[0] === 0x50 && bytes[1] === 0x4b;
    if (!valid) throw new BadRequestException('File content does not match extension');
    const relations: Array<[keyof FileMetadataDto, string]> = [['leadId', 'lead'], ['surveyId', 'requirementSurvey'], ['proposalId', 'proposal'], ['projectId', 'project'], ['requirementId', 'requirement']];
    for (const [field, model] of relations) {
      const id = body[field];
      if (id && !(await (this.prisma as any)[model].findFirst({ where: { id, workspaceId: user.workspaceId } }))) throw new NotFoundException(`${model} not found`);
    }
    const key = `${randomUUID()}${extension}`, root = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    await mkdir(root, { recursive: true }); await writeFile(join(root, key), bytes, { flag: 'wx' });
    try { return await this.prisma.storedFile.create({ data: { workspaceId: user.workspaceId, storageKey: key, originalName: file.originalname, mimeType: file.mimetype, size: file.size, leadId: body.leadId || undefined, surveyId: body.surveyId || undefined, proposalId: body.proposalId || undefined, projectId: body.projectId || undefined, requirementId: body.requirementId || undefined }, select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true, leadId: true, surveyId: true, proposalId: true, projectId: true, requirementId: true } }); }
    catch (error) { await unlink(join(root, key)).catch(() => undefined); throw error; }
  }
  @Get() list(@CurrentUser() user: AuthUser) { return this.prisma.storedFile.findMany({ where: { workspaceId: user.workspaceId }, select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true, leadId: true, surveyId: true, proposalId: true, projectId: true, requirementId: true }, orderBy: { createdAt: 'desc' } }); }
  @Get(':id') async download(@Param('id') id: string, @CurrentUser() user: AuthUser, @Res() res: Response) {
    const file = await this.prisma.storedFile.findFirst({ where: { id, workspaceId: user.workspaceId } }); if (!file) throw new NotFoundException('File not found');
    const root = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'); const bytes = await readFile(join(root, file.storageKey));
    res.setHeader('Content-Type', file.mimeType); res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`); res.send(bytes);
  }
  @Delete(':id') async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const file = await this.prisma.storedFile.findFirst({ where: { id, workspaceId: user.workspaceId } }); if (!file) throw new NotFoundException('File not found');
    await this.prisma.storedFile.delete({ where: { id } }); const root = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'); await unlink(join(root, file.storageKey)).catch(() => undefined); return { deleted: true };
  }
}
