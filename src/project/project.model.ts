import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project', { description: 'Проект из портфолио.' })
export class ProjectModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true, description: 'Ссылка на репозиторий с кодом.' })
  repoUrl!: string | null;

  @Field(() => String, { nullable: true, description: 'Ссылка на развёрнутый проект.' })
  liveUrl!: string | null;

  @Field(() => String, { nullable: true })
  description!: string | null;
}
