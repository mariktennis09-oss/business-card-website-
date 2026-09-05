import type { ProfileLink } from '@/lib/api';
import { BlueprintFrame } from '../blueprint-frame';

export function ContactSection({ links }: { links: ProfileLink[] }) {
  return (
    <div className="flex h-full items-center">
      <BlueprintFrame
        label="Connect"
        note="Data on this page comes from a GraphQL API of my own"
        className="w-full max-w-3xl"
      >
        <ul>
          {links.map((link, index) => (
            <li key={link.id} className="border-t border-line first:border-t-0">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 first:pt-0"
              >
                <span className="flex items-baseline gap-4">
                  <span className="label">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-2xl font-medium tracking-tight transition-colors group-hover:text-blueprint sm:text-3xl">
                    {link.label}
                  </span>
                </span>

                <span className="label transition-colors group-hover:!text-blueprint">
                  {link.url.replace(/^https?:\/\//, '')} &#8599;
                </span>
              </a>
            </li>
          ))}
        </ul>
      </BlueprintFrame>
    </div>
  );
}
