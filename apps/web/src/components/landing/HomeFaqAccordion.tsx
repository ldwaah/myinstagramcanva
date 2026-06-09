"use client";

import { useId, useState } from "react";
import { HOME_FAQ } from "@/lib/pricing";

export function HomeFaqAccordion() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleItem(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="home-faq__accordion">
      {HOME_FAQ.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const triggerId = `${baseId}-trigger-${index}`;

        return (
          <div
            key={item.question}
            className={`home-faq__item${isOpen ? " is-open" : ""}`}
          >
            <h3 className="home-faq__question">
              <button
                type="button"
                id={triggerId}
                className="home-faq__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
              >
                <span className="home-faq__trigger-text">{item.question}</span>
                <span className="home-faq__chevron" aria-hidden />
              </button>
            </h3>
            <div
              id={panelId}
              className="home-faq__panel"
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
            >
              <div className="home-faq__panel-inner">
                <p className="home-faq__answer">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
