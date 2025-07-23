import HomeComponent from '../home';

export default function BaseHome({ hideRecentActivity = false }: { hideRecentActivity?: boolean }) {
  return <HomeComponent hideRecentActivity={hideRecentActivity} />;
}
