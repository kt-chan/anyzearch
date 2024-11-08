import React from "react";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { FullScreenLoader } from "@/components/Preloader";
import { Navigate } from "react-router-dom";
import paths from "@/utils/paths";
import useQuery from "@/hooks/useQuery";
import {
  AUTH_TOKEN,
  AUTH_USER,
  AUTH_TIMESTAMP,
} from "../../utils/constants";

export default function Login() {
  const query = useQuery();
  //@DEBUG @SSO (C)KTCHAN
  if (query.get("sso") === 'adfs') {
    let user = JSON.parse(decodeURIComponent(query.get("user"))).user;
    let authtoken = JSON.parse(decodeURIComponent(query.get("user"))).token;

    window.localStorage.setItem(AUTH_USER, JSON.stringify(user));
    window.localStorage.setItem(AUTH_TOKEN, authtoken);
    window.location = paths.home();
  }
  else {
    const { loading, requiresAuth, mode } = usePasswordModal(!!query.get("nt"));
    if (loading) return <FullScreenLoader />;
    if (requiresAuth === false) return <Navigate to={paths.home()} />;

    return <PasswordModal mode={mode} />;
  }
}
