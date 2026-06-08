"use client";

import Link from "next/link";

interface DomainModalProps {
  open: boolean;
  onClose: () => void;
  username?: string;
}

export function DomainModal({ open, onClose, username }: DomainModalProps) {
  if (!open) return null;

  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "myinstagramcanva.com";
  const cnameTarget = "sites.myinstagramcanva.com";
  const defaultHost = username
    ? `www.${username}.${rootDomain}`
    : `www.you.${rootDomain}`;

  return (
    <div
      className="domain-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="domain-modal-title"
    >
      <button
        type="button"
        className="domain-modal__backdrop"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="domain-modal__panel domain-modal__panel--wide mic-card mic-card--glass mic-card--glow">
        <div className="domain-modal__header">
          <h2 id="domain-modal-title">Connect your own domain</h2>
          <p className="domain-modal__lede">
            Use a domain you already own (for example <strong>www.yourbrand.com</strong>) so
            visitors see your brand, not a subdomain. Setup takes a few minutes at your
            registrar.
          </p>
        </div>

        <div className="domain-modal__body">
          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">What you will need</h3>
            <ul className="domain-modal__checklist">
              <li>Access to DNS settings at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</li>
              <li>A paid site plan on My Instagram Canva</li>
              <li>Your custom domain ready to point at our hosting</li>
            </ul>
          </section>

          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">Step-by-step</h3>
            <ol className="domain-modal__steps">
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">1</span>
                <div>
                  <strong>Choose your custom domain</strong>
                  <p>
                    We recommend <code>www.yourdomain.com</code> (the <code>www</code> prefix
                    works best with our setup). Your site stays live at{" "}
                    <code>{defaultHost}</code> until DNS has propagated.
                  </p>
                </div>
              </li>
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">2</span>
                <div>
                  <strong>Add DNS records at your registrar</strong>
                  <p>
                    Log in to your domain provider, open DNS or DNS management, and add the
                    records below. Changes can take up to 48 hours to propagate worldwide,
                    though it is often much quicker.
                  </p>
                </div>
              </li>
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">3</span>
                <div>
                  <strong>Connect the domain in your dashboard</strong>
                  <p>
                    After saving your DNS records, go to{" "}
                    <Link href="/dashboard/domains" onClick={onClose}>
                      Custom domains
                    </Link>{" "}
                    in your dashboard and enter your domain. We will verify the records and
                    attach your site.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">Example DNS records</h3>
            <p className="domain-modal__hint">
              Replace <code>yourdomain.com</code> with your actual domain. Use the CNAME
              target shown below (our Netlify hosting endpoint).
            </p>
            <div className="domain-modal__table-wrap">
              <table className="domain-modal__table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Host / Name</th>
                    <th>Value / Points to</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CNAME</td>
                    <td><code>www</code></td>
                    <td><code>{cnameTarget}</code></td>
                  </tr>
                  <tr>
                    <td>CNAME</td>
                    <td><code>www.yourdomain.com</code></td>
                    <td><code>{rootDomain}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="domain-modal__note">
              Some registrars only accept the host name (<code>www</code>) rather than the
              full domain. If you need a root domain (<code>yourdomain.com</code> without{" "}
              <code>www</code>), check whether your provider supports ALIAS, ANAME or a
              redirect from root to <code>www</code>.
            </p>
          </section>

          <section className="domain-modal__faq">
            <h3 className="domain-modal__section-title">Common questions</h3>
            <dl>
              <dt>How long does DNS take?</dt>
              <dd>Usually under an hour, but allow up to 48 hours for full propagation.</dd>
              <dt>Do I need to buy the domain here?</dt>
              <dd>
                No. Purchase your domain anywhere you like, then point it at our hosting
                using the records above.
              </dd>
              <dt>Still stuck?</dt>
              <dd>
                Email{" "}
                <a href="mailto:support@myinstagramcanva.com">support@myinstagramcanva.com</a>{" "}
                with your domain name and registrar, and we will help.
              </dd>
            </dl>
          </section>
        </div>

        <div className="domain-modal__footer">
          <Link
            href="/dashboard/domains"
            className="mic-btn mic-btn-primary"
            onClick={onClose}
          >
            Connect a domain
          </Link>
          <button type="button" className="mic-btn mic-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
