import type { Skill, SkillCategory } from '@/lib/api';
import { BlueprintFrame } from '../blueprint-frame';

/** Порядок групп задан здесь: в API категория — метка, а не сортировка. */
const CATEGORY_ORDER: SkillCategory[] = ['FRONTEND', 'BACKEND', 'AI', 'TOOLS'];

const CATEGORY_TITLE: Record<SkillCategory, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  AI: 'AI',
  TOOLS: 'Tools',
};

export function AboutSection({ description, skills }: { description: string; skills: Skill[] }) {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="grid h-full grid-cols-1 gap-8 overflow-y-auto lg:grid-cols-2 lg:gap-12 lg:overflow-hidden">
      <BlueprintFrame label="About" className="min-h-0">
        <p className="max-w-prose text-base leading-relaxed sm:text-lg">{description}</p>
      </BlueprintFrame>

      <BlueprintFrame label="Stack" note="Grouped by where it is used" className="min-h-0">
        <div className="flex h-full flex-col gap-6 lg:overflow-y-auto">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="label mb-3 flex items-center gap-3 !text-ink">
                {CATEGORY_TITLE[group.category]}
                <span className="h-px flex-1 bg-line" />
                <span className="text-graphite">{String(group.items.length).padStart(2, '0')}</span>
              </h2>

              <ul className="flex flex-wrap gap-x-2 gap-y-2">
                {group.items.map((skill) => (
                  <li key={skill.id} className="border border-line px-2.5 py-1 text-sm">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </BlueprintFrame>
    </div>
  );
}
