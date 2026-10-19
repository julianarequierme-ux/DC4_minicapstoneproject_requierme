const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      © {currentYear} TripEase · Travel booking system
    </footer>
  );
}
