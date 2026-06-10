import Link from "next/link";
import { PRICING_TIERS, TRIAL_COPY, requestHrefForTier } from "@/lib/pricing";
import { TRIAL_DAYS } from "@/lib/trial-constants";

export function PricingSection() {
  return (
    <section id="pricing" className="service-pricing">
      <div className="mic-container service-pricing__inner">
        <h2 className="service-section__title">Pricing</h2>
        <p className="service-section__sub">
          One-off lifetime fees. Every website is premium quality. Plans differ by scope and
          features only.
        </p>

        <div className="service-pricing__grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`pricing-tier${tier.featured ? " pricing-tier--featured" : ""}`}
            >
              {tier.badge && <span className="pricing-tier__badge">{tier.badge}</span>}
              <h3 className="pricing-tier__name">{tier.name}</h3>
              <p className="pricing-tier__price">
                {tier.price}
                <span className="pricing-tier__period"> one-off</span>
              </p>
              <p className="pricing-tier__headline">{tier.headline}</p>
              <p className="pricing-tier__description">{tier.description}</p>
              <ul className="pricing-tier__features">
                {tier.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={requestHrefForTier(tier.id)} className="pricing-tier__cta mic-btn">
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="service-pricing__trial">
          <p className="service-pricing__trial-copy">{TRIAL_COPY}</p>
          <dl className="service-pricing__trial-facts">
            <div>
              <dt>Today</dt>
              <dd>£0</dd>
            </div>
            <div>
              <dt>Charge after trial</dt>
              <dd>£50 / £100 / £300 one-off</dd>
            </div>
            <div>
              <dt>Trial length</dt>
              <dd>{TRIAL_DAYS} days</dd>
            </div>
            <div>
              <dt>Cancel before trial ends</dt>
              <dd>To avoid being charged</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
