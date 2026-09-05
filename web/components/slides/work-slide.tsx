import type { Experience } from '@/lib/api';

/**
 * Период и признак «работаю сейчас» приходят из API уже посчитанными:
 * фронт их не выводит из дат и не форматирует заново.
 */
export function WorkSlide({ experience }: { experience: Experience[] }) {
  return (
    <div className="mx-auto h-full max-w-5xl">
      <p className="label mb-8">Work</p>

      <div className="grid gap-10 sm:grid-cols-2">
        {experience.map((item) => (
          <article key={item.id} className="border-t border-line pt-5">
            <header className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{item.company}</h2>
              <p className="mt-1 text-sm text-ink-dim">{item.position}</p>
              <p className="label mt-2">
                {item.period} · {item.durationMonths} mo
                {item.isCurrent ? ' · now' : ''}
              </p>
            </header>

            <ul className="space-y-2.5">
              {item.achievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className="border-l border-line pl-4 text-sm leading-relaxed text-ink-dim"
                >
                  {achievement.text}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
