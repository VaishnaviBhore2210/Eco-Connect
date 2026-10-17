import { useState } from 'react'
import './footer.css'

export default function Footer() {
  const [submitted, setSubmitted] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  const openContactForm = (event) => {
    event.preventDefault()
    setContactOpen(true)
    window.setTimeout(() => {
      document.getElementById('eco-contact-query')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <footer className="eco-footer" id="contact">
      <div className="eco-footer-inner">
        <div className="eco-footer-brand">
          <a className="eco-footer-logo" href="#top" aria-label="EcoConnect home">
            <span className="eco-footer-mark">♻️</span> EcoConnect
          </a>
          <p>Waste less. Empower more.</p>
          <p className="eco-footer-description">
            Connecting urban organic-waste generators with rural cooperatives for cleaner communities and stronger livelihoods.
          </p>
        </div>

        <div className="eco-footer-links">
          <h3>Explore</h3>
          <a href="#top">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#contact" onClick={openContactForm}>Contact</a>
        </div>

        <div className="eco-footer-links">
          <h3>Get Involved</h3>
          <a href="#contact" onClick={openContactForm}>List Organic Waste</a>
          <a href="#contact" onClick={openContactForm}>Join as a Cooperative</a>
          <a href="#contact" onClick={openContactForm}>Support Our Mission</a>
        </div>

        <div className="eco-footer-query" id="eco-contact-query">
          <h3>Contact</h3>
          {!contactOpen ? (
            <>
              <p>Have a question or suggestion? We’d love to hear from you.</p>
              <button className="eco-contact-open" type="button" onClick={() => setContactOpen(true)}>Send us a query <span aria-hidden="true">→</span></button>
            </>
          ) : (
            <>
              <p>Send us a message and tell us how we can help.</p>
              {submitted ? (
                <div className="eco-query-success" role="status">
                  <strong>Thank you!</strong>
                  <span>Your query has been submitted in this demo.</span>
                  <button type="button" onClick={() => setSubmitted(false)}>Send another query</button>
                </div>
              ) : (
                <form className="eco-query-form" onSubmit={handleSubmit}>
                  <label>
                    Your name
                    <input name="name" type="text" placeholder="Enter your name" required maxLength="100" />
                  </label>
                  <label>
                    Email address
                    <input name="email" type="email" placeholder="you@example.com" required maxLength="160" />
                  </label>
                  <label>
                    Your query
                    <textarea name="message" placeholder="How can we help?" rows="3" required maxLength="1500" />
                  </label>
                  <button type="submit">Send query <span aria-hidden="true">→</span></button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
      <div className="eco-footer-bottom">
        <span>© {new Date().getFullYear()} EcoConnect. All rights reserved.</span>
        <span>Building a more circular future together.</span>
      </div>
    </footer>
  )
}
