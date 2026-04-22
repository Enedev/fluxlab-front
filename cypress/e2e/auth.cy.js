describe('Authentication and route protection', () => {
  it('redirects to login when trying to access protected route without auth', () => {
    cy.clearAuthState();
    cy.visit('/projects');

    cy.url().should('include', '/login');
    cy.contains('h1', 'Bienvenido').should('be.visible');
  });
});
