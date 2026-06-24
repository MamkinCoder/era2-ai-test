import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router";
import { Layout } from "@/widgets/layout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingTour } from "@/features/onboarding";
import { CopyToastProvider } from "@/features/copy-toast";
import { DailyCheckIn } from "@/features/promo";
import { CornerPromo } from "@/features/promo";
import { QueueDebugPanel } from "@/components/workspace/queue-debug/QueueDebugPanel";
import { QUEUE_DEBUG } from "@/entities/generation/model/queue-types";
import { GenerationQueueStatusBar } from "@/features/generation-queue";

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
      <GenerationQueueStatusBar mode="global" skipRoutes={["/"]} />
      <GenerationQueueStatusBar mode="mobile" />
      {QUEUE_DEBUG && <QueueDebugPanel />}
    </AppProviders>
  );
}
