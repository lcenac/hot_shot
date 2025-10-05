// MainPage.js
import { Outlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function MainPage() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">hot_shot</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <a className="nav-link" href="/wnba">WNBA</a>
              <a className="nav-link" href="/nba">NBA</a>
            </div>
          </div>
        </div>
      </nav>

      {/* This is where nested routes render */}
      <Outlet />
    </>
  );
}

export default MainPage;
