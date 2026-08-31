import { Module } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';

@Module({
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
