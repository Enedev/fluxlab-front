describe('Clients page', () => {
  it('shows create action for admin users', () => {
    cy.intercept('GET', '**/api/clients*', {
      statusCode: 200,
      body: [
        {
          id: 'C-10',
          name: 'Acme Biotech',
          email: 'contacto@acmebio.com',
          phoneNumber: '+57 300 123 4567',
          status: 'active',
          projectsCount: 2
        }
      ]
    }).as('getClients');

    cy.visitAuthenticated('/clients', 'admin');
    cy.wait('@getClients');

    cy.contains('h1', 'Clientes').should('be.visible');
    cy.contains('Acme Biotech').should('be.visible');
    cy.contains('button', 'Registrar nuevo cliente').should('be.visible');
  });

  it('hides create action for non-admin users', () => {
    cy.intercept('GET', '**/api/clients*', {
      statusCode: 200,
      body: []
    }).as('getClients');

    cy.visitAuthenticated('/clients', 'researcher');
    cy.wait('@getClients');

    cy.contains('h1', 'Clientes').should('be.visible');
    cy.contains('button', 'Registrar nuevo cliente').should('not.exist');
  });
});
