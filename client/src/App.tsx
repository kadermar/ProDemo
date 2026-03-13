import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatPage from "@/pages/chat";
import LogsPage from "@/pages/logs";
import DashboardPage from "@/pages/dashboard";
import SignalsPage from "@/pages/signals";
import StageActivityPage from "@/pages/stage-activity";
import FieldExperiencePage from "@/pages/field-experience";
import JobDetailPage from "@/pages/job-detail";
import WorkOrderDetailPage from "@/pages/work-order-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/signals" component={SignalsPage} />
      <Route path="/stage-activity" component={StageActivityPage} />
      <Route path="/field-experience" component={FieldExperiencePage} />
      <Route path="/job/:id" component={JobDetailPage} />
      <Route path="/work-order/:id" component={WorkOrderDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
