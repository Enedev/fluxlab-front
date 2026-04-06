function buildCypressAuth(role = 'admin') {
  const isAdmin = role === 'admin';

  const user = {
    id: 'cypress-user-id',
    email: 'qa@fluxlab.io',
    name: 'Cypress QA',
    role: isAdmin ? 'authenticated' : role,
    passwordChanged: true,
    app_metadata: isAdmin ? { role: 'admin' } : {}
  };

  const session = {
    access_token: 'cypress-access-token',
    token_type: 'bearer',
    user
  };

  return { user, session };
}

Cypress.Commands.add('visitAuthenticated', (path, role = 'admin') => {
  const { user, session } = buildCypressAuth(role);

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('cypress-auth-user', JSON.stringify(user));
      win.localStorage.setItem('cypress-auth-session', JSON.stringify(session));
    }
  });
});

Cypress.Commands.add('clearAuthState', () => {
  cy.clearLocalStorage('cypress-auth-user');
  cy.clearLocalStorage('cypress-auth-session');
});
