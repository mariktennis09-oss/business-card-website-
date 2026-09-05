import type { Profile } from '@/lib/api';

export function IntroSlide({ profile }: { profile: Profile }) {
  const currentRole = profile.experience.find((item) => item.isCurrent);

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col justify-center gap-8">
      <div>
        <p className="label mb-4">Available: Yep</p>
        <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.95] font-semibold tracking-tight">
          {profile.name}
        </h1>
        {currentRole ? (
          <p className="mt-4 text-lg text-ink-dim sm:text-xl">
            {currentRole.position} — {currentRole.company}
          </p>
        ) : null}
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-ink-dim sm:text-lg">
        {profile.description}
      </p>

      <p className="label">Use arrow keys or the menu above</p>
    </div>
  );
}
