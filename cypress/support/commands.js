// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const compareSnapshotCommand = require('cypress-visual-regression/dist/command');
compareSnapshotCommand();

compareSnapshotCommand({
    capture: 'viewport',
    errorThreshold: 0.1
});

const retryOptions = {
    limit: 10,   // max number of retries
    delay: 500   // delay before next iteration, ms
}

// NB: All globe screenshot comparisons are currently disabled.
Cypress.Commands.add('compareGlobeAnimation', (pageName) => {
    cy.wait(70000)
    cy.get('.introjs-skipbutton').click()
    cy.get('#playPause-button').click()
    cy.wait(500)
    cy.compareSnapshot(pageName, 0.5, retryOptions);
})

Cypress.Commands.add('compareExtraLongGlobeAnimation', (pageName, delay=100000) => {
    cy.wait(delay)
    cy.get('.introjs-skipbutton').click()
    cy.get('#playPause-button').click()
    cy.wait(500)
    cy.compareSnapshot(pageName, 0.5, retryOptions);
})

Cypress.Commands.add('comparePage', (pageName) => {
    cy.wait(2500)
    cy.compareSnapshot(pageName, 0.05, retryOptions);
})
