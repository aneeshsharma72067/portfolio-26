/**
 * Reusable section heading — a green eyebrow label above a bold serif-framed
 * title, per the Stdout house style. Keeps every section visually consistent.
 */
type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
};

const SectionHeading = ({ eyebrow, title, accent }: Props) => (
  <div className="mb-10">
    <p className="eyebrow mb-3">{eyebrow}</p>
    <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
      {title} {accent && <span className="text-primary">{accent}</span>}
    </h2>
  </div>
);

export default SectionHeading;
