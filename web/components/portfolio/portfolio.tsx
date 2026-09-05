'use client';

import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Profile } from '@/lib/api';
import { TRANSITION } from '@/lib/animation-constants';
import { DEFAULT_SECTION, SECTIONS, sectionIndex, type SectionId } from '@/lib/sections';
import { usePointerNdc } from '@/lib/use-pointer-ndc';
import { useHashSection } from '@/lib/use-hash-section';
import { CustomCursor } from '../cursor/custom-cursor';
import { ParticleCanvas } from '../particles/particle-canvas';
import { AboutSection } from './sections/about-section';
import { ContactSection } from './sections/contact-section';
import { IndexSection } from './sections/index-section';
import { WorkSection } from './sections/work-section';

/**
 * Каркас страницы: фон, шапка, раздел, подвал.
 *
 * Раздел определяется адресом, а показывается через оркестрованный переход.
 * Частицы при смене раздела не перезапускаются — сцена живёт непрерывно,
 * меняется только контент поверх неё и параметры симуляции.
 */
export function Portfolio({ profile }: { profile: Profile }) {
  const { section: target, settled } = useHashSection();
  const [displayed, setDisplayed] = useState<SectionId>(DEFAULT_SECTION);

  const content = useRef<HTMLDivElement>(null);
  const pointer = usePointerNdc();

  /**
   * «Энергия» перехода: 0 в покое, 1 на пике. Живёт в ref, потому что её
   * читает кадровый цикл сцены — гнать это через состояние React значило бы
   * перерисовывать дерево на каждом кадре анимации.
   */
  const energy = useRef({ value: 0 });

  useEffect(() => {
    if (!settled || target === displayed) {
      return;
    }

    const element = content.current;
    if (!element) {
      setDisplayed(target);
      return;
    }

    const timeline = gsap.timeline();

    timeline
      // 1. Уход текущего контента.
      .to(element, {
        opacity: 0,
        y: -TRANSITION.exitShift,
        duration: TRANSITION.exit,
        ease: 'power2.in',
      })
      // 2. Всплеск в поле частиц — начинается на уходе, а не после него,
      //    иначе переход распадается на два отдельных события.
      .to(
        energy.current,
        { value: 1, duration: TRANSITION.energyRise, ease: 'power2.out' },
        `-=${TRANSITION.exit * 0.6}`,
      )
      // 3. Подмена содержимого. flushSync обязателен: React иначе отложил бы
      //    рендер за пределы этого тика, и кадр показал бы старый раздел
      //    уже проявляющимся.
      .add(() => flushSync(() => setDisplayed(target)))
      // 4. Приход нового.
      .fromTo(
        element,
        { opacity: 0, y: TRANSITION.enterShift },
        { opacity: 1, y: 0, duration: TRANSITION.enter, ease: 'power3.out' },
      )
      .to(energy.current, { value: 0, duration: TRANSITION.energyFall, ease: 'power2.inOut' }, '<');

    return () => {
      timeline.kill();
    };
  }, [target, displayed, settled]);

  return (
    <div className="blueprint-grid relative flex h-dvh flex-col">
      <CustomCursor />

      {/* Canvas — фон и только фон: весь текст живёт в DOM и читается без WebGL. */}
      <ParticleCanvas
        className="fixed inset-0 -z-10"
        textureSize={512}
        pointer={pointer}
        energy={energy}
      />

      <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 py-5 sm:px-8">
        <a href="#/" className="label !text-ink transition-colors hover:!text-blueprint">
          Mark / Omelchenko
        </a>

        {/* Меню — обычные ссылки: работает средняя кнопка, «назад» и прямой адрес. */}
        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={section.hash}
              aria-current={section.id === target ? 'page' : undefined}
              className={`label transition-colors hover:!text-blueprint ${
                section.id === target ? '!text-ink' : ''
              }`}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="min-h-0 flex-1 px-5 pb-4 sm:px-8">
        <div ref={content} className="h-full">
          <Section active={displayed} profile={profile} />
        </div>
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-8 gap-y-1 px-5 py-4 sm:px-8">
        <span className="label">Kaliningrad · 54°42′N 20°27′E</span>
        <span className="label">Scale 1:1</span>
        <span className="label">
          Sheet {String(sectionIndex(displayed) + 1).padStart(2, '0')} /{' '}
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
