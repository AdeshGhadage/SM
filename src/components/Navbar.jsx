import React from "react";

function Navbar(page) {
  const home = page.page === "home" ? " active" : "";
  const about = page.page === "about" ? " active" : "";
  const gallery = page.page === "gallery" ? " active" : "";
  const team = page.page === "team" ? " active" : "";


  return (
    <>
      <nav class="navbar sticky-top shadow-sm navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
        <a href="" class="navbar-brand p-0">
          <h1 class="m-0">Samudramanthan</h1>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span class="fa fa-bars"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
          <div class="navbar-nav ml-auto py-0">
            <a href="/" class={"nav-item nav-link"+ home}>
              Home
            </a>
            <a href="/about" class={"nav-item nav-link" + about}>
              About
            </a>
            <a href="/gallery" class={"nav-item nav-link" + gallery}>
              Gallery
            </a>
            <a href="/team" class={"nav-item nav-link" + team}>
              Our Team
            </a>
          </div>
          <a
            href=""
            class="btn btn-primary-gradient rounded-pill py-2 px-4 ms-3 d-none d-lg-block"
          >
            Register
          </a>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
