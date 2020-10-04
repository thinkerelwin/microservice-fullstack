import React from "react";
import Link from "next/link";

function Header({ currentUser }) {
  const linksInfo = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((linkParams) => linkParams)
    .map(({ label, href }) => {
      return (
        <li className="nav-item" key={href}>
          <Link href={href}>
            <a className="nav-link">{label} </a>
          </Link>
        </li>
      );
    });
  return (
    <div className="navbar nabbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{linksInfo}</ul>
      </div>
    </div>
  );
}

export default Header;
