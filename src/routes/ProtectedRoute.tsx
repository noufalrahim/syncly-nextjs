"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setProject } from "@/redux/projectSlice";
import { setWorkspace } from "@/redux/workspaceSlice";
import { useReadData } from "../hooks/useReadData";
import { setUser } from "../redux/userSlice";
import { EUrl, type TProject, type TUser, type TWorkspace } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [workspaceId, setWorkspaceId] = useState<string | null | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      const w = localStorage.getItem("workspace");
      const p = localStorage.getItem("project");
      setToken(t);
      setWorkspaceId(w);
      setProjectId(p);
      if (!t) {
        router.replace(EUrl.SIGNIN);
      }
    }
  }, [router]);

  const { data, isLoading, isError } = useReadData<{
    success: boolean;
    data: TUser | null;
    message: string;
  }>("users", "/get-token");

  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    isError: workspaceError,
  } = useReadData<{
    success: boolean;
    data: TWorkspace | null;
    message: string;
  }>("workspaces", `/workspaces?id=${workspaceId}&type=id`);

  const {
    data: projectData,
    isLoading: projectLoading,
    isError: projectError,
  } = useReadData<{
    success: boolean;
    data: TProject | null;
    message: string;
  }>("projects", `/projects?id=${projectId}&type=id`);

  useEffect(() => {
    if (data && data.success && data.data) {
      dispatch(setUser(data.data));
    }
    if (workspaceData && workspaceData.success && workspaceData.data) {
      dispatch(setWorkspace(workspaceData.data));
    }
    if (projectData && projectData.success && projectData.data) {
      dispatch(setProject(projectData.data));
    }
  }, [data, dispatch, workspaceData]);

  if (token === undefined || workspaceId === undefined || projectId === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    router.replace(EUrl.SIGNIN);
  }

  return <>{children}</>;
}
