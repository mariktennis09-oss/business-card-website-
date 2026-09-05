import type { Experience, Project } from '@/lib/api';
import { BlueprintFrame, DimensionLine } from '../blueprint-frame';

export function WorkSection({
  experience,
  projects,
}: {
  experience: Experience[];
  projects: Project[];
}) {
  return (
    <div className="grid h-full grid-cols-1 gap-8 overflow-y-auto lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:overflow-hidden">
      <BlueprintFrame label="Experience" className="min-h-0">
        <div className="flex h-full flex-col gap-8 lg:overflow-y-auto">
          {experience.map((item) => (
            <article key={item.id}>
              <header className="mb-3">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{item.company}</h2>
                <p className="label mt-1">{item.position}</p>
              </header>

              {/* Период показан размерной линией — как протяжённость на чертеже. */}
              <DimensionLine>
                {item.period} · {item.durationMonths} mo
              </DimensionLine>

              <ul className="mt-4 space-y-2">
                {item.achievements.map((achievement) => (
                  <li key={achievement.id} className="flex gap-3 text-sm leading-relaxed">
                    <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-blueprint" />
                    <span>{achievement.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </BlueprintFrame>

      <BlueprintFrame label="Projects" note="Repo or live link on every entry" className="min-h-0">
        <ul className="flex h-full flex-col lg:overflow-y-auto">
          {projects.map((project, index) => (
            <li key={project.id} className="border-t border-line py-4 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="flex items-baseline gap-3 text-base font-medium tracking-tight sm:text-lg">
                  <span className="label">{String(index + 1).padStart(2, '0')}</span>
                  {project.name}
                </h2>

                <div className="flex shrink-0 gap-4">
                  {/* Две ссылки, а не одна: «где посмотреть» и «где код». */}
                  {project.liveUrl ? (
                    <ExternalLink href={project.liveUrl}>Live</ExternalLink>
                  ) : null}
                  {project.repoUrl ? (
                    <ExternalLink href={project.repoUrl}>Code</ExternalLink>
                  ) : null}
                </div>
              </div>

              {project.description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                  {project.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </BlueprintFrame>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="label !text-blueprint underline-offset-4 hover:underline"
    >
      {children} &#8599;
    </a>
  );
}
