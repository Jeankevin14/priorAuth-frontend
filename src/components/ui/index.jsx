export const Icon = ({ children, tone = '' }) => <span className={`icon ${tone}`}>{children}</span>;
export const Badge = ({ children, type = 'neutral' }) => <span className={`badge ${type}`}>{children}</span>;
export const Card = ({ children, className = '' }) => <section className={`card ${className}`}>{children}</section>;
