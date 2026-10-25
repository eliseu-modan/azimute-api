import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pickFields } from './input';

const fields: Record<string, string[]> = {
  requirementSurvey: ['leadId','companyId','status','completedAt','notes','answers'],
  requirement: ['surveyId','projectId','name','description','category','type','priority','status','complexity','estimatedHours','phase','dependencies','notes','suggested','approvedAt'],
  project: ['proposalId','companyId','leadId','name','description','ownerId','value','dueAt','status'],
  task: ['projectId','requirementId','title','description','assigneeId','priority','status','dueAt','estimatedHours','actualHours'],
  followUp: ['leadId','companyId','createdById','type','status','scheduledAt','description','completedAt'],
  storedFile: ['leadId','surveyId','proposalId','projectId','requirementId','originalName','storageKey','mimeType','size'],
  notification: ['userId','title','message','readAt'],
  leadSource: ['name','active'],
  workspaceSettings: ['company'],
};
const searchable: Record<string, string[]> = {
  requirementSurvey: ['notes'], requirement: ['name','description','category'], project: ['name','description'], task: ['title','description'], followUp: ['description'], leadSource: ['name'],
};

@Injectable()
export class DomainService {
  constructor(private prisma: PrismaService) {}
  private delegate(model: string): any { return (this.prisma as any)[model]; }
  private async validateRelations(model: string, data: any, workspaceId: string) {
    const checks: Array<[string, string]> = model === 'requirementSurvey'
      ? [['leadId', 'lead'], ['companyId', 'company']]
      : model === 'requirement'
        ? [['surveyId', 'requirementSurvey'], ['projectId', 'project']]
        : model === 'project'
          ? [['companyId', 'company'], ['leadId', 'lead'], ['proposalId', 'proposal']]
          : model === 'task'
            ? [['projectId', 'project'], ['requirementId', 'requirement']]
            : model === 'followUp'
              ? [['leadId', 'lead'], ['companyId', 'company']]
              : model === 'storedFile'
                ? [['leadId', 'lead'], ['surveyId', 'requirementSurvey'], ['proposalId', 'proposal'], ['projectId', 'project'], ['requirementId', 'requirement']]
                : [];
    for (const [field, target] of checks) {
      if (data[field] && !(await this.delegate(target).findFirst({ where: { id: data[field], workspaceId } }))) {
        throw new NotFoundException(`${target} not found`);
      }
    }
  }
  async list(model: string, workspaceId: string, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const allowedSort = ['createdAt','updatedAt','name','title','status','scheduledAt','dueAt'];
    const sort = allowedSort.includes(query.sort) ? query.sort : 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const where: any = { workspaceId };
    if (query.status) where.status = query.status;
    if (query.search && searchable[model]?.length) where.OR = searchable[model].map((field) => ({ [field]: { contains: String(query.search), mode: 'insensitive' } }));
    const db = this.delegate(model);
    const [data, total] = await Promise.all([db.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { [sort]: order } }), db.count({ where })]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }
  async findOne(model: string, id: string, workspaceId: string) {
    const result = await this.delegate(model).findFirst({ where: { id, workspaceId }, ...(model === 'requirementSurvey' ? { include: { answers: true, problems: true, objectives: true, featureSelections: true, integrations: true, marketingRequirements: true, brandAssets: true, contentRequirements: true, securityRequirements: true, futureRequirements: true, successMetrics: true, budget: true } } : {}) });
    if (!result) throw new NotFoundException(`${model} not found`);
    return result;
  }
  async create(model: string, workspaceId: string, userId: string, input: any) {
    const data: any = pickFields(input, fields[model] ?? []);
    await this.validateRelations(model, data, workspaceId);
    if (model === 'requirementSurvey') {
      const answers = data.answers;
      delete data.answers;
      if (!(await this.prisma.lead.findFirst({ where: { id: data.leadId, workspaceId } }))) throw new NotFoundException('Lead not found');
      if (data.companyId && !(await this.prisma.company.findFirst({ where: { id: data.companyId, workspaceId } }))) throw new NotFoundException('Company not found');
      if (answers) data.answers = { create: answers };
    }
    if (model === 'project' && !(await this.prisma.company.findFirst({ where: { id: data.companyId, workspaceId } }))) throw new NotFoundException('Company not found');
    if (model === 'task' && !(await this.prisma.project.findFirst({ where: { id: data.projectId, workspaceId } }))) throw new NotFoundException('Project not found');
    if (model === 'followUp' && data.leadId && !(await this.prisma.lead.findFirst({ where: { id: data.leadId, workspaceId } }))) throw new NotFoundException('Lead not found');
    data.workspaceId = workspaceId;
    if (model === 'followUp') data.createdById = userId;
    if (model === 'storedFile') data.storageKey = data.storageKey || `pending/${Date.now()}`;
    const record = await this.delegate(model).create({ data });
    await this.writeAudit(workspaceId, userId, model, record.id, 'CREATE', null, record);
    return record;
  }
  async update(model: string, id: string, workspaceId: string, userId: string, input: any) {
    const before = await this.findOne(model, id, workspaceId);
    const data: any = pickFields(input, fields[model] ?? []);
    await this.validateRelations(model, data, workspaceId);
    let record: any;
    if (model === 'requirementSurvey' && data.answers) {
      const answers = data.answers;
      delete data.answers;
      record = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.requirementSurvey.update({ where: { id }, data });
        for (const answer of answers) await tx.surveyAnswer.upsert({ where: { surveyId_section_question: { surveyId: id, section: answer.section, question: answer.question } }, create: { surveyId: id, ...answer }, update: { answer: answer.answer } });
        return updated;
      });
    } else record = await this.delegate(model).update({ where: { id }, data });
    await this.writeAudit(workspaceId, userId, model, id, 'UPDATE', before, record);
    return record;
  }
  async remove(model: string, id: string, workspaceId: string, userId: string) {
    const before = await this.findOne(model, id, workspaceId);
    await this.delegate(model).delete({ where: { id } });
    await this.writeAudit(workspaceId, userId, model, id, 'DELETE', before, null);
    return { deleted: true };
  }
  async listTasks(workspaceId: string, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: any = { workspaceId };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    const [data, total] = await Promise.all([this.prisma.task.findMany({ where, skip: (page-1)*pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }), this.prisma.task.count({ where })]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } };
  }
  async getDiagnosis(surveyId: string, workspaceId: string) {
    await this.findOne('requirementSurvey', surveyId, workspaceId);
    return this.prisma.developerDiagnosis.findUnique({ where: { surveyId } });
  }
  async saveDiagnosis(surveyId: string, workspaceId: string, input: any) {
    await this.findOne('requirementSurvey', surveyId, workspaceId);
    return this.prisma.developerDiagnosis.upsert({ where: { surveyId }, create: { surveyId, diagnosis: String(input.diagnosis ?? ''), technicalNotes: input.technicalNotes, estimatedHours: input.estimatedHours }, update: { diagnosis: String(input.diagnosis ?? ''), technicalNotes: input.technicalNotes, estimatedHours: input.estimatedHours } });
  }
  async suggestRequirements(surveyId: string, workspaceId: string, userId: string) {
    const survey = await this.prisma.requirementSurvey.findFirst({ where: { id: surveyId, workspaceId }, include: { featureSelections: { where: { selected: true } } } });
    if (!survey) throw new NotFoundException('Survey not found');
    const rows = await Promise.all(survey.featureSelections.map((feature) => this.prisma.requirement.create({ data: { workspaceId, surveyId, name: feature.name, description: feature.description, type: 'FUNCTIONAL', status: 'BACKLOG', suggested: true } })));
    for (const row of rows) await this.writeAudit(workspaceId, userId, 'requirement', row.id, 'SUGGEST', null, row);
    return rows;
  }
  async approveSuggestions(surveyId: string, workspaceId: string) {
    const result = await this.prisma.requirement.updateMany({ where: { surveyId, workspaceId, suggested: true }, data: { suggested: false, approvedAt: new Date(), status: 'ANALYSIS' } });
    return { approved: result.count };
  }
  listNotifications(user: { sub: string; workspaceId: string }, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where = { workspaceId: user.workspaceId, userId: user.sub };
    return Promise.all([this.prisma.notification.findMany({ where, skip: (page-1)*pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }), this.prisma.notification.count({ where })]).then(([data,total]) => ({ data, meta: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } }));
  }
  roles() { return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: 'asc' } }); }
  rolePermissions(roleId: string) { return this.prisma.rolePermission.findMany({ where: { roleId }, include: { permission: true } }); }
  async readNotification(id: string, user: { sub: string; workspaceId: string }) {
    const row = await this.prisma.notification.findFirst({ where: { id, userId: user.sub, workspaceId: user.workspaceId } });
    if (!row) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  async updateUserRole(userId: string, workspaceId: string, roleKey: string) {
    if (!['ADMIN','USER'].includes(roleKey)) throw new NotFoundException('Role not found');
    const role = await this.prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.update({ where: { userId_workspaceId: { userId, workspaceId } }, data: { roleId: role.id }, include: { role: true } });
      await tx.user.update({ where: { id: userId }, data: { role: roleKey as any } });
      return membership;
    });
  }
  settings(workspaceId: string) { return this.prisma.workspaceSettings.findUnique({ where: { workspaceId } }); }
  updateSettings(workspaceId: string, company: any) { return this.prisma.workspaceSettings.upsert({ where: { workspaceId }, create: { workspaceId, company }, update: { company } }); }
  async reportLeads(workspaceId: string) { return this.prisma.lead.groupBy({ by: ['status'], where: { workspaceId }, _count: { _all: true } }); }
  async reportProposals(workspaceId: string) { return this.prisma.proposal.groupBy({ by: ['status'], where: { workspaceId }, _count: { _all: true }, _sum: { value: true } }); }
  async writeAudit(workspaceId: string, userId: string | null, entityType: string, entityId: string, action: string, before: any, after: any) {
    const redact = (value: any): any => {
      if (Array.isArray(value)) return value.map(redact);
      if (!value || typeof value !== 'object' || value instanceof Date) return value;
      return Object.fromEntries(Object.entries(value).filter(([key]) => !['password', 'email', 'phone', 'whatsapp', 'document', 'token', 'tokenHash'].includes(key)).map(([key, item]) => [key, redact(item)]));
    };
    await this.prisma.auditLog.create({ data: { workspaceId, userId, entityType, entityId, action, before: before ? redact(before) : undefined, after: after ? redact(after) : undefined } });
  }
}



