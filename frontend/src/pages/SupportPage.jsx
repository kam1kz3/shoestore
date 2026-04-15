import { useState } from 'react'
import '../App.css'

const faqs = [
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of delivery. Items must be unworn, in original packaging, and include the receipt. Sale items are final sale.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 5–7 business days. Express shipping (2–3 business days) is available at checkout for an additional fee.',
  },
  {
    q: 'How do I find my size?',
    a: 'Use the size guide on each product page. We list both EU and US sizing. If you are between sizes, we recommend sizing up for a more comfortable fit.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters fulfilment and can no longer be changed.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, we ship to over 40 countries. International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`support-faq-item${open ? ' support-faq-item--open' : ''}`}>
      <button className='support-faq-question' onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <svg
          className={`support-faq-chevron${open ? ' support-faq-chevron--open' : ''}`}
          xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <p className='support-faq-answer'>{a}</p>}
    </div>
  )
}

function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className='support-container'>
      <div className='support-image-col' />

      <div className='support-content-col'>

      {/* FAQ */}
      <section className='support-section'>
        <p className='support-section-label'>Support</p>
        <h2 className='support-section-title'>Frequently Asked Questions</h2>
        <div className='support-faq-list'>
          {faqs.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </section>

      <div className='support-divider' />

      {/* Contact form */}
      <section className='support-section'>
        <p className='support-section-label'>Contact</p>
        <h2 className='support-section-title'>Get in Touch</h2>

        {submitted ? (
          <div className='support-success'>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F388A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className='support-success-title'>Message sent!</p>
            <p className='support-success-sub'>We'll get back to you within 1–2 business days.</p>
            <button className='support-success-reset' onClick={() => setSubmitted(false)}>Send another</button>
          </div>
        ) : (
          <form className='support-form' onSubmit={handleSubmit}>
            <div className='support-form-row'>
              <div className='support-field'>
                <label className='support-label'>Name</label>
                <input
                  className='support-input'
                  type='text'
                  name='name'
                  value={form.name}
                  onChange={handleChange}
                  placeholder='Your name'
                  required
                />
              </div>
              <div className='support-field'>
                <label className='support-label'>Email</label>
                <input
                  className='support-input'
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='your@email.com'
                  required
                />
              </div>
            </div>
            <div className='support-field'>
              <label className='support-label'>Subject</label>
              <input
                className='support-input'
                type='text'
                name='subject'
                value={form.subject}
                onChange={handleChange}
                placeholder='What is this about?'
                required
              />
            </div>
            <div className='support-field'>
              <label className='support-label'>Message</label>
              <textarea
                className='support-input support-textarea'
                name='message'
                value={form.message}
                onChange={handleChange}
                placeholder='Tell us how we can help...'
                rows={5}
                required
              />
            </div>
            <button className='support-submit' type='submit'>Send Message</button>
          </form>
        )}
      </section>

      </div>
    </div>
  )
}

export default SupportPage
