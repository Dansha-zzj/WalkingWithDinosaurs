describe.skip('Checking the tooltips', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    /* 
    lets check the pop-up tooltips work after page has loaded and do it all
    in one test because of the waiting time...
    */

    it('Tooltips pop-up dialogue test', () => {
        cy.get('.introjs-tooltip')
            .should('be.visible')
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Welcome to the climatearchive!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'This website visualises the results')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'This is the Earth')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can change the view by')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'The toolbar on the left can open')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'These are the model layers')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Mix and match any model data')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'This is the time machine')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can select any period')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Data download')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can double-click anywhere')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'You\'ve made it!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Start exploring the climate archive now.')

        // now close the tooltip box using the done button

        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Done', { matchCase: false })
            .click()
        cy.get('.introjs-tooltipReferenceLayer')
            .should('not.exist')

    })

});