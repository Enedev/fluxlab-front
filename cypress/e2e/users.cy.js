describe('User management page', () => {
  it('loads users list for admin role', () => {
    cy.intercept('GET', '**/api/users', {
      statusCode: 200,
      body: [
        {
          id: 'u-1',
          name: 'Ana Ruiz',
          email: 'ana@lab.com',
          role: 'technician',
          passwordChanged: true,
          last_sign_in_at: null
        }
      ]
    }).as('getUsers');

    cy.visitAuthenticated('/users', 'admin');
    cy.wait('@getUsers');

    cy.contains('h1', 'Gestión de Usuarios').should('be.visible');
    cy.contains('Ana Ruiz').should('exist');
  });
});
