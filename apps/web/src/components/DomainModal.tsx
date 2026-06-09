"use client";

import Link from "next/link";
import { getTenantPreviewUrl, tenantSubdomainsEnabled } from "@/lib/site-urls";

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
  const liveUrl = username ? getTenantPreviewUrl(username) : undefined;
  const defaultHost = username
    ? tenantSubdomainsEnabled()
      ? `${username}.${rootDomain}`
      : liveUrl ?? `https://${rootDomain}/site/${username}`
    : `you.${rootDomain}`;

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
            Point a domain you own (e.g. <strong>www.yourbrand.com</strong>) at our hosting.
            Your site stays live at <code>{defaultHost}</code> until DNS is ready.
          </p>
        </div>

        <div className="domain-modal__body">
          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">What you need</h3>
            <ul className="domain-modal__checklist">
              <li>DNS access at your registrar</li>
              <li>A paid site plan</li>
              <li>Your custom domain ready to connect</li>
            </ul>
          </section>

          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">Steps</h3>
            <ol className="domain-modal__steps">
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">1</span>
                <div>
                  <strong>Pick your domain</strong>
                  <p>
                    We recommend <code>www.yourdomain.com</code>. Root domains often need a
                    redirect to <code>www</code>.
                  </p>
                </div>
              </li>
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">2</span>
                <div>
                  <strong>Add DNS records</strong>
                  <p>
                    Add the CNAME records below at your registrar. Propagation usually takes
                    under an hour, but allow up to 48 hours.
                  </p>
                </div>
              </li>
              <li className="domain-modal__step">
                <span className="domain-modal__step-num">3</span>
                <div>
                  <strong>Connect in dashboard</strong>
                  <p>
                    Go to{" "}
                    <Link href="/dashboard/domains" onClick={onClose}>
                      Custom domains
                    </Link>{" "}
                    and enter your domain. We verify and attach your site.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="domain-modal__section">
            <h3 className="domain-modal__section-title">DNS records</h3>
            <p className="domain-modal__hint">
              Replace <code>yourdomain.com</code> with your domain.
            </p>
            <div className="domain-modal__table-wrap">
              <table className="domain-modal__table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Host</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CNAME</td>
                    <td><code>www</code></td>
                    <td><code>{cnameTarget}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="domain-modal__note">
              Some registrars only accept the host name (<code>www</code>), not the full domain.
            </p>
          </section>

          <section className="domain-modal__faq">
            <h3 className="domain-modal__section-title">Questions</h3>
            <dl>
              <dt>How long does DNS take?</dt>
              <dd>Usually under an hour. Allow up to 48 hours.</dd>
              <dt>Buy the domain here?</dt>
              <dd>No. Buy anywhere, then point DNS at our hosting.</dd>
              <dt>Need help?</dt>
              <dd>
                Email{" "}
                <a href="mailto:support@myinstagramcanva.com">support@myinstagramcanva.com</a>
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
            Connect domain
          </Link>
          <button type="button" className="mic-btn mic-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
