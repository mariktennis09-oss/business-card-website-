import type { ProfileLink } from '@/lib/api';

export function ConnectSlide({ links }: { links: ProfileLink[] }) {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col justify-center">
      <p className="label mb-8">Connect</p>

      <ul>
        {links.map((link) => (
          <li key={link.id} className="border-t border-line last:border-b">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-6"
            >
              <span className="text-2xl font-medium tracking-tight transition-opacity group-hover:opacity-60 sm:text-3xl">
                {link.label}
              </span>
              <span className="label transition-opacity group-hover:opacity-60">
                {link.url.replace(/^https?:\/\//, '')} &#8599;
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="label mt-10">Built on a GraphQL API — data on this page comes from it</p>
    </div>
  );
}
