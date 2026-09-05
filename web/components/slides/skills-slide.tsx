import type { Skill, SkillCategory } from '@/lib/api';

/** Порядок групп фиксирован здесь: в API категория — это метка, а не сортировка. */
const CATEGORY_ORDER: SkillCategory[] = ['FRONTEND', 'BACKEND', 'AI', 'TOOLS'];

const CATEGORY_TITLE: Record<SkillCategory, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  AI: 'AI',
  TOOLS: 'Tools',
};

export function SkillsSlide({ skills }: { skills: Skill[] }) {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto h-full max-w-4xl">
      <p className="label mb-8">Skills</p>

      <div className="grid gap-8 sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.category} className="border-t border-line pt-5">
            <h2 className="label mb-4 !text-ink">{CATEGORY_TITLE[group.category]}</h2>
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {group.items.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full border border-line px-3 py-1 text-sm text-ink-dim"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
