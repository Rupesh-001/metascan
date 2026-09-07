import {
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export default function PrivacyScore({
  score,
}) {
  const level =
    score >= 70
      ? "High"
      : score >= 40
      ? "Medium"
      : "Low";

  return (
    <section className="privacy-score-card">
      <div className="privacy-score-header">
        {level === "High" ? (
          <ShieldAlert size={24} />
        ) : (
          <ShieldCheck size={24} />
        )}

        <div>
          <span>PRIVACY SCORE</span>

          <h2>
            {score}/100
          </h2>
        </div>
      </div>

      <div className="privacy-progress">
        <div
          className="privacy-progress-fill"
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      <p>
        Risk Level: <strong>{level}</strong>
      </p>
    </section>
  );
}