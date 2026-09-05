import { Deck } from '@/components/deck';
import { ConnectSlide } from '@/components/slides/connect-slide';
import { IntroSlide } from '@/components/slides/intro-slide';
import { ProjectsSlide } from '@/components/slides/projects-slide';
import { SkillsSlide } from '@/components/slides/skills-slide';
import { WorkSlide } from '@/components/slides/work-slide';
import { fetchProfile } from '@/lib/api';

const SECTIONS = ['Intro', 'Work', 'Projects', 'Skills', 'Connect'];

/**
 * Серверный компонент: данные запрашиваются здесь, слайды рендерятся здесь же
 * и уезжают в клиентский Deck готовой разметкой. Порядок слайдов обязан
 * совпадать с SECTIONS — по нему построено меню.
 */
export default async function HomePage() {
  const profile = await fetchProfile();

  return (
    <Deck sections={SECTIONS}>
      <IntroSlide profile={profile} />
      <WorkSlide experience={profile.experience} />
      <ProjectsSlide projects={profile.projects} />
      <SkillsSlide skills={profile.skills} />
      <ConnectSlide links={profile.links} />
    </Deck>
  );
}
