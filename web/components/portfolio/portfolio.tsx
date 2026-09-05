'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/api';
import { DEFAULT_SECTION, SECTIONS, sectionIndex, type SectionId } from '@/lib/sections';
import { CustomCursor } from '../cursor/custom-cursor';
import { ParticleCanvas } from '../particles/particle-canvas';
import { usePointerNdc } from '@/lib/use-pointer-ndc';
import { AboutSection } from './sections/about-section';
import { ContactSection } from './sections/contact-section';
import { IndexSection } from './sections/index-section';
import { WorkSection } from './sections/work-section';

/**
 * Каркас страницы: фон, шапка, раздел, подвал.
 *
 * Раздел пока переключается обычным состоянием и без анимации — хеш-роутинг
 * и оркестрованные переходы приходят следующим шагом. Содержимое разделов
 * от этого не зависит: они получают данные пропсами и ничего не знают
 * о том, как их показывают.
 */
export function Portfolio({ profile }: { profile: Profile }) {
  const [active, setActive] = useState<SectionId>(DEFAULT_SECTION);
  const pointer = usePointerNdc();

  return (
    <div className="blueprint-grid relative flex h-dvh flex-col">
      <CustomCursor />

      {/* Canvas — фон и только фон: весь текст живёт в DOM и читается без WebGL. */}
      <ParticleCanvas className="fixed inset-0 -z-10" textureSize={512} pointer={pointer} />

      <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => setActive(DEFAULT_SECTION)}
          className="label !text-ink transition-colors hover:!text-blueprint"
        >
          Mark / Omelchenko
        </button>

        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              aria-current={section.id === active ? 'page' : undefined}
              className={`label transition-colors hover:!text-blueprint ${
                section.id === active ? '!text-ink' : ''
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="min-h-0 flex-1 px-5 pb-4 sm:px-8">
        <Section active={active} profile={profile} />
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-8 gap-y-1 px-5 py-4 sm:px-8">
        <span className="label">Kaliningrad · 54°42′N 20°27′E</span>
        <span className="label">Scale 1:1</span>
        <span className="label">
          Sheet {String(sectionIndex(active) + 1).padStart(2, '0')} /{' '}
          {String(SECTIONS.length).padStart(2, '0')}
        </span>
      </footer>
    </div>
  );
}

function Section({ active, profile }: { active: SectionId; profile: Profile }) {
  switch (active) {
    case 'work':
      return <WorkSection experience={profile.experience} projects={profile.projects} />;
    case 'about':
      return <AboutSection description={profile.description} skills={profile.skills} />;
    case 'contact':
      return <ContactSection links={profile.links} />;
    case 'index':
    default:
      return <IndexSection name={profile.name} experience={profile.experience} />;
  }
}
