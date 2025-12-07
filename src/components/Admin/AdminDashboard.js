import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";

import {
  Logout,
  Refresh,
  Search,
  Delete,
  Block,
  CheckCircle,
} from "@mui/icons-material";

import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  getIdTokenResult,
} from "firebase/auth";

import { auth, db } from "../../firebase";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { logAudit } from "../../lib/audit";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(true);

  const [tab, setTab] = useState(0);

  const [rows, setRows] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [search, setSearch] = useState("");

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditCursor, setAuditCursor] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const provider = useMemo(() => {
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: "select_account" });
    return p;
  }, []);

  const ensureUserProfile = async (u) => {
    try {
      const ref = doc(db, "Users", u.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            email: u.email || null,
            firstName: "",
            lastName: "",
            disabled: false,
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn("ensureUserProfile failed:", e?.message);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setBusy(true);

      try {
        if (u) {
          const token = await getIdTokenResult(u, true);
          const role = token?.claims?.role || null;
          const ok = role === "admin";
          setIsAdmin(ok);

          if (!ok) {
            // If not admin, redirect immediately
            window.location.href = "/profile";
            return;
          }

          // Only proceed if admin
          await ensureUserProfile(u);
          await loadUsersFirstPage();
          await logAudit("dashboard_view", { type: "admin_dashboard" });
        } else {
          setIsAdmin(false);
          setRows([]);
          setAuditLogs([]);
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Admin check error:", e);
        setIsAdmin(false);
        window.location.href = "/profile";
      } finally {
        setBusy(false);
      }
    });

    return () => unsub();
  }, []);
  const loadUsersFirstPage = async () => {
    setLoadingUsers(true);
    try {
      let qRef = query(
        collection(db, "Users"),
        orderBy("lastLogin", "desc"),
        limit(25)
      );

      const s = search.trim();
      if (s) {
        qRef = query(
          collection(db, "Users"),
          where("email", ">=", s),
          where("email", "<=", s + "\uf8ff"),
          limit(25)
        );
      }

      const snap = await getDocs(qRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), _snap: d }));

      setRows(list);
      setCursor(list.length ? list[list.length - 1]._snap : null);
    } catch (e) {
      console.error("Error loading users:", e);
      setToast({ open: true, msg: e.message, sev: "error" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUsersMore = async () => {
    if (!cursor) return;

    setLoadingUsers(true);
    try {
      const qRef = query(
        collection(db, "Users"),
        orderBy("lastLogin", "desc"),
        startAfter(cursor),
        limit(25)
      );

      const snap = await getDocs(qRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), _snap: d }));

      setRows((prev) => [...prev, ...list]);
      setCursor(list.length ? list[list.length - 1]._snap : null);
    } catch (e) {
      console.error("Error loading more users:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAudit = async (more = false) => {
    setLoadingAudit(true);

    try {
      let qRef = query(
        collection(db, "auditLogs"),
        orderBy("ts", "desc"),
        limit(25)
      );

      if (more && auditCursor) {
        qRef = query(
          collection(db, "auditLogs"),
          orderBy("ts", "desc"),
          startAfter(auditCursor),
          limit(25)
        );
      }

      const snap = await getDocs(qRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), _snap: d }));

      setAuditLogs((prev) => (more ? [...prev, ...list] : list));
      setAuditCursor(list.length ? list[list.length - 1]._snap : null);
    } catch (e) {
      console.error("Error loading audit logs:", e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (isAdmin && tab === 1 && auditLogs.length === 0) {
      loadAudit(false);
    }
  }, [tab, isAdmin, auditLogs.length]);

  const setUserDisabled = async (uid, disabled) => {
    try {
      await updateDoc(doc(db, "Users", uid), { disabled });

      setRows((prev) =>
        prev.map((r) => (r.id === uid ? { ...r, disabled } : r))
      );

      await logAudit(
        disabled ? "admin_disable_user" : "admin_enable_user",
        { type: "user", id: uid }
      );

      setToast({
        open: true,
        msg: disabled ? "User disabled" : "User enabled",
        sev: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: e.message, sev: "error" });
    }
  };

  const removeUserProfile = async (uid, email) => {
    if (!window.confirm(`Remove profile for ${email}?`)) return;

    try {
      await deleteDoc(doc(db, "Users", uid));

      setRows((prev) => prev.filter((r) => r.id !== uid));

      await logAudit("admin_remove_profile", { type: "user", id: uid });

      setToast({ open: true, msg: "Profile removed", sev: "success" });
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: e.message, sev: "error" });
    }
  };

  const signIn = async () => {
    await signInWithPopup(auth, provider);
    await logAudit("auth_sign_in_admin_google");
  };

  const signOutNow = async () => {
    await logAudit("auth_sign_out");
    await signOut(auth);
    window.location.reload();
  };

  // Double-check: If not admin, don't render anything
  if (!isAdmin && !busy) {
    return null; // Will be redirected by AdminRoute
  }

  if (busy) {
    return (
      <Box sx={{ p: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Final safety check - don't render if not admin
  if (!isAdmin) {
    return null;
  }

  if (!user) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Admin sign-in required
        </Typography>

        <Paper sx={{ p: 3, display: "inline-block" }}>
          <Typography sx={{ mb: 2 }}>Use Admin Google Account</Typography>
          <Button variant="contained" onClick={signIn}>
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!isAdmin) {
    // Immediately redirect non-admins - don't show any UI
    if (typeof window !== 'undefined') {
      window.location.href = "/profile";
    }
    return null;
  }

  return (
    <Box>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={user?.email} variant="outlined" />
            <Tooltip title="Sign out">
              <IconButton onClick={signOutNow}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="USERS" />
        <Tab label="AUDIT LOGS" />
      </Tabs>

      {/* USERS TAB */}
      {tab === 0 && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsersFirstPage()}
            />

            <Tooltip title="Search">
              <IconButton onClick={loadUsersFirstPage}>
                <Search />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reload">
              <IconButton onClick={loadUsersFirstPage}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>First</TableCell>
                  <TableCell>Last</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Disabled</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.firstName || "—"}</TableCell>
                    <TableCell>{r.lastName || "—"}</TableCell>
                    <TableCell>
                      {r.lastLogin?.toDate?.().toLocaleString?.() || "—"}
                    </TableCell>
                    <TableCell>{r.disabled ? "Yes" : "No"}</TableCell>
                    <TableCell>{r.id}</TableCell>

                    <TableCell align="right">
                      {r.disabled ? (
                        <Tooltip title="Enable">
                          <IconButton onClick={() => setUserDisabled(r.id, false)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Disable">
                          <IconButton onClick={() => setUserDisabled(r.id, true)}>
                            <Block />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Remove Profile">
                        <IconButton
                          color="error"
                          onClick={() => removeUserProfile(r.id, r.email)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {loadingUsers && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <CircularProgress size={20} />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Chip
              label={cursor ? "Load more" : "End"}
              onClick={cursor ? loadUsersMore : undefined}
              clickable={!!cursor}
            />
          </Box>
        </Box>
      )}

      {/* AUDIT LOGS TAB */}
      {tab === 1 && (
        <Box sx={{ p: 3 }}>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Target</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    {/* Timestamp */}
                    <TableCell>
                      {log.ts?.toDate?.().toLocaleString?.() || "—"}
                    </TableCell>

                    {/* Action */}
                    <TableCell>{log.action}</TableCell>

                    {/* User email */}
                    <TableCell>{log.actor?.email || "—"}</TableCell>

                    {/* Role */}
                    <TableCell>{log.actor?.role || "user"}</TableCell>

                    {/* Target (fixed) */}
                    <TableCell>
                      {log.target
                        ? log.target.id
                          ? `${log.target.type} → ${log.target.id}`
                          : log.target.type
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}

                {loadingAudit && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <CircularProgress size={20} />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Chip
              label={auditCursor ? "Load more" : "End"}
              onClick={auditCursor ? () => loadAudit(true) : undefined}
              clickable={!!auditCursor}
            />
          </Box>
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.sev} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
