import type { Experience } from '@/lib/api';
import { BlueprintFrame } from '../blueprint-frame';

export function IndexSection({ name, experience }: { name: string; experience: Experience[] }) {
  const current = experience.find((item) => item.isCurrent);
  const [firstName, ...rest] = name.split(' ');

  return (
    <div className="flex h-full items-center">
      <div className="w-full max-w-3xl">
        <BlueprintFrame
          label={current ? current.position : 'Frontend Developer'}
          note="Available: Yep"
        >
          <h1 className="text-[clamp(2.75rem,9vw,6rem)] leading-[0.88] font-semibold tracking-[-0.03em]">
            {firstName}
            <br />
            {rest.join(' ')}
          </h1>
        </BlueprintFrame>

        {current ? (
          <p className="label mt-8 ml-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Currently</span>
            <span className="text-ink">{current.company}</span>
            <span className="inline-block h-px w-6 bg-graphite" />
            <span>{current.period}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
