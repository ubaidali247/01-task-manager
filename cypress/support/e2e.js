
Cypress.Commands.add('resetDB', () => {
  cy.request('POST', 'http://localhost:3001/api/reset');
});

Cypress.Commands.add('getItems', () => {
  return cy.request('GET', 'http://localhost:3001/api/tasks').its('body');
});

beforeEach(() => {
  cy.resetDB();
});
