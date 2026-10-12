import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RequestListPage from "./pages/RequestListPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import ApprovalRecordPage from "./pages/ApprovalRecordPage";
import UserProfilePage from "./pages/UserProfilePage";
import RequestFormPage from "./pages/RequestFormPage";
import { createRequest, getRequests, updateRequestStatus } from "./services/requestService";
import { getSession, login, logout } from "./services/authService";

const PAGE_COMPONENTS = { requests: RequestListPage, detail: RequestDetailPage, approvals: ApprovalRecordPage, users: UserProfilePage, newRequest: RequestFormPage };
const PAGE_ROLES = {
  requests: ["HR Administrator", "HR Manager", "Approver", "Requester"],
  detail: ["HR Administrator", "HR Manager", "Approver", "Requester"],
  approvals: ["HR Administrator", "HR Manager", "Approver"],
  users: ["HR Administrator"],
  newRequest: ["HR Administrator", "HR Manager", "Requester"],
};

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [page, setPage] = useState("requests");
  const [requests, setRequests] = useState(() => getRequests());
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const refresh = () => setRequests(getRequests());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const allowed = (target, currentUser = user) => Boolean(currentUser && PAGE_ROLES[target]?.includes(currentUser.role));
  const navigate = (target) => {
    if (allowed(target)) setPage(target);
    else setPage("requests");
  };
  const handleLogin = (email, password) => {
    const result = login(email, password);
    if (!result.ok) { setLoginError(result.message); return; }
    setLoginError(""); setUser(result.user); setPage("requests");
  };
  const handleLogout = () => { logout(); setUser(null); setPage("requests"); setSelectedRequestId(null); };
  const openDetail = (id) => {
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    if (user?.role === "Requester" && request.requesterEmail !== user.email) return;
    setSelectedRequestId(id); setPage("detail");
  };
  const addRequest = (data) => {
    const created = createRequest({ ...data, requester: user?.name || user?.email, requesterEmail: user?.email });
    setRequests(getRequests()); setSelectedRequestId(created.id); setPage("requests");
  };
  const decideRequest = (id, status, note) => {
    if (!["HR Administrator", "HR Manager", "Approver"].includes(user?.role)) return;
    updateRequestStatus(id, status, note, user?.name || user?.email);
    setRequests(getRequests());
  };

  if (!user) return <LoginPage onLogin={handleLogin} errorMessage={loginError} />;
  const currentPage = allowed(page) ? page : "requests";
  const Page = PAGE_COMPONENTS[currentPage] || RequestListPage;
  const visibleRequests = user.role === "Requester" ? requests.filter((r) => r.requesterEmail === user.email || r.requester === user.name) : requests;
  const selectedRequest = visibleRequests.find((item) => item.id === selectedRequestId) || null;

  return <Page user={user} requests={visibleRequests} request={selectedRequest} onNavigate={navigate} onOpenRequest={openDetail} onCreateRequest={addRequest} onDecideRequest={decideRequest} onLogout={handleLogout} />;
}
