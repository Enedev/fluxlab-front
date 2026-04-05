describe('Projects page', () => {
  it('renders projects from backend responses', () => {
    cy.intercept('GET', '**/api/projects*', {
      statusCode: 200,
      body: [
        {
          id: 'PR-001',
          name: 'Proyecto Cypress',
          status: 'active',
          client: { name: 'BioLabs' },
          samples: []
        }
      ]
    }).as('getProjects');

    cy.intercept('GET', '**/api/samples/repository*', {
      statusCode: 200,
      body: []
    }).as('getSamplesRepository');

    cy.intercept('GET', '**/api/clients*', {
      statusCode: 200,
      body: [{ id: 'C-1', name: 'BioLabs' }]
    }).as('getClients');

    cy.visitAuthenticated('/projects');

    cy.wait('@getProjects');
    cy.wait('@getSamplesRepository');
    cy.wait('@getClients');

    cy.contains('h1', 'Proyectos de Investigación').should('be.visible');
    cy.contains('Proyecto Cypress').should('be.visible');
  });
});
