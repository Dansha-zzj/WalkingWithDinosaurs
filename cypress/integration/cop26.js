describe('Checking expected cop26 page content', () => {

    

    it('Visit the page first and check the title', () => {
        cy.visit('/cop26.html')
        cy.title()
            .should('include', 'COP26')

    })

    it('Do we have a main title heading', () => {
        cy.get('#mainTitle')
            .should('include.text', 'Which Future Do We Want?')

    })

    // hopefully the tooltips have loaded...lets check

    it('Tooltips pop-up dialogue test', () => {
        cy.get('.introjs-tooltip')
            .should('be.visible')
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Welcome!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'This website shows model projections')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Controls')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can change the view')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'These are the time controls!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Drag the slider')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Layers')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Select different data layers')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Thats it!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Compare the regional')

        // now close the tooltip box using the done button
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Done', { matchCase: false })
            .click()

        // check its gone
        cy.get('.introjs-tooltipReferenceLayer')
            .should('not.exist')

    })

});