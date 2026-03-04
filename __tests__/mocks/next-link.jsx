// ABOUTME: Mock for next/link used in component tests.
// ABOUTME: Renders a plain <a> element with href and children.

export default function MockLink({ href, children, ...props }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
