import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AdminOperations from "@/pages/AdminOperations";
import Home from "@/pages/Home";
import MemberPortal from "@/pages/MemberPortal";
import Governance from "@/pages/Governance";
import Trust from "@/pages/Trust";
import NotFound from "@/pages/NotFound";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Transparency from "@/pages/Transparency";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/programs/:slug">{params => <ProgramDetail slug={params.slug} />}</Route><Route path="/programs" component={Programs} /><Route path="/transparency" component={Transparency} /><Route path="/trust" component={Trust} /><Route path="/member" component={MemberPortal} /><Route path="/governance" component={Governance} /><Route path="/admin" component={AdminOperations} /><Route component={NotFound} /></Switch>; }

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
