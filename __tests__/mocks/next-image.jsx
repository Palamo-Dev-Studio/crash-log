// ABOUTME: Mock for next/image used in component tests.
// ABOUTME: Renders a plain <img> element with standard HTML attributes.

export default function MockImage({ src, alt, width, height, ...props }) {
  return <img src={src} alt={alt} width={width} height={height} {...props} />;
}
