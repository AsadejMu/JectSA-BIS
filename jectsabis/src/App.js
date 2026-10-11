
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RequestListPage from "./pages/RequestListPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import ApprovalRecordPage from "./pages/ApprovalRecordPage";
import UserProfilePage from "./pages/UserProfilePage";

const PAGES = {
  requests: RequestListPage,
  detail: RequestDetailPage,
  approvals: ApprovalRecordPage,
  users: UserProfilePage,
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("requests");
  const [user, setUser] = useState(null);

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={(userData) => {
          setUser(userData);
          setPage("requests");
          setLoggedIn(true);
        }}
      />
    );
  }

  const Page = PAGES[page] ?? RequestListPage;

  return (
    <Page
      user={user}
      onNavigate={setPage}
      onLogout={() => {
        setLoggedIn(false);
        setUser(null);
      }}
    />
  );
}