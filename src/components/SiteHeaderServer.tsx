import { getCurrentUser } from '@/lib/auth';
import { SiteHeader } from '@/components/SiteHeader';

export async function SiteHeaderServer() {
  const user = await getCurrentUser();
  return <SiteHeader user={user} />;
}
