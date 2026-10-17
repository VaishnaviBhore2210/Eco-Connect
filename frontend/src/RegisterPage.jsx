import { useEffect, useState } from 'react'

const roleOptions = [
  { value: 'URBAN_WASTE_GENERATOR', label: 'Urban Waste Generator' },
  { value: 'COOPERATIVE_COORDINATOR', label: 'Cooperative Coordinator' },
]

export default function RegisterPage({ onSubmit, saving, error, selectedRole = 'URBAN_WASTE_GENERATOR', onChangeRole, registeredEmail }) {
  const [role, setRole] = useState(selectedRole)
  useEffect(() => setRole(selectedRole), [selectedRole])

  const handleRoleChange = (value) => {
    setRole(value)
    onChangeRole?.(value)
  }

  return (
    <section className="auth-page-centered">
      <div className="auth-card-centered">
        <p className="eyebrow">Join the EcoConnect community</p>
        <h2>Create your account</h2>
        {registeredEmail && <p className="prefilled-email">Email selected: <strong>{registeredEmail}</strong></p>}
        <form className="auth-form" onSubmit={onSubmit}>
          <label>Full name<input name="fullName" autoComplete="name" required maxLength="100" placeholder="Enter your full name" /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="190" placeholder="you@example.com" defaultValue={registeredEmail || ''} /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" required minLength="8" maxLength="72" placeholder="At least 8 characters" /></label>
          <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength="8" maxLength="72" placeholder="Enter the password again" /></label>
          <label>Register as<select name="role" value={role} onChange={(event) => handleRoleChange(event.target.value)} required>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          {role === 'COOPERATIVE_COORDINATOR' && <label>Cooperative / organization name<input name="organizationName" required maxLength="150" placeholder="e.g. Green Valley Cooperative" /></label>}
          <label>{role === 'COOPERATIVE_COORDINATOR' ? 'Cooperative location' : 'Location'}<input name="location" required maxLength="180" placeholder="Area, city" /></label>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <button type="submit" className="primary-button full-width" disabled={saving}>{saving ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch-line">Already registered? <button type="button" className="inline-link" onClick={() => window.dispatchEvent(new CustomEvent('ecoconnect-open-login', { detail: { email: registeredEmail || '' } }))}>Go to Login</button></p>
      </div>
    </section>
  )
}
