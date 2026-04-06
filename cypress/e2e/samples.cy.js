describe('Samples page', () => {
  it('switches from samples tab to templates tab', () => {
    cy.intercept('GET', '**/api/templates*', {
      statusCode: 200,
      body: []
    }).as('getTemplates');

    cy.intercept('GET', '**/api/samples*', {
      statusCode: 200,
      body: []
    }).as('getSamples');

    cy.visitAuthenticated('/samples');

    cy.contains('h1', 'Muestras y Plantillas').should('be.visible');
    cy.contains('button', 'Muestras').should('be.visible');

    cy.contains('button', 'Plantillas').click();
    cy.wait('@getTemplates');

    cy.contains('button', 'Plantillas').should('be.visible');
  });
});
