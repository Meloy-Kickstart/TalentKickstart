export default function SignupPage() {
	return (
		<main style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
			<div style={{maxWidth: 560, width: '100%', padding: 24, border: '1px solid #e6e6e6', borderRadius: 8}}>
				<h1 style={{margin: '0 0 12px'}}>Sign up</h1>
				<p style={{margin: '0 0 16px', color: '#555'}}>Create an account to get started.</p>
				<form>
					<label style={{display: 'block', marginBottom: 8}}>
						<div style={{fontSize: 12, color: '#333'}}>Name</div>
						<input name="name" type="text" required style={{width: '100%', padding: 8, marginTop: 6}} />
					</label>
					<label style={{display: 'block', marginTop: 12}}>
						<div style={{fontSize: 12, color: '#333'}}>Email</div>
						<input name="email" type="email" required style={{width: '100%', padding: 8, marginTop: 6}} />
					</label>
					<label style={{display: 'block', marginTop: 12}}>
						<div style={{fontSize: 12, color: '#333'}}>Password</div>
						<input name="password" type="password" required style={{width: '100%', padding: 8, marginTop: 6}} />
					</label>
					<button type="submit" style={{marginTop: 16, padding: '8px 12px'}}>Create account</button>
				</form>
			</div>
		</main>
	)
}
