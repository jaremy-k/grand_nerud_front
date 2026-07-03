"use client";

import useAuthContext from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      navigate("/deals", { replace: true });
    }
  }, [navigate, loading]);

  return null;
}
