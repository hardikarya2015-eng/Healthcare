const Logo = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pill background */}
    <rect width="40" height="40" rx="12" fill="#0f766e" />
    {/* Horizontal bar of cross */}
    <rect x="8" y="17" width="24" height="6" rx="3" fill="white" />
    {/* Vertical bar of cross */}
    <rect x="17" y="8" width="6" height="24" rx="3" fill="white" />
  </svg>
);

export default Logo;
