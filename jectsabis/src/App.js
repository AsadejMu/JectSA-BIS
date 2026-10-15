
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RequestListPage from "./pages/RequestListPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import ApprovalRecordPage from "./pages/ApprovalRecordPage";
import UserProfilePage from "./pages/UserProfilePage";
import RequestFormPage from "./pages/RequestFormPage";
import {
  createRequest,
  getRequests,
  updateRequestStatus,
} from "./services/requestService";
import { getSession, login, logout } from "./services/authService";

const PAGE_COMPONENTS = {
  requests: RequestListPage,
  detail: RequestDetailPage,
  approvals: ApprovalRecordPage,
  users: UserProfilePage,
  newRequest: RequestFormPage,
};

const PAGE_ROLES = {
  requests: ["HR Administrator", "HR Manager", "Approver", "Requester"],
  detail: ["HR Administrator", "HR Manager", "Approver", "Requester"],
  approvals: ["HR Administrator", "HR Manager", "Approver"],
  users: ["HR Administrator"],
  newRequest: ["HR Administrator", "HR Manager", "Requester"],
};

const getHomePage = (user) => {
  if (user?.role === "Approver") return "approvals";
  if (user?.role === "Requester") return "requests";
  return "requests";
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // จำหน้าก่อนเข้า Detail
  const [detailReturnPage, setDetailReturnPage] = useState("requests");

  const [loginError, setLoginError] = useState("");


useEffect(() => {
  async function loadUser() {
    try {
      const currentUser = await getSession();

      if (currentUser) {
        setUser(currentUser);
        setPage(getHomePage(currentUser));
      }
    } catch (error) {
      console.error("โหลด session ไม่สำเร็จ:", error);
    } finally {
      setAuthLoading(false);
    }
  }

  loadUser();
}, []);


  useEffect(() => {
    if (!user) return;

    async function loadRequests() {
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (error) {
        console.error("โหลดคำขอไม่สำเร็จ:", error);
      }
    }

    loadRequests();
  }, [user]);

  const allowed = (target, currentUser = user) =>
    Boolean(currentUser && PAGE_ROLES[target]?.includes(currentUser.role));

  const navigate = (target) => {
    if (allowed(target)) {
      setPage(target);
    } else {
      setPage("requests");
    }
  };

  
const handleLogin = async (email, password) => {
  const result = await login(email, password);

  if (!result.ok) {
    setLoginError(result.message);
    return;
  }

  setLoginError("");
  setUser(result.user);
  setPage(getHomePage(result.user));
};

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setPage("requests");
    setSelectedRequestId(null);
    setDetailReturnPage("requests");
  };

  const addRequest = async (data) => {
    try {
      const created = await createRequest({
        ...data,
        requester: user?.name || user?.email,
        requesterEmail: user?.email,
      });

      const updatedRequests = await getRequests();
      setRequests(updatedRequests);
      setSelectedRequestId(created.id);
      setPage("requests");
    } catch (error) {
      console.error("สร้างคำขอไม่สำเร็จ:", error);
      alert("บันทึกคำขอไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const decideRequest = async (id, status, note) => {
    if (
      !["HR Administrator", "HR Manager", "Approver"].includes(user?.role)
    ) {
      return;
    }

    try {
      await updateRequestStatus(
        id,
        status,
        note,
        user?.name || user?.email
      );

      const updatedRequests = await getRequests();
      setRequests(updatedRequests);
    } catch (error) {
      console.error("เปลี่ยนสถานะไม่สำเร็จ:", error);
      alert("เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const openDetail = (id) => {
    const request = requests.find((item) => item.id === id);

    if (!request) return;

    if (
      user?.role === "Requester" &&
      request.requesterEmail !== user.email
    ) {
      return;
    }

    // จำหน้าที่กำลังเปิดอยู่ก่อนเข้า Detail
    setDetailReturnPage(page);

    setSelectedRequestId(id);
    setPage("detail");
  };

  if (authLoading) {
    return <div>กำลังโหลด...</div>;
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        errorMessage={loginError}
      />
    );
  }

  const currentPage = allowed(page) ? page : "requests";
  const Page = PAGE_COMPONENTS[currentPage] || RequestListPage;

  const visibleRequests =
    user.role === "Requester"
      ? requests.filter(
          (r) =>
            r.requesterEmail === user.email ||
            r.requester === user.name
        )
      : requests;

  const selectedRequest =
    visibleRequests.find((item) => item.id === selectedRequestId) || null;

  return (
    <Page
      user={user}
      requests={visibleRequests}
      request={selectedRequest}
      backPage={detailReturnPage}
      onNavigate={navigate}
      onOpenRequest={openDetail}
      onCreateRequest={addRequest}
      onDecideRequest={decideRequest}
      onLogout={handleLogout}
    />
  );
}
