import React from "react";
import "./landing.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "fa-solid fa-user-plus",
      title: "Create Your Account",
      description:
        "Get started by creating your LedgerFlow account and setting up your business.",
    },
    {
      number: "02",
      icon: "fa-solid fa-box-open",
      title: "Add Your Business Data",
      description:
        "Add products, customers, suppliers, and other information you need.",
    },
    {
      number: "03",
      icon: "fa-solid fa-file-invoice-dollar",
      title: "Manage Your Operations",
      description:
        "Handle billing, sales, purchases, inventory, and expenses from one place.",
    },
    {
      number: "04",
      icon: "fa-solid fa-chart-line",
      title: "Track Your Growth",
      description:
        "Use reports and analytics to understand your business and make better decisions.",
    },
  ];

  return (
    <section
      className="landing-section how-section"
      id="how-it-works"
    >

      <div className="landing-section-container">

        <div className="section-heading">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Simple steps.
            <span> Smarter business.</span>
          </h2>

          <p>
            LedgerFlow makes managing your everyday business operations
            simple and organized.
          </p>

        </div>

        <div className="steps-grid">

          {steps.map((step) => (
            <div className="step-card" key={step.number}>

              <div className="step-number">
                {step.number}
              </div>

              <div className="step-icon">
                <i className={step.icon}></i>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;