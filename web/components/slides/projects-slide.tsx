import type { Project } from '@/lib/api';

export function ProjectsSlide({ projects }: { projects: Project[] }) {
  return (
    <div className="mx-auto h-full max-w-4xl">
      <p className="label mb-8">Projects</p>

      <ul>
        {projects.map((project) => (
          <li key={project.id} className="border-t border-line py-5 last:border-b">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="text-lg font-medium tracking-tight sm:text-xl">{project.name}</h2>

              <div className="flex shrink-0 gap-5">
                {/* Две ссылки, а не одна: «где код» и «где посмотреть» — разные факты. */}
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label !text-ink transition-opacity hover:opacity-60"
                  >
                    Live &#8599;
                  </a>
                ) : null}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label !text-ink transition-opacity hover:opacity-60"
                  >
                    Code &#8599;
                  </a>
                ) : null}
              </div>
            </div>

            {project.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">
                {project.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
