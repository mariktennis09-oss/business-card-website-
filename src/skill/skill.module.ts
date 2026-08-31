import { Module } from '@nestjs/common';
import { SkillRepository } from './skill.repository';
import { SkillService } from './skill.service';

@Module({
  providers: [SkillRepository, SkillService],
  exports: [SkillService],
})
export class SkillModule {}
