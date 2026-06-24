import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { QueueDebugPanel } from "@/components/workspace/queue-debug/QueueDebugPanel";
import { QUEUE_DEBUG } from "@/entities/generation-task";
import { CopyToastProvider } from "@/features/copy-toast";
import { GenerationQueueStatusBar } from "@/features/generation-queue";
import { OnboardingTour } from "@/features/onboarding";
import { CornerPromo, DailyCheckIn } from "@/features/promo";
import { Layout } from "@/widgets/layout";

export default function App() {
  return (
    <AppProviders>
      <Layout>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Layout>
      <OnboardingTour />
      <CopyToastProvider />
      <DailyCheckIn />
      <CornerPromo />
      <GenerationQueueStatusBar mode="global" skipRoutes={["/", "/queue"]} />
      <GenerationQueueStatusBar mode="mobile" skipRoutes={["/queue"]} />
      {QUEUE_DEBUG && <QueueDebugPanel />}
    </AppProviders>
  );
}
