import { Portfolio } from '@/components/portfolio/portfolio';
import { fetchProfile } from '@/lib/api';

/**
 * Серверный компонент: данные запрашиваются здесь и уходят в клиентскую
 * оболочку пропсами. Ничего из содержимого визитки не захардкожено —
 * всё приходит из GraphQL.
 */
export default async function HomePage() {
  const profile = await fetchProfile();

  return <Portfolio profile={profile} />;
}
