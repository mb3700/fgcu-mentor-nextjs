export function Footer() {
  return (
    <footer className="bg-fgcu-blue-dark text-white/60 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm font-medium text-white/80">
              Daveler &amp; Kauanui School of Entrepreneurship
            </p>
            <p className="text-xs mt-1">
              Florida Gulf Coast University &middot; Fort Myers, FL
            </p>
          </div>
          <div className="flex items-center space-x-6 text-xs">
            <a
              href="https://www.fgcu.edu/school-of-entrepreneurship/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fgcu-gold transition-colors"
            >
              FGCU Website
            </a>
            <a
              href="https://www.fgcu.edu/school-of-entrepreneurship/ife/runway-program"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fgcu-gold transition-colors"
            >
              Runway Program
            </a>
            <a
              href="https://www.fgcu.edu/school-of-entrepreneurship/ife/mentorship"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fgcu-gold transition-colors"
            >
              Mentorship
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
