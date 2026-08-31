import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('ProfileLink', {
  description: 'Ссылка на внешний профессиональный ресурс.',
})
export class ProfileLinkModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Подпись ссылки: GitHub, Портфолио и т. д.' })
  label!: string;

  @Field()
  url!: string;
}

/**
 * Корень схемы. Вложенные коллекции (skills / experience / projects / links)
 * объявлены как @ResolveField в резолвере: их не тянут вместе с профилем,
 * а грузят только когда клиент их запросил.
 */
@ObjectType('Profile', { description: 'Профиль специалиста.' })
export class ProfileModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Постоянный ключ визитки.' })
  slug!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;
}
