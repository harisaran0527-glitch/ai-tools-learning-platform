import { Link } from "react-router-dom";
import { ArrowUpRight, Target, Layers, CheckCircle } from "lucide-react";
export default function PromptingPage() {
  return (
    <main className="academy-page prompting-intro">
      <span className="eyebrow">THE PROMPTING STUDIO</span>
      <h1>
        Better instructions.
        <br />
        <span>Better possibilities.</span>
      </h1>
      <p>
        Turn an idea into a complete prompt. Practice real scenarios, see what
        works, and refine every detail.
      </p>
      <Link className="btn-primary" to="/prompting/practice">
        Start Practice <ArrowUpRight size={18} />
      </Link>
      <div className="academy-cards">
        {[
          {
            Icon: Target,
            title: "Choose a challenge",
            text: "One scenario. One complete prompt.",
          },
          {
            Icon: Layers,
            title: "See the blueprint",
            text: "Eight components. Clear, specific feedback.",
          },
          {
            Icon: CheckCircle,
            title: "Refine & execute",
            text: "Reach 70 marks to preview your result.",
          },
        ].map(({ Icon, title, text }, i) => (
          <article className="academy-card" key={title}>
            <Icon size={24} />
            <span className="eyebrow">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <small>
        Practice scores stay separate from tool assessments and certificates.
      </small>
    </main>
  );
}
