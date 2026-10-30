export const Loading = ({ label = 'Loading…' }) => (
  <div className="state" role="status">
    <span className="spinner" aria-hidden="true" />
    <p>{label}</p>
  </div>
);

export const ErrorBox = ({ children }) => (children ? <div className="alert alert-error" role="alert">{children}</div> : null);

export const Empty = ({ title, children }) => (
  <div className="state">
    <h2>{title}</h2>
    {children}
  </div>
);
