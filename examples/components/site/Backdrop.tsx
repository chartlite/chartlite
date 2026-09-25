/**
 * Fixed engineering-paper grid behind all content. Pure CSS: the grid lines are
 * theme tokens, so it follows the Paper/Night toggle. It fades out towards the
 * bottom of the viewport so long sections read as plain paper.
 */
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-paper">
      <div className="graph-paper absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_45%,transparent_100%)]" />
    </div>
  );
}
