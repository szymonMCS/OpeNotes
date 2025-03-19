import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>Copyright Szymon Maciejewski ⓒ {year}</p>
    </footer>
  );
}

export default Footer;
