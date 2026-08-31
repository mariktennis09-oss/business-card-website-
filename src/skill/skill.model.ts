import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '@prisma/client';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Группа, к которой относится навык.',
});

@ObjectType('Skill', { description: 'Навык из профиля.' })
export class SkillModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Название навыка.' })
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;
}
