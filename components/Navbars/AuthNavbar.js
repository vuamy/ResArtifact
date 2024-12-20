import React from "react";
import Link from "next/link";
import { useAuth } from "../../pages/api/handleAuthenticated"; // Import authenticated
// components

import PagesDropdown from "components/Dropdowns/PagesDropdown.js";

export default function DarkNavbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  
  return (<>
    <nav className="top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg">
      <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <i className="fas fa-database mr-2 text-white"></i>
          <Link
            href="/"
            className="text-white text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase">
            
            ResArtifact
            
          </Link>
          <button
            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <i className="text-white fas fa-bars"></i>
          </button>
        </div>
        <div
          className={
            "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
            (navbarOpen ? " block rounded shadow-lg" : " hidden")
          }
          id="example-navbar-warning"
        >
          <ul className="flex flex-col lg:flex-row list-none lg:ml-auto items-center">
            <li>
              <a
                className="lg:text-white lg:hover:text-blueGray-200 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                href="/artifact/home">
                View Collection
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </>);
}
