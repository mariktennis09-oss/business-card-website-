import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  findForProfile(profileId: string): Promise<Project[]> {
    return this.repository.findByProfileId(profileId);
  }
}
